import { NextRequest, NextResponse } from "next/server";
import { walkInBookingSchema } from "@/backend/validators/reservation";
import { createWalkInBooking } from "@/backend/controllers/reservationController";
import { jsonError } from "@/backend/middlewares/errorHandler";
import { getCurrentUser } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const data = walkInBookingSchema.parse(await request.json());
    const actor = await getCurrentUser();
    const reservation = await createWalkInBooking(data, actor?.name ?? "receptionist");
    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
