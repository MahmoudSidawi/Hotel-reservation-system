import { NextRequest, NextResponse } from "next/server";
import { updateRoomImageSchema } from "@/backend/validators/roomImage";
import { getRoomImageById, updateRoomImage, deleteRoomImage } from "@/backend/controllers/roomImageController";
import { jsonError } from "@/backend/middlewares/errorHandler";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    return NextResponse.json(await getRoomImageById(id));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const data = updateRoomImageSchema.parse(await request.json());
    return NextResponse.json(await updateRoomImage(id, data));
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await deleteRoomImage(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
