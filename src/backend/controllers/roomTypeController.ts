import { connectToDatabase } from "@/backend/config/db";
import { NotFoundError } from "@/lib/errors";
import RoomType from "@/backend/models/RoomType";
import type { CreateRoomTypeInput, UpdateRoomTypeInput } from "@/backend/validators/roomType";

export async function listRoomTypes() {
  await connectToDatabase();
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
