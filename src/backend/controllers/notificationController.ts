import { connectToDatabase } from "@/backend/config/db";
import Notification from "@/backend/models/Notification";
import User from "@/backend/models/User";
import { reservationEvents } from "@/backend/events/reservationEvents";
import type { UserRole } from "@/lib/auth";

// ─── Broadcast helpers ───────────────────────────────────────────────────────

type CreateNotificationInput = {
  recipientId: string;
  recipientRole: UserRole;
  type: string;
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: string;
};

export async function createNotification(input: CreateNotificationInput) {
  await connectToDatabase();
  const n = await Notification.create(input);
  // Push real-time event so connected clients update their notification badge
  reservationEvents.broadcast("RESERVATION_UPDATED", {
    reservationId: input.relatedId ?? "",
    data: { notificationType: input.type, recipientId: input.recipientId },
  });
  return n;
}

/** Deliver to all users matching a given role (e.g. notify all admins). */
export async function notifyRole(
  role: UserRole,
  payload: Omit<CreateNotificationInput, "recipientId" | "recipientRole">
) {
  await connectToDatabase();
  const recipients = await User.find({ role, isActive: true }).select("_id").lean();
  const docs = recipients.map((u) => ({
    recipientId: u._id,
    recipientRole: role,
    ...payload,
  }));
  if (docs.length > 0) {
    await Notification.insertMany(docs);
  }
}

// ─── Query helpers ────────────────────────────────────────────────────────────

export async function getNotificationsForUser(
  userId: string,
  opts: { limit?: number; unreadOnly?: boolean } = {}
) {
  await connectToDatabase();
  const filter: Record<string, unknown> = { recipientId: userId };
  if (opts.unreadOnly) filter.isRead = false;
  return Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(opts.limit ?? 50)
    .lean();
}

export async function markNotificationRead(notificationId: string, userId: string) {
  await connectToDatabase();
  return Notification.findOneAndUpdate(
    { _id: notificationId, recipientId: userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  ).lean();
}

export async function markAllNotificationsRead(userId: string) {
  await connectToDatabase();
  await Notification.updateMany(
    { recipientId: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
}

export async function getUnreadCount(userId: string): Promise<number> {
  await connectToDatabase();
  return Notification.countDocuments({ recipientId: userId, isRead: false });
}

// ─── Reservation lifecycle notification triggers ──────────────────────────────

type NotifiableRes = {
  _id?: unknown;
  userId?: { _id?: unknown; name?: string; email?: string } | string | null;
  guestName?: string | null;
  guestEmail?: string | null;
  roomId?: { roomNumber?: string } | string | null;
  checkIn?: Date | string;
  checkOut?: Date | string;
  totalPrice?: number;
  status?: string;
};

export async function notifyReservationEvent(
  event: "created" | "confirmed" | "cancelled" | "checked_in" | "checked_out" | "modified",
  reservation: NotifiableRes
) {
  await connectToDatabase();

  const resId = String(reservation._id ?? "");
  const guestUserId =
    reservation.userId && typeof reservation.userId === "object"
      ? String((reservation.userId as { _id?: unknown })._id ?? "")
      : typeof reservation.userId === "string"
      ? reservation.userId
      : null;

  const guestName =
    (reservation.userId && typeof reservation.userId === "object"
      ? (reservation.userId as { name?: string }).name
      : null) ?? reservation.guestName ?? "Guest";

  const roomLabel =
    reservation.roomId && typeof reservation.roomId === "object"
      ? `Room ${(reservation.roomId as { roomNumber?: string }).roomNumber ?? ""}`
      : "your room";

  const eventMap: Record<typeof event, { guestTitle: string; guestMsg: string; staffTitle: string; staffMsg: string }> = {
    created: {
      guestTitle: "Reservation Confirmed",
      guestMsg: `Your booking for ${roomLabel} has been received and is pending confirmation.`,
      staffTitle: "New Reservation",
      staffMsg: `${guestName} has created a new reservation for ${roomLabel}.`,
    },
    confirmed: {
      guestTitle: "Booking Approved ✓",
      guestMsg: `Your reservation for ${roomLabel} has been confirmed.`,
      staffTitle: "Reservation Confirmed",
      staffMsg: `Reservation for ${guestName} (${roomLabel}) was confirmed.`,
    },
    cancelled: {
      guestTitle: "Reservation Cancelled",
      guestMsg: `Your booking for ${roomLabel} has been cancelled.`,
      staffTitle: "Reservation Cancelled",
      staffMsg: `${guestName}'s reservation for ${roomLabel} was cancelled.`,
    },
    checked_in: {
      guestTitle: "Welcome! You're Checked In",
      guestMsg: `You have successfully checked into ${roomLabel}. Enjoy your stay!`,
      staffTitle: "Guest Checked In",
      staffMsg: `${guestName} has checked into ${roomLabel}.`,
    },
    checked_out: {
      guestTitle: "Thank You for Staying",
      guestMsg: `Your checkout from ${roomLabel} is complete. We hope to see you again!`,
      staffTitle: "Guest Checked Out",
      staffMsg: `${guestName} has checked out from ${roomLabel}.`,
    },
    modified: {
      guestTitle: "Reservation Updated",
      guestMsg: `Your reservation details for ${roomLabel} have been updated.`,
      staffTitle: "Reservation Modified",
      staffMsg: `Reservation for ${guestName} (${roomLabel}) was modified.`,
    },
  };

  const texts = eventMap[event];
  const notifType = `reservation_${event === "modified" ? "modified" : event}` as string;

  // Notify the guest (if they have an account)
  if (guestUserId) {
    await Notification.create({
      recipientId: guestUserId,
      recipientRole: "guest",
      type: notifType,
      title: texts.guestTitle,
      message: texts.guestMsg,
      relatedId: resId || undefined,
      relatedType: "Reservation",
    });
  }

  // Notify all admins
  const admins = await User.find({ role: "admin", isActive: true }).select("_id").lean();
  if (admins.length > 0) {
    await Notification.insertMany(
      admins.map((a) => ({
        recipientId: a._id,
        recipientRole: "admin",
        type: notifType,
        title: texts.staffTitle,
        message: texts.staffMsg,
        relatedId: resId || undefined,
        relatedType: "Reservation",
      }))
    );
  }
}
