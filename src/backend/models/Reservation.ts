import { Schema, models, model, type InferSchemaType } from "mongoose";

const ExtraServiceSchema = new Schema(
  {
    serviceType: {
      type: String,
      enum: [
        "breakfast",
        "airport_pickup",
        "spa",
        "laundry",
        "parking",
        "extra_bed",
        "late_checkout",
        "early_checkin",
        "room_upgrade",
        "other",
      ],
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
  },
  { _id: false }
);

const ReservationSchema = new Schema(
  {
    // Registered guest — set when booking is made by a logged-in user.
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    // Walk-in guest details — used when no account exists.
    guestName: { type: String },
    guestPhone: { type: String },
    guestEmail: { type: String },
    guestIdNumber: { type: String },
    isWalkIn: { type: Boolean, default: false },

    roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    // Staff who created or last modified this reservation
    assignedReceptionistId: { type: Schema.Types.ObjectId, ref: "User" },

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
    // Internal staff notes (not visible to guests)
    notes: { type: String, default: "" },
    // Who created this reservation (staff email or 'guest-self')
    createdBy: { type: String },

    // Optional add-on services
    extraServices: [ExtraServiceSchema],

    // Payment tracking
    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "paid", "refunded"],
      default: "pending",
    },

    // Invoice reference (set after invoice is generated)
    invoiceNumber: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type Reservation = InferSchemaType<typeof ReservationSchema>;

export default models.Reservation || model("Reservation", ReservationSchema);
