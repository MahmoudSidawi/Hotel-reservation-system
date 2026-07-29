import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/apiAuth";
import { markNotificationRead } from "@/backend/controllers/notificationController";
import { jsonError } from "@/backend/middlewares/errorHandler";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const notification = await markNotificationRead(id, user.sub);
    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }
    return NextResponse.json({ notification });
  } catch (error) {
    return jsonError(error);
  }
}
