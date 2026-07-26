// Guest notification hook (booking confirmations, cancellations, etc.).
//
// This is the single integration point for out-of-band notifications. It is
// intentionally transport-agnostic: no SMTP dependency is bundled, so out of
// the box it records a structured log line. To actually send email, wire a
// provider here (e.g. nodemailer with SMTP_* env vars, or a transactional
// email API) — every reservation lifecycle event already flows through this
// function, so nothing else needs to change.

type NotifiableReservation = {
  _id?: unknown;
  guestEmail?: string | null;
  userId?: { email?: string | null; name?: string | null } | null;
  guestName?: string | null;
  checkIn?: Date | string;
  checkOut?: Date | string;
  totalPrice?: number;
} | null;

export type ReservationNotification = "created" | "cancelled" | "checked_in" | "checked_out";

const SUBJECTS: Record<ReservationNotification, string> = {
  created: "Your reservation is confirmed",
  cancelled: "Your reservation has been cancelled",
  checked_in: "Welcome — you're checked in",
  checked_out: "Thank you for staying with us",
};

export async function notifyReservation(
  event: ReservationNotification,
  reservation: NotifiableReservation
): Promise<void> {
  if (!reservation) return;

  const to = reservation.userId?.email ?? reservation.guestEmail ?? null;
  if (!to) return; // No contact address on file (e.g. some walk-ins).

  const payload = {
    to,
    subject: SUBJECTS[event],
    reservationId: reservation._id ? String(reservation._id) : undefined,
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    total: reservation.totalPrice,
  };

  // Replace this log with a real transport to start delivering email.
  console.info("[notification]", JSON.stringify(payload));
}
