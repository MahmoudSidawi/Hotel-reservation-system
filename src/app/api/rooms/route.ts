import { NextRequest, NextResponse } from "next/server";
import { createRoomSchema } from "@/backend/validators/room";
import { listRooms, createRoom } from "@/backend/controllers/roomController";
import { jsonError } from "@/backend/middlewares/errorHandler";
import { requireRole } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    return NextResponse.json(await listRooms());
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole("admin");
    const data = createRoomSchema.parse(await request.json());
    const room = await createRoom(data);
    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
