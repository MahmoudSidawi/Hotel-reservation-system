import { NextRequest, NextResponse } from "next/server";
import { updateRoomSchema } from "@/backend/validators/room";
import { getRoomById, updateRoom, deleteRoom } from "@/backend/controllers/roomController";
import { jsonError } from "@/backend/middlewares/errorHandler";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    return NextResponse.json(await getRoomById(id));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const data = updateRoomSchema.parse(await request.json());
    return NextResponse.json(await updateRoom(id, data));
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await deleteRoom(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
