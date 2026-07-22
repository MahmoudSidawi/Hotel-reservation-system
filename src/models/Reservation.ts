import { Schema, models, model, type InferSchemaType } from "mongoose";

const ReservationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
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
    createdBy: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type Reservation = InferSchemaType<typeof ReservationSchema>;

export default models.Reservation || model("Reservation", ReservationSchema);
