import { NextRequest, NextResponse } from "next/server";
import { updateRoomTypeSchema } from "@/backend/validators/roomType";
import { getRoomTypeById, updateRoomType, deleteRoomType } from "@/backend/controllers/roomTypeController";
import { jsonError } from "@/backend/middlewares/errorHandler";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    return NextResponse.json(await getRoomTypeById(id));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const data = updateRoomTypeSchema.parse(await request.json());
    return NextResponse.json(await updateRoomType(id, data));
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await deleteRoomType(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
