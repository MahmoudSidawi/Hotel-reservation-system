import { Schema, models, model, type InferSchemaType } from "mongoose";

const ReservationSchema = new Schema(
  {
    // Registered guest, when the booking was made by a logged-in user.
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    // Walk-in guest details, used instead of userId when booked at the front desk
    // without requiring the guest to have an account.
    guestName: { type: String },
    guestPhone: { type: String },
    guestEmail: { type: String },
    guestIdNumber: { type: String },
    isWalkIn: { type: Boolean, default: false },
    roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    // Planned/booked dates
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    // Set when front desk actually checks the guest in/out
    actualCheckIn: { type: Date },
    actualCheckOut: { type: Date },
    status: {
      type: String,
      enum: ["pending", "confirmed", "checked_in", "checked_out", "cancelled", "no_show"],
      default: "pending",
    },
    guests: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    specialRequests: { type: String },
    createdBy: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type Reservation = InferSchemaType<typeof ReservationSchema>;

export default models.Reservation || model("Reservation", ReservationSchema);
