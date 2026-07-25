import { NextRequest, NextResponse } from "next/server";
import { createReservationSchema } from "@/backend/validators/reservation";
import { listReservations, createReservation } from "@/backend/controllers/reservationController";
import { jsonError } from "@/backend/middlewares/errorHandler";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    return NextResponse.json(await listReservations());
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to create a reservation." },
        { status: 401 }
      );
    }

    const rawBody = await request.json();

    // Inject session identity into payload BEFORE Zod schema validation
    const payload = {
      ...rawBody,
      userId: user.sub,
      guestName: rawBody.guestName || user.name,
      guestEmail: rawBody.guestEmail || user.email,
      createdBy: user.name,
    };

    const data = createReservationSchema.parse(payload);
    const reservation = await createReservation(data);

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
