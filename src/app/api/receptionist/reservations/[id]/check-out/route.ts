import { NextRequest, NextResponse } from "next/server";
import { checkoutChargesSchema } from "@/backend/validators/reservation";
import { checkOutReservation } from "@/backend/controllers/reservationController";
import { jsonError } from "@/backend/middlewares/errorHandler";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.text();
    const charges = checkoutChargesSchema.parse(body ? JSON.parse(body) : {});
    return NextResponse.json(await checkOutReservation(id, charges));
  } catch (error) {
    return jsonError(error);
  }
}
