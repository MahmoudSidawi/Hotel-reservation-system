import { connectToDatabase } from "@/backend/config/db";
import { NotFoundError } from "@/lib/errors";
import Room from "@/backend/models/Room";
import Reservation from "@/backend/models/Reservation";
import type { CreateRoomInput, UpdateRoomInput } from "@/backend/validators/room";

// Reservation statuses that still hold a room for their date range.
const BLOCKING_STATUSES = ["pending", "confirmed", "checked_in"];

type AvailabilityQuery = {
  checkIn: Date;
  checkOut: Date;
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
export async function getAvailableRooms({
  checkIn,
  checkOut,
  roomTypeId,
  excludeReservationId,
}: AvailabilityQuery) {
  await connectToDatabase();

  const roomFilter: Record<string, unknown> = { status: { $ne: "maintenance" } };
  if (roomTypeId) roomFilter.roomTypeId = roomTypeId;

  const candidateRooms = await Room.find(roomFilter).populate("roomTypeId").lean();

  const overlapFilter: Record<string, unknown> = {
    status: { $in: BLOCKING_STATUSES },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
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
  checkIn: Date,
  checkOut: Date,
  excludeReservationId?: string
) {
  await connectToDatabase();

  const room = await Room.findById(roomId).lean();
  if (!room || room.status === "maintenance") return false;

  const overlapFilter: Record<string, unknown> = {
    roomId,
    status: { $in: BLOCKING_STATUSES },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  };
  if (excludeReservationId) overlapFilter._id = { $ne: excludeReservationId };

  const conflict = await Reservation.exists(overlapFilter);
  return !conflict;
}
