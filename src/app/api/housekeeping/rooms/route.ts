import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";
import { connectToDatabase } from "@/backend/config/db";
import Room from "@/backend/models/Room";
import { jsonError } from "@/backend/middlewares/errorHandler";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_request: NextRequest) {
  try {
    await requireRole("admin", "receptionist", "housekeeping");
    await connectToDatabase();
    // Housekeeping sees only rooms that need attention
    const rooms = await Room.find({
      status: { $in: ["needs_cleaning", "cleaning", "available", "occupied"] },
    })
      .populate("roomTypeId", "name")
      .sort({ floor: 1, roomNumber: 1 })
      .lean();
    return NextResponse.json(rooms);
  } catch (error) {
    return jsonError(error);
  }
}

const StatusSchema = z.object({
  status: z.enum(["needs_cleaning", "cleaning", "available"]),
  notes: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireRole("admin", "receptionist", "housekeeping");
    const body = await request.json();
    const { roomId, ...data } = z
      .object({ roomId: z.string(), status: StatusSchema.shape.status, notes: z.string().optional() })
      .parse(body);

    await connectToDatabase();
    const update: Record<string, unknown> = { status: data.status };
    if (data.status === "available") {
      update.lastCleaned = new Date();
    }
    if (data.notes !== undefined) update.notes = data.notes;

    const room = await Room.findByIdAndUpdate(roomId, update, { new: true })
      .populate("roomTypeId", "name")
      .lean();

    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

    // Trigger housekeeping notification
    const { notifyHousekeepingEvent } = await import("@/backend/controllers/notificationController");
    await notifyHousekeepingEvent(roomId, room.roomNumber, data.status, user.name);

    return NextResponse.json(room);
  } catch (error) {
    return jsonError(error);
  }
}
