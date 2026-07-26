import { NextRequest, NextResponse } from "next/server";
import { createPaymentSchema } from "@/backend/validators/payment";
import { listPayments, createPayment } from "@/backend/controllers/paymentController";
import { jsonError } from "@/backend/middlewares/errorHandler";
import { requireRole } from "@/lib/apiAuth";

export async function GET() {
  try {
    await requireRole("admin", "receptionist");
    return NextResponse.json(await listPayments());
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole("admin", "receptionist");
    const data = createPaymentSchema.parse(await request.json());
    const payment = await createPayment(data);
    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
