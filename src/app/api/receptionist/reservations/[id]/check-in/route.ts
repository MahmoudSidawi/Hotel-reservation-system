import { NextRequest, NextResponse } from "next/server";
import { checkInReservation } from "@/backend/controllers/reservationController";
import { jsonError } from "@/backend/middlewares/errorHandler";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    return NextResponse.json(await checkInReservation(id));
  } catch (error) {
    return jsonError(error);
  }
}
