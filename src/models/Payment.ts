import { Schema, models, model, type InferSchemaType } from "mongoose";

const PaymentSchema = new Schema({
  reservationId: { type: Schema.Types.ObjectId, ref: "Reservation", required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ["card", "cash", "transfer"], required: true },
  status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
  paidAt: { type: Date },
});

export type Payment = InferSchemaType<typeof PaymentSchema>;

export default models.Payment || model("Payment", PaymentSchema);
