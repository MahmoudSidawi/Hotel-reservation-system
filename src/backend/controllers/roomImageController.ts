import { connectToDatabase } from "@/backend/config/db";
import { NotFoundError } from "@/lib/errors";
import RoomImage from "@/backend/models/RoomImage";
import type { CreateRoomImageInput, UpdateRoomImageInput } from "@/backend/validators/roomImage";

export async function listRoomImages(roomTypeId?: string) {
  await connectToDatabase();
  const filter = roomTypeId ? { roomTypeId } : {};
  return RoomImage.find(filter).lean();
}

export async function getRoomImageById(id: string) {
  await connectToDatabase();
  const image = await RoomImage.findById(id).lean();
  if (!image) throw new NotFoundError("Room image not found");
  return image;
}

export async function createRoomImage(data: CreateRoomImageInput) {
  await connectToDatabase();
  return (await RoomImage.create(data)).toObject();
}

export async function updateRoomImage(id: string, data: UpdateRoomImageInput) {
  await connectToDatabase();
  const image = await RoomImage.findByIdAndUpdate(id, data, { new: true }).lean();
  if (!image) throw new NotFoundError("Room image not found");
  return image;
}

export async function deleteRoomImage(id: string) {
  await connectToDatabase();
  const image = await RoomImage.findByIdAndDelete(id).lean();
  if (!image) throw new NotFoundError("Room image not found");
}
