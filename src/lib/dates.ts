// Today as `YYYY-MM-DD`, the format <input type="date"> wants for `min`.
// Feeding this to a date picker greys out every earlier day.
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// True when a date falls on an earlier calendar day than today. Compared as
// whole UTC days so a stay starting *today* is never rejected just because the
// picker submitted midnight and it is now the afternoon.
export function isBeforeToday(value: string | Date): boolean {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const day = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const now = new Date();
  return day < Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

// DST-safe night counting. Subtracting raw millisecond timestamps and dividing
// by 86_400_000 is off by one on the two days each year that are not exactly 24
// hours (spring-forward / fall-back). Counting whole calendar days in UTC avoids
// that: hotel nights are calendar-based, not clock-based.
export function nightsBetween(checkIn: string | Date, checkOut: string | Date): number {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  const startUTC = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const endUTC = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  const nights = Math.round((endUTC - startUTC) / 86_400_000);
  return nights > 0 ? nights : 0;
}
