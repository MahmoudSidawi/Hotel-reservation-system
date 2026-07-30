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
  if (reservation.guestName && reservation.guestName.trim()) {
    return reservation.guestName;
  }
  return reservation.userId?.name ?? "Guest";
}

export function getGuestPhone(reservation: ReservationGuestFields): string {
  if (reservation.guestPhone && reservation.guestPhone.trim()) {
    return reservation.guestPhone;
  }
  return reservation.userId?.phone ?? "—";
}

export function getGuestEmail(reservation: ReservationGuestFields): string {
  if (reservation.guestEmail && reservation.guestEmail.trim()) {
    return reservation.guestEmail;
  }
  return reservation.userId?.email ?? "—";
}
