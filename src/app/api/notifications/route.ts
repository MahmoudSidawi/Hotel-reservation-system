import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/apiAuth";
import {
  getNotificationsForUser,
  markAllNotificationsRead,
  getUnreadCount,
} from "@/backend/controllers/notificationController";
import { jsonError } from "@/backend/middlewares/errorHandler";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const limit = Math.min(100, Number(searchParams.get("limit") ?? "50"));

    const [notifications, unreadCount] = await Promise.all([
      getNotificationsForUser(user.sub, { unreadOnly, limit }),
      getUnreadCount(user.sub),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST() {
  // Mark all as read
  try {
    const user = await requireUser();
    await markAllNotificationsRead(user.sub);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
