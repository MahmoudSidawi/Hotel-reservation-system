import { connectToDatabase } from "@/backend/config/db";
import { NotFoundError } from "@/lib/errors";
import Room from "@/backend/models/Room";
import type { CreateRoomInput, UpdateRoomInput } from "@/backend/validators/room";

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
