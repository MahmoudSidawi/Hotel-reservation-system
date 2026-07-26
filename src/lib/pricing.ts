// Single source of truth for reservation pricing so the customer booking
// screen, the receptionist walk-in form, and the server all quote the exact
// same amount. Previously each computed its own total (flat fee vs. 12% tax vs.
// no tax), so the price a guest saw could differ from what was charged.
export const TAX_RATE = 0.12;

export type PriceQuote = { subtotal: number; taxes: number; total: number };

export function priceQuote(basePrice: number, nights: number): PriceQuote {
  const safeBase = Math.max(0, basePrice || 0);
  const safeNights = Math.max(0, nights || 0);
  const subtotal = safeBase * safeNights;
  const taxes = Math.round(subtotal * TAX_RATE);
  return { subtotal, taxes, total: subtotal + taxes };
}
