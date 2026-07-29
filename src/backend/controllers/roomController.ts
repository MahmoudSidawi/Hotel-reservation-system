import { connectToDatabase } from "@/backend/config/db";
import { NotFoundError } from "@/lib/errors";
import Room from "@/backend/models/Room";
import Reservation from "@/backend/models/Reservation";
import type { CreateRoomInput, UpdateRoomInput } from "@/backend/validators/room";

// Reservation statuses that still hold a room for their date range.
export const BLOCKING_STATUSES = ["pending", "confirmed", "checked_in"];

export function normalizeDate(dateInput: Date | string): Date {
  const d = typeof dateInput === "string" ? new Date(dateInput) : new Date(dateInput.getTime());
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

type AvailabilityQuery = {
  checkIn: Date | string;
  checkOut: Date | string;
  roomTypeId?: string;
  excludeReservationId?: string;
};

export async function listRooms() {
  await connectToDatabase();
  return Room.find().populate("roomTypeId").lean();
}

export async function getRoomById(id: string) {
  await connectToDatabase();
  const room = await Room.findById(id).populate("roomTypeId").lean();
  if (!room) throw new NotFoundError("Room not found");
  return room;
}

export async function createRoom(data: CreateRoomInput) {
  await connectToDatabase();
  return (await Room.create(data)).toObject();
}

export async function updateRoom(id: string, data: UpdateRoomInput) {
  await connectToDatabase();
  const room = await Room.findByIdAndUpdate(id, data, { new: true }).lean();
  if (!room) throw new NotFoundError("Room not found");
  return room;
}

export async function deleteRoom(id: string) {
  await connectToDatabase();
  const room = await Room.findByIdAndDelete(id).lean();
  if (!room) throw new NotFoundError("Room not found");
}

// Source of truth for booking conflicts: two stays overlap when
// existingCheckIn < requestedCheckOut && requestedCheckIn < existingCheckOut.
export const UNBOOKABLE_STATUSES = ["maintenance", "needs_cleaning", "cleaning"];

export async function getAvailableRooms({
  checkIn,
  checkOut,
  roomTypeId,
  excludeReservationId,
}: AvailabilityQuery) {
  await connectToDatabase();

  const normCheckIn = normalizeDate(checkIn);
  const normCheckOut = normalizeDate(checkOut);

  // Exclude rooms that are in maintenance or currently dirty/being cleaned
  const roomFilter: Record<string, unknown> = { status: { $nin: UNBOOKABLE_STATUSES } };
  if (roomTypeId) roomFilter.roomTypeId = roomTypeId;

  const candidateRooms = await Room.find(roomFilter).populate("roomTypeId").lean();

  const overlapFilter: Record<string, unknown> = {
    status: { $in: BLOCKING_STATUSES },
    checkIn: { $lt: normCheckOut },
    checkOut: { $gt: normCheckIn },
  };
  if (excludeReservationId) overlapFilter._id = { $ne: excludeReservationId };

  const overlappingReservations = await Reservation.find(overlapFilter)
    .select("roomId")
    .lean();
  const bookedRoomIds = new Set(overlappingReservations.map((r) => String(r.roomId)));

  return candidateRooms.filter((room) => !bookedRoomIds.has(String(room._id)));
}

export async function isRoomAvailable(
  roomId: string,
  checkIn: Date | string,
  checkOut: Date | string,
  excludeReservationId?: string
) {
  await connectToDatabase();

  const room = await Room.findById(roomId).lean();
  // Rooms in maintenance, needs_cleaning, or cleaning are unbookable until serviced
  if (!room || UNBOOKABLE_STATUSES.includes(room.status ?? "")) return false;

  const normCheckIn = normalizeDate(checkIn);
  const normCheckOut = normalizeDate(checkOut);

  const overlapFilter: Record<string, unknown> = {
    roomId,
    status: { $in: BLOCKING_STATUSES },
    checkIn: { $lt: normCheckOut },
    checkOut: { $gt: normCheckIn },
  };
  if (excludeReservationId) overlapFilter._id = { $ne: excludeReservationId };

  const conflict = await Reservation.exists(overlapFilter);
  return !conflict;
}
