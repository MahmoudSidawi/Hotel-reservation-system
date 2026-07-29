import { connectToDatabase } from "@/backend/config/db";
import { NotFoundError, ConflictError } from "@/lib/errors";
import Reservation from "@/backend/models/Reservation";
import Room from "@/backend/models/Room";
import User from "@/backend/models/User";
import { isRoomAvailable, BLOCKING_STATUSES, normalizeDate } from "@/backend/controllers/roomController";
import { reservationEvents } from "@/backend/events/reservationEvents";
import { notifyReservationEvent } from "@/backend/controllers/notificationController";
import { nightsBetween } from "@/lib/dates";
import { priceQuote } from "@/lib/pricing";
import type {
  CreateReservationInput,
  UpdateReservationInput,
  WalkInBookingInput,
  CheckoutChargesInput,
} from "@/backend/validators/reservation";

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Maps a reservation status to the coarse room-status label so dashboards and
// the room list stay in sync no matter which code path changed the reservation.
function roomStatusForReservation(status: string): "available" | "reserved" | "occupied" {
  if (status === "checked_in") return "occupied";
  if (status === "pending" || status === "confirmed") return "reserved";
  // checked_out / cancelled / no_show all free the room.
  return "available";
}

// Authoritative server-side price so a tampered client payload (totalPrice: 1)
// can never set the amount owed. Returns the quote plus the room's capacity so
// callers can enforce occupancy in the same round trip.
async function quoteReservation(roomId: string, checkIn: Date, checkOut: Date) {
  const room = await Room.findById(roomId).populate("roomTypeId").lean();
  if (!room) throw new NotFoundError("Room not found");

  const roomType = room.roomTypeId as unknown as
    | { basePrice?: number; capacity?: number }
    | null;
  const basePrice = roomType?.basePrice ?? 0;
  const capacity = roomType?.capacity ?? 0;

  const nights = nightsBetween(checkIn, checkOut);
  const { subtotal, taxes, total } = priceQuote(basePrice, nights);

  return { nights, subtotal, taxes, total, capacity };
}

// Closes the double-booking race. isRoomAvailable() + create() is a
// check-then-act with no transaction, so two concurrent requests can both pass
// the check. After creating, we re-scan for any OTHER blocking reservation that
// overlaps this room's dates; if one exists that was created first (ordered by
// createdAt then _id), THIS request is the loser and rolls itself back. Both
// racers apply the same deterministic tie-break, so exactly one survives.
async function createReservationAtomic(payload: Record<string, unknown>) {
  const normCheckIn = normalizeDate(payload.checkIn as Date | string);
  const normCheckOut = normalizeDate(payload.checkOut as Date | string);
  payload.checkIn = normCheckIn;
  payload.checkOut = normCheckOut;

  const available = await isRoomAvailable(
    payload.roomId as string,
    normCheckIn,
    normCheckOut
  );
  if (!available) {
    throw new ConflictError(
      "This room is unavailable for the selected dates. Please choose different dates or another room."
    );
  }
  if (!payload.userId && payload.guestEmail && typeof payload.guestEmail === "string") {
    const matchedUser = await User.findOne({ email: (payload.guestEmail as string).toLowerCase().trim() });
    if (matchedUser) {
      payload.userId = matchedUser._id;
      if (!payload.guestName) payload.guestName = matchedUser.name;
    }
  } else if (payload.userId) {
    const owner = await User.findById(payload.userId).lean();
    if (owner) {
      payload.guestName = owner.name;
      payload.guestEmail = owner.email;
    }
  }

  const created = await Reservation.create(payload);

  const conflict = await Reservation.findOne({
    _id: { $ne: created._id },
    roomId: payload.roomId,
    status: { $in: BLOCKING_STATUSES },
    checkIn: { $lt: normCheckOut },
    checkOut: { $gt: normCheckIn },
  })
    .sort({ createdAt: 1, _id: 1 })
    .lean();

  if (conflict) {
    const conflictKey = `${new Date(conflict.createdAt as Date).getTime()}_${String(conflict._id)}`;
    const myKey = `${new Date(created.createdAt as Date).getTime()}_${String(created._id)}`;
    // Someone booked this room+dates first — undo our insert and fail.
    if (conflictKey < myKey) {
      await Reservation.findByIdAndDelete(created._id);
      throw new ConflictError(
        "This room is unavailable for the selected dates. Please choose different dates or another room."
      );
    }
  }

  return created;
}

async function populateReservation(id: unknown) {
  return Reservation.findById(id)
    .populate({ path: "roomId", populate: { path: "roomTypeId" } })
    .populate("userId")
    .lean();
}

// Bounded so an ever-growing collection can't return an unbounded payload.
const LIST_LIMIT = 500;

export async function listReservations() {
  await connectToDatabase();
  return Reservation.find()
    .sort({ createdAt: -1 })
    .limit(LIST_LIMIT)
    .populate("userId")
    .populate("roomId")
    .lean();
}

export async function listReservationsByUser(userId: string) {
  await connectToDatabase();
  return Reservation.find({ userId })
    .populate({ path: "roomId", populate: { path: "roomTypeId" } })
    .sort({ checkIn: -1 })
    .lean();
}

export async function getReservationById(id: string) {
  await connectToDatabase();
  const reservation = await Reservation.findById(id)
    .populate("userId")
    .populate("roomId")
    .lean();
  if (!reservation) throw new NotFoundError("Reservation not found");
  return reservation;
}

type SearchParams = {
  query?: string;
  status?: string;
  sortBy?: "checkIn" | "checkOut" | "createdAt";
  sortDir?: "asc" | "desc";
};

export async function searchReservations({
  query,
  status,
  sortBy = "checkIn",
  sortDir = "asc",
}: SearchParams) {
  await connectToDatabase();

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  if (query?.trim()) {
    const trimmed = query.trim();
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(trimmed);
    const regex = new RegExp(trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const [matchingRooms, matchingUsers] = await Promise.all([
      Room.find({ roomNumber: regex }).select("_id").lean(),
      User.find({ name: regex }).select("_id").lean(),
    ]);

    const orConditions: Record<string, unknown>[] = [
      { guestName: regex },
      { guestPhone: regex },
      { roomId: { $in: matchingRooms.map((r) => r._id) } },
      { userId: { $in: matchingUsers.map((u) => u._id) } },
    ];
    if (isObjectId) orConditions.push({ _id: trimmed });

    filter.$or = orConditions;
  }

  return Reservation.find(filter)
    .populate("userId")
    .populate("roomId")
    .sort({ [sortBy]: sortDir === "desc" ? -1 : 1 })
    .lean();
}

export async function createReservation(data: CreateReservationInput) {
  await connectToDatabase();

  const normCheckIn = normalizeDate(data.checkIn);
  const normCheckOut = normalizeDate(data.checkOut);

  const available = await isRoomAvailable(data.roomId, normCheckIn, normCheckOut);
  if (!available) {
    throw new ConflictError(
      "This room is unavailable for the selected dates. Please choose different dates or another room."
    );
  }

  const quote = await quoteReservation(data.roomId, normCheckIn, normCheckOut);
  if (quote.capacity > 0 && data.guests > quote.capacity) {
    throw new ConflictError(
      `This room holds up to ${quote.capacity} guest(s); you requested ${data.guests}.`
    );
  }

  // Price is computed server-side; a client-supplied totalPrice is ignored.
  const created = await createReservationAtomic({
    ...data,
    checkIn: normCheckIn,
    checkOut: normCheckOut,
    totalPrice: quote.total,
  });

  const result = (await populateReservation(created._id)) || created.toObject();

  console.log("[createReservation] Created & Populated in DB:", {
    id: result._id,
    userId: result.userId,
    guestName: result.guestName,
    guestEmail: result.guestEmail,
    createdBy: result.createdBy,
  });

  reservationEvents.broadcast("RESERVATION_CREATED", {
    reservationId: String(result._id),
    userId: result.userId ? String((result.userId as any)._id || result.userId) : undefined,
    status: result.status,
    data: result as any,
  });
  notifyReservationEvent("created", result as Record<string, unknown>);

  return result;
}

export async function createWalkInBooking(data: WalkInBookingInput, createdBy?: string) {
  await connectToDatabase();

  const normCheckIn = normalizeDate(data.checkIn);
  const normCheckOut = normalizeDate(data.checkOut);

  const available = await isRoomAvailable(data.roomId, normCheckIn, normCheckOut);
  if (!available) {
    throw new ConflictError(
      "This room is unavailable for the selected dates. Please choose different dates or another room."
    );
  }

  const quote = await quoteReservation(data.roomId, normCheckIn, normCheckOut);
  if (quote.capacity > 0 && data.guests > quote.capacity) {
    throw new ConflictError(
      `This room holds up to ${quote.capacity} guest(s); you requested ${data.guests}.`
    );
  }

  const reservation = await createReservationAtomic({
    ...data,
    checkIn: normCheckIn,
    checkOut: normCheckOut,
    totalPrice: quote.total,
    isWalkIn: true,
    status: "confirmed",
    createdBy,
  });

  await Room.findByIdAndUpdate(data.roomId, { status: "reserved" });

  const result = (await populateReservation(reservation._id)) || reservation.toObject();

  reservationEvents.broadcast("RESERVATION_CREATED", {
    reservationId: String(result._id),
    userId: result.userId ? String((result.userId as any)._id || result.userId) : undefined,
    status: result.status,
    data: result as any,
  });
  notifyReservationEvent("created", result as Record<string, unknown>);

  return result;
}

// Allowed status transitions. Anything not listed is rejected so the workflow
// can't jump straight to, say, checked_out without a check-in.
const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "checked_in", "cancelled", "no_show"],
  confirmed: ["checked_in", "cancelled", "no_show"],
  checked_in: ["checked_out"],
  checked_out: [],
  cancelled: [],
  no_show: [],
};

export async function updateReservation(id: string, data: UpdateReservationInput) {
  await connectToDatabase();

  const reservation = await Reservation.findById(id);
  if (!reservation) throw new NotFoundError("Reservation not found");

  const currentStatus = reservation.status ?? "pending";
  const isTerminal = ["checked_out", "cancelled", "no_show"].includes(currentStatus);

  const datesOrRoomChanging =
    (data.checkIn && data.checkIn.getTime() !== reservation.checkIn.getTime()) ||
    (data.checkOut && data.checkOut.getTime() !== reservation.checkOut.getTime()) ||
    (data.roomId && data.roomId !== String(reservation.roomId));

  // A finished/cancelled booking is immutable except through a fresh booking.
  if (isTerminal && (datesOrRoomChanging || data.guests !== undefined)) {
    throw new ConflictError(
      `Cannot modify a reservation with status "${currentStatus}".`
    );
  }

  // Validate any status change against the state machine, and apply the same
  // side effects (room status, actual timestamps, arrival-date guard) the
  // dedicated endpoints use — so a raw PATCH can't desync Room.status.
  if (data.status && data.status !== currentStatus) {
    const allowed = STATUS_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(data.status)) {
      throw new ConflictError(
        `Cannot change status from "${currentStatus}" to "${data.status}".`
      );
    }
    if (data.status === "checked_in") {
      const todayStart = startOfDay(new Date());
      if (todayStart < startOfDay(reservation.checkIn)) {
        reservation.checkIn = todayStart;
      }
      reservation.actualCheckIn = new Date();
      await Room.findByIdAndUpdate(reservation.roomId, { status: "occupied" });
    }
    if (data.status === "checked_out") {
      reservation.actualCheckOut = new Date();
      await Room.findByIdAndUpdate(reservation.roomId, { status: "needs_cleaning" });
    }
    if (data.status === "cancelled" || data.status === "no_show") {
      await Room.findByIdAndUpdate(reservation.roomId, { status: "available" });
    }
    reservation.status = data.status;
  }

  const nextRoomId = data.roomId ?? String(reservation.roomId);
  const normNextCheckIn = normalizeDate(data.checkIn ?? reservation.checkIn);
  const normNextCheckOut = normalizeDate(data.checkOut ?? reservation.checkOut);
  const nextGuests = data.guests ?? reservation.guests;

  if (datesOrRoomChanging) {
    const available = await isRoomAvailable(nextRoomId, normNextCheckIn, normNextCheckOut, id);
    if (!available) {
      throw new ConflictError(
        "This room is unavailable for the selected dates. Please choose different dates or another room."
      );
    }
  }

  // Re-quote whenever the priced inputs (room or dates) change, and re-check
  // capacity whenever the room, dates, or guest count change.
  if (datesOrRoomChanging || data.guests !== undefined) {
    const quote = await quoteReservation(nextRoomId, normNextCheckIn, normNextCheckOut);
    if (quote.capacity > 0 && nextGuests > quote.capacity) {
      throw new ConflictError(
        `This room holds up to ${quote.capacity} guest(s); you requested ${nextGuests}.`
      );
    }
    if (datesOrRoomChanging) {
      reservation.totalPrice = quote.total;
    }
  }

  // Apply the remaining editable fields.
  if (data.roomId !== undefined) reservation.roomId = data.roomId as never;
  if (data.checkIn !== undefined) reservation.checkIn = normNextCheckIn;
  if (data.checkOut !== undefined) reservation.checkOut = normNextCheckOut;
  if (data.guests !== undefined) reservation.guests = data.guests;
  if (data.guestName !== undefined) reservation.guestName = data.guestName;
  if (data.guestPhone !== undefined) reservation.guestPhone = data.guestPhone;
  if (data.guestEmail !== undefined) reservation.guestEmail = data.guestEmail;
  if (data.guestIdNumber !== undefined) reservation.guestIdNumber = data.guestIdNumber;
  if (data.specialRequests !== undefined) reservation.specialRequests = data.specialRequests;
  // Staff may override price explicitly (e.g. a comp or discount) only when
  // dates/room did not just recompute it.
  if (data.totalPrice !== undefined && !datesOrRoomChanging) {
    reservation.totalPrice = data.totalPrice;
  }

  await reservation.save();

  // Keep the room's coarse status aligned with the reservation's.
  await Room.findByIdAndUpdate(reservation.roomId, {
    status: roomStatusForReservation(reservation.status ?? "pending"),
  });

  const updated = (await populateReservation(id)) || reservation.toObject();

  reservationEvents.broadcast("RESERVATION_UPDATED", {
    reservationId: String((updated as any)._id),
    userId: (updated as any).userId
      ? String((updated as any).userId._id || (updated as any).userId)
      : undefined,
    status: (updated as any).status,
    data: updated as any,
  });

  return updated;
}

export async function deleteReservation(id: string) {
  await connectToDatabase();
  const reservation = await Reservation.findByIdAndDelete(id).lean();
  if (!reservation) throw new NotFoundError("Reservation not found");

  // Free the room if the deleted booking was still holding it.
  if (BLOCKING_STATUSES.includes(reservation.status ?? "")) {
    await Room.findByIdAndUpdate(reservation.roomId, { status: "available" });
  }

  reservationEvents.broadcast("RESERVATION_DELETED", {
    reservationId: String(id),
    userId: reservation.userId ? String(reservation.userId) : undefined,
  });
}

export async function cancelReservation(id: string) {
  await connectToDatabase();

  const reservation = await Reservation.findById(id);
  if (!reservation) throw new NotFoundError("Reservation not found");
  if (["checked_in", "checked_out", "cancelled", "no_show"].includes(reservation.status ?? "")) {
    throw new ConflictError(`Cannot cancel a reservation with status "${reservation.status}"`);
  }

  reservation.status = "cancelled";
  await reservation.save();
  await Room.findByIdAndUpdate(reservation.roomId, { status: "available" });

  const result = (await populateReservation(id)) || reservation.toObject();

  reservationEvents.broadcast("RESERVATION_CANCELLED", {
    reservationId: String(id),
    userId: (result as any).userId
      ? String((result as any).userId._id || (result as any).userId)
      : undefined,
    status: "cancelled",
    data: result as any,
  });
  notifyReservationEvent("cancelled", result as Record<string, unknown>);

  return result;
}

export async function markNoShow(id: string) {
  await connectToDatabase();

  const reservation = await Reservation.findById(id);
  if (!reservation) throw new NotFoundError("Reservation not found");
  if (!["pending", "confirmed"].includes(reservation.status ?? "")) {
    throw new ConflictError(
      `Cannot mark a reservation with status "${reservation.status}" as no-show.`
    );
  }
  // A no-show can only be recorded once the arrival date has actually passed.
  if (startOfDay(new Date()) < startOfDay(reservation.checkIn)) {
    throw new ConflictError("Cannot mark a no-show before the arrival date.");
  }

  reservation.status = "no_show";
  await reservation.save();
  await Room.findByIdAndUpdate(reservation.roomId, { status: "available" });

  const result = (await populateReservation(id)) || reservation.toObject();

  reservationEvents.broadcast("RESERVATION_UPDATED", {
    reservationId: String(id),
    userId: (result as any).userId
      ? String((result as any).userId._id || (result as any).userId)
      : undefined,
    status: "no_show",
    data: result as any,
  });

  return result;
}

export async function checkInReservation(id: string) {
  await connectToDatabase();

  const reservation = await Reservation.findById(id);
  if (!reservation) throw new NotFoundError("Reservation not found");
  if (!["pending", "confirmed"].includes(reservation.status ?? "")) {
    throw new ConflictError(`Cannot check in a reservation with status "${reservation.status}"`);
  }
  // If checked in early before scheduled checkIn date, update checkIn to today
  const todayStart = startOfDay(new Date());
  if (todayStart < startOfDay(reservation.checkIn)) {
    reservation.checkIn = todayStart;
  }

  reservation.status = "checked_in";
  reservation.actualCheckIn = new Date();
  await reservation.save();
  await Room.findByIdAndUpdate(reservation.roomId, { status: "occupied" });

  const result = (await populateReservation(id)) || reservation.toObject();

  reservationEvents.broadcast("RESERVATION_CHECKED_IN", {
    reservationId: String(id),
    userId: (result as any).userId
      ? String((result as any).userId._id || (result as any).userId)
      : undefined,
    status: "checked_in",
    data: result as any,
  });

  return result;
}

export async function checkOutReservation(id: string, charges: CheckoutChargesInput) {
  await connectToDatabase();

  const reservation = await Reservation.findById(id);
  if (!reservation) throw new NotFoundError("Reservation not found");
  if (reservation.status !== "checked_in") {
    throw new ConflictError(`Cannot check out a reservation with status "${reservation.status}"`);
  }

  const additionalFees = charges.additionalFees ?? 0;
  reservation.status = "checked_out";
  reservation.actualCheckOut = new Date();
  if (additionalFees > 0) {
    reservation.totalPrice = (reservation.totalPrice ?? 0) + additionalFees;
  }
  await reservation.save();
  await Room.findByIdAndUpdate(reservation.roomId, { status: "needs_cleaning" });

  const result = (await populateReservation(id)) || reservation.toObject();

  reservationEvents.broadcast("RESERVATION_CHECKED_OUT", {
    reservationId: String(id),
    userId: (result as any).userId
      ? String((result as any).userId._id || (result as any).userId)
      : undefined,
    status: "checked_out",
    data: result as any,
  });

  return result;
}

export async function getTodaysArrivals() {
  await connectToDatabase();
  const { start, end } = todayRange();
  return Reservation.find({
    checkIn: { $gte: start, $lt: end },
    status: { $in: ["pending", "confirmed"] },
  })
    .populate("userId")
    .populate("roomId")
    .lean();
}

export async function getTodaysDepartures() {
  await connectToDatabase();
  const { start, end } = todayRange();
  return Reservation.find({
    checkOut: { $gte: start, $lt: end },
    status: "checked_in",
  })
    .populate("userId")
    .populate("roomId")
    .lean();
}

export async function getCurrentGuests() {
  await connectToDatabase();
  return Reservation.find({ status: "checked_in" }).populate("userId").populate("roomId").lean();
}
