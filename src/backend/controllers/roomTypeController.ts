import { connectToDatabase } from "@/backend/config/db";
import { NotFoundError } from "@/lib/errors";
import RoomType from "@/backend/models/RoomType";
import Room from "@/backend/models/Room";
import Reservation from "@/backend/models/Reservation";
import { BLOCKING_STATUSES, normalizeDate } from "@/backend/controllers/roomController";
import type { CreateRoomTypeInput, UpdateRoomTypeInput } from "@/backend/validators/roomType";

interface ListRoomTypesOptions {
  checkIn?: string;
  checkOut?: string;
}

export async function listRoomTypes(options?: ListRoomTypesOptions) {
  await connectToDatabase();

  const { checkIn, checkOut } = options || {};

  // If date range is provided, compute room availability
  if (checkIn && checkOut) {
    const start = normalizeDate(checkIn);
    const end = normalizeDate(checkOut);

    // 1. Find all blocking reservations that overlap with the requested stay
    //    dates. BLOCKING_STATUSES (from roomController) is the same set used
    //    everywhere else in the reservation flow — pending/confirmed/checked_in
    //    hold the room; checked_out/cancelled/no_show free it.
    const overlappingReservations = await Reservation.find({
      status: { $in: BLOCKING_STATUSES },
      checkIn: { $lt: end },
      checkOut: { $gt: start },
    }).select("roomId").lean();

    const bookedRoomIds = overlappingReservations.map((r) => r.roomId);

    // 2. Find physical rooms not blocked by an overlapping reservation.
    //    NOTE: `status` is a coarse dashboard label (available/reserved/occupied/
    //    maintenance), not a real-time flag for THIS specific date range — a room
    //    marked "reserved" or "occupied" today can still be free for a future
    //    range. Only "maintenance" should permanently exclude a room here.
    const availableRooms = await Room.find({
      _id: { $nin: bookedRoomIds },
      status: { $ne: "maintenance" },
    }).select("roomTypeId").lean();

    // 3. Extract unique available RoomType IDs
    const availableRoomTypeIds = [
      ...new Set(availableRooms.map((room) => room.roomTypeId.toString())),
    ];

    // 4. Return only room types with available capacity
    return RoomType.find({ _id: { $in: availableRoomTypeIds } })
      .populate("amenities")
      .lean();
  }

  // Fallback: Return all room types if no dates provided
  return RoomType.find().populate("amenities").lean();
}

export async function getRoomTypeById(id: string) {
  await connectToDatabase();
  const roomType = await RoomType.findById(id).populate("amenities").lean();
  if (!roomType) throw new NotFoundError("Room type not found");
  return roomType;
}

export async function createRoomType(data: CreateRoomTypeInput) {
  await connectToDatabase();
  return (await RoomType.create(data)).toObject();
}

export async function updateRoomType(id: string, data: UpdateRoomTypeInput) {
  await connectToDatabase();
  const roomType = await RoomType.findByIdAndUpdate(id, data, { new: true }).lean();
  if (!roomType) throw new NotFoundError("Room type not found");
  return roomType;
}

export async function deleteRoomType(id: string) {
  await connectToDatabase();
  const roomType = await RoomType.findByIdAndDelete(id).lean();
  if (!roomType) throw new NotFoundError("Room type not found");
}