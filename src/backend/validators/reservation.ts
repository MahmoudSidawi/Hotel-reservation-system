import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

const reservationStatus = z.enum([
  "pending",
  "confirmed",
  "checked_in",
  "checked_out",
  "cancelled",
  "no_show",
]);

export const createReservationSchema = z
  .object({
    userId: objectId.optional(),
    guestName: z.string().min(1).optional(),
    guestPhone: z.string().min(1).optional(),
    guestEmail: z.string().email().optional(),
    guestIdNumber: z.string().optional(),
    isWalkIn: z.boolean().optional(),
    roomId: objectId,
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
    status: reservationStatus.optional(),
    guests: z.number().int().positive(),
    totalPrice: z.number().positive(),
    specialRequests: z.string().optional(),
    createdBy: z.string().optional(),
  })
  .refine((data) => Boolean(data.userId) || Boolean(data.guestName && data.guestPhone), {
    message: "Either userId or guestName + guestPhone is required",
    path: ["userId"],
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "checkOut must be after checkIn",
    path: ["checkOut"],
  });

export const updateReservationSchema = z.object({
  userId: objectId.optional(),
  guestName: z.string().min(1).optional(),
  guestPhone: z.string().min(1).optional(),
  guestEmail: z.string().email().optional(),
  guestIdNumber: z.string().optional(),
  roomId: objectId.optional(),
  checkIn: z.coerce.date().optional(),
  checkOut: z.coerce.date().optional(),
  status: reservationStatus.optional(),
  guests: z.number().int().positive().optional(),
  totalPrice: z.number().positive().optional(),
  specialRequests: z.string().optional(),
  actualCheckIn: z.coerce.date().optional(),
  actualCheckOut: z.coerce.date().optional(),
});

export const walkInBookingSchema = z
  .object({
    guestName: z.string().min(1),
    guestPhone: z.string().min(1),
    guestEmail: z.string().email().optional(),
    guestIdNumber: z.string().optional(),
    guests: z.number().int().positive(),
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
    roomId: objectId,
    totalPrice: z.number().positive(),
    specialRequests: z.string().optional(),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "checkOut must be after checkIn",
    path: ["checkOut"],
  });

export const checkoutChargesSchema = z.object({
  additionalFees: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>;
export type WalkInBookingInput = z.infer<typeof walkInBookingSchema>;
export type CheckoutChargesInput = z.infer<typeof checkoutChargesSchema>;
