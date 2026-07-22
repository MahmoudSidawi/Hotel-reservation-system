import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createPaymentSchema = z.object({
  reservationId: objectId,
  amount: z.number().positive(),
  method: z.enum(["card", "cash", "transfer"]),
  status: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
  paidAt: z.coerce.date().optional(),
});

export const updatePaymentSchema = createPaymentSchema.partial();

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
