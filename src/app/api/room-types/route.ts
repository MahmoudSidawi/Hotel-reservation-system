import { NextRequest, NextResponse } from "next/server";
import { createRoomTypeSchema } from "@/backend/validators/roomType";
import { listRoomTypes, createRoomType } from "@/backend/controllers/roomTypeController";
import { jsonError } from "@/backend/middlewares/errorHandler";
import { requireRole } from "@/lib/apiAuth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checkIn = searchParams.get("checkIn") || undefined;
    const checkOut = searchParams.get("checkOut") || undefined;

    const roomTypes = await listRoomTypes({ checkIn, checkOut });
    return NextResponse.json(roomTypes);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole("admin");
    const data = createRoomTypeSchema.parse(await request.json());
    const roomType = await createRoomType(data);
    return NextResponse.json(roomType, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}