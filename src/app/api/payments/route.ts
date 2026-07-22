import { NextRequest, NextResponse } from "next/server";
import { createPaymentSchema } from "@/backend/validators/payment";
import { listPayments, createPayment } from "@/backend/controllers/paymentController";
import { jsonError } from "@/backend/middlewares/errorHandler";

export async function GET() {
  try {
    return NextResponse.json(await listPayments());
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = createPaymentSchema.parse(await request.json());
    const payment = await createPayment(data);
    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
