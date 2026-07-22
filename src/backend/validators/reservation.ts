import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createReservationSchema = z.object({
  userId: objectId,
  roomId: objectId,
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  status: z
    .enum(["pending", "confirmed", "checked_in", "checked_out", "cancelled", "no_show"])
    .optional(),
  guests: z.number().int().positive(),
  totalPrice: z.number().positive(),
  createdBy: z.string().optional(),
});

export const updateReservationSchema = createReservationSchema.partial().extend({
  actualCheckIn: z.coerce.date().optional(),
  actualCheckOut: z.coerce.date().optional(),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>;
