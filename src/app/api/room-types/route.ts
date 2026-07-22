import { NextRequest, NextResponse } from "next/server";
import { createRoomTypeSchema } from "@/backend/validators/roomType";
import { listRoomTypes, createRoomType } from "@/backend/controllers/roomTypeController";
import { jsonError } from "@/backend/middlewares/errorHandler";

export async function GET() {
  try {
    return NextResponse.json(await listRoomTypes());
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = createRoomTypeSchema.parse(await request.json());
    const roomType = await createRoomType(data);
    return NextResponse.json(roomType, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
