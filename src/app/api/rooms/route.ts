import { NextRequest, NextResponse } from "next/server";
import { createRoomSchema } from "@/backend/validators/room";
import { listRooms, createRoom } from "@/backend/controllers/roomController";
import { jsonError } from "@/backend/middlewares/errorHandler";

export async function GET() {
  try {
    return NextResponse.json(await listRooms());
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = createRoomSchema.parse(await request.json());
    const room = await createRoom(data);
    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
