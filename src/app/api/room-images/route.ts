import { NextRequest, NextResponse } from "next/server";
import { createRoomImageSchema } from "@/backend/validators/roomImage";
import { listRoomImages, createRoomImage } from "@/backend/controllers/roomImageController";
import { jsonError } from "@/backend/middlewares/errorHandler";
import { requireRole } from "@/lib/apiAuth";

export async function GET(request: NextRequest) {
  try {
    const roomTypeId = request.nextUrl.searchParams.get("roomTypeId") ?? undefined;
    return NextResponse.json(await listRoomImages(roomTypeId));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole("admin");
    const data = createRoomImageSchema.parse(await request.json());
    const image = await createRoomImage(data);
    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
