import { connectToDatabase } from "@/backend/config/db";
import { NotFoundError } from "@/lib/errors";
import Payment from "@/backend/models/Payment";
import type { CreatePaymentInput, UpdatePaymentInput } from "@/backend/validators/payment";

export async function listPayments() {
  await connectToDatabase();
  return Payment.find().populate("reservationId").lean();
}

export async function getPaymentById(id: string) {
  await connectToDatabase();
  const payment = await Payment.findById(id).populate("reservationId").lean();
  if (!payment) throw new NotFoundError("Payment not found");
  return payment;
}

export async function createPayment(data: CreatePaymentInput) {
  await connectToDatabase();
  return (await Payment.create(data)).toObject();
}

export async function updatePayment(id: string, data: UpdatePaymentInput) {
  await connectToDatabase();
  const payment = await Payment.findByIdAndUpdate(id, data, { new: true }).lean();
  if (!payment) throw new NotFoundError("Payment not found");
  return payment;
}

export async function deletePayment(id: string) {
  await connectToDatabase();
  const payment = await Payment.findByIdAndDelete(id).lean();
  if (!payment) throw new NotFoundError("Payment not found");
}
