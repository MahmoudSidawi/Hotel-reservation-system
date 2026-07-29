import { NextRequest, NextResponse } from "next/server";
import { checkInReservation } from "@/backend/controllers/reservationController";
import { jsonError } from "@/backend/middlewares/errorHandler";
import { requireRole } from "@/lib/apiAuth";

type Params = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await requireRole("admin", "receptionist");
    const updated = await checkInReservation(id);
    return NextResponse.json(updated);
  } catch (error) {
    return jsonError(error);
  }
}
