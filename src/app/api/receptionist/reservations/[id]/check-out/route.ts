import { NextRequest, NextResponse } from "next/server";
import { checkOutReservation } from "@/backend/controllers/reservationController";
import { checkoutChargesSchema } from "@/backend/validators/reservation";
import { jsonError } from "@/backend/middlewares/errorHandler";
import { requireRole } from "@/lib/apiAuth";

type Params = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await requireRole("admin", "receptionist");
    const rawBody = await request.json().catch(() => ({}));
    const charges = checkoutChargesSchema.parse(rawBody);
    const updated = await checkOutReservation(id, charges);
    return NextResponse.json(updated);
  } catch (error) {
    return jsonError(error);
  }
}
