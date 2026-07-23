// A reservation's guest is either a registered User (userId populated) or a
// walk-in guest recorded directly on the reservation (guestName/guestPhone).
// These helpers read whichever is present so pages don't repeat the fallback.

type PopulatedUser = { name?: string; phone?: string; email?: string } | null | undefined;

type ReservationGuestFields = {
  userId?: PopulatedUser;
  guestName?: string | null;
  guestPhone?: string | null;
  guestEmail?: string | null;
};

export function getGuestName(reservation: ReservationGuestFields): string {
  return reservation.userId?.name ?? reservation.guestName ?? "Guest";
}

export function getGuestPhone(reservation: ReservationGuestFields): string {
  return reservation.userId?.phone ?? reservation.guestPhone ?? "—";
}

export function getGuestEmail(reservation: ReservationGuestFields): string {
  return reservation.userId?.email ?? reservation.guestEmail ?? "—";
}
