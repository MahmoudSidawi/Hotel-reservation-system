import { connectToDatabase } from "@/backend/config/db";
import { NotFoundError, ConflictError } from "@/lib/errors";
import Reservation from "@/backend/models/Reservation";
import Room from "@/backend/models/Room";
import User from "@/backend/models/User";
import { isRoomAvailable } from "@/backend/controllers/roomController";
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

export async function listReservations() {
  await connectToDatabase();
  return Reservation.find().populate("userId").populate("roomId").lean();
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

  const available = await isRoomAvailable(data.roomId, data.checkIn, data.checkOut);
  if (!available) {
    throw new ConflictError("Selected room is not available for the requested dates");
  }

  return (await Reservation.create(data)).toObject();
}

export async function createWalkInBooking(data: WalkInBookingInput, createdBy?: string) {
  await connectToDatabase();

  const available = await isRoomAvailable(data.roomId, data.checkIn, data.checkOut);
  if (!available) {
    throw new ConflictError("Selected room is no longer available for these dates");
  }

  const reservation = await Reservation.create({
    ...data,
    isWalkIn: true,
    status: "confirmed",
    createdBy,
  });

  await Room.findByIdAndUpdate(data.roomId, { status: "reserved" });

  return reservation.toObject();
}

export async function updateReservation(id: string, data: UpdateReservationInput) {
  await connectToDatabase();

  if (data.checkIn || data.checkOut || data.roomId) {
    const existing = await Reservation.findById(id).lean();
    if (!existing) throw new NotFoundError("Reservation not found");

    const roomId = data.roomId ?? String(existing.roomId);
    const checkIn = data.checkIn ?? existing.checkIn;
    const checkOut = data.checkOut ?? existing.checkOut;

    const available = await isRoomAvailable(roomId, checkIn, checkOut, id);
    if (!available) {
      throw new ConflictError("Selected room is not available for the requested dates");
    }
  }

  const reservation = await Reservation.findByIdAndUpdate(id, data, { new: true }).lean();
  if (!reservation) throw new NotFoundError("Reservation not found");
  return reservation;
}

export async function deleteReservation(id: string) {
  await connectToDatabase();
  const reservation = await Reservation.findByIdAndDelete(id).lean();
  if (!reservation) throw new NotFoundError("Reservation not found");
}

export async function cancelReservation(id: string) {
  await connectToDatabase();

  const reservation = await Reservation.findById(id);
  if (!reservation) throw new NotFoundError("Reservation not found");
  if (["checked_in", "checked_out", "cancelled"].includes(reservation.status ?? "")) {
    throw new ConflictError(`Cannot cancel a reservation with status "${reservation.status}"`);
  }

  reservation.status = "cancelled";
  await reservation.save();
  await Room.findByIdAndUpdate(reservation.roomId, { status: "available" });

  return reservation.toObject();
}

export async function checkInReservation(id: string) {
  await connectToDatabase();

  const reservation = await Reservation.findById(id);
  if (!reservation) throw new NotFoundError("Reservation not found");
  if (!["pending", "confirmed"].includes(reservation.status ?? "")) {
    throw new ConflictError(`Cannot check in a reservation with status "${reservation.status}"`);
  }

  reservation.status = "checked_in";
  reservation.actualCheckIn = new Date();
  await reservation.save();
  await Room.findByIdAndUpdate(reservation.roomId, { status: "occupied" });

  return reservation.toObject();
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
  await Room.findByIdAndUpdate(reservation.roomId, { status: "available" });

  return reservation.toObject();
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
