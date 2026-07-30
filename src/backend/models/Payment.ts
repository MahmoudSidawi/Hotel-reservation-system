import { Schema, models, model, type InferSchemaType } from "mongoose";

const PaymentSchema = new Schema(
  {
    reservationId: { type: Schema.Types.ObjectId, ref: "Reservation", required: true },
    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ["card", "cash", "transfer", "online", "check"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paidAt: { type: Date },
    // Who processed this payment (receptionist/admin)
    processedBy: { type: Schema.Types.ObjectId, ref: "User" },
    // Auto-generated invoice reference e.g. "INV-2026-00042"
    invoiceNumber: { type: String },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export type Payment = InferSchemaType<typeof PaymentSchema>;

export default models.Payment || model("Payment", PaymentSchema);
