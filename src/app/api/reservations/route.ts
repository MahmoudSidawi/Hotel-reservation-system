import { NextRequest, NextResponse } from "next/server";
import { createReservationSchema } from "@/backend/validators/reservation";
import { listReservations, createReservation } from "@/backend/controllers/reservationController";
import { jsonError } from "@/backend/middlewares/errorHandler";

export async function GET() {
  try {
    return NextResponse.json(await listReservations());
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = createReservationSchema.parse(await request.json());
    const reservation = await createReservation(data);
    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
