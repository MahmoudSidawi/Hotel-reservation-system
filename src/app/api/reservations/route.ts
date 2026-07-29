import { NextRequest, NextResponse } from "next/server";
import { createReservationSchema } from "@/backend/validators/reservation";
import {
  listReservations,
  listReservationsByUser,
  createReservation,
} from "@/backend/controllers/reservationController";
import { jsonError } from "@/backend/middlewares/errorHandler";
import { getCurrentUser } from "@/lib/session";
import { requireUser, isStaff } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // Guests only ever see their own reservations. Returning the whole
    // collection to anyone (as before) leaked every guest's name/phone/email.
    const user = await requireUser();
    if (isStaff(user)) {
      return NextResponse.json(await listReservations());
    }
    return NextResponse.json(await listReservationsByUser(user.sub));
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

    console.log("[POST /api/reservations] Session identity from JWT:", {
      sub: user.sub,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const rawBody = await request.json();

    const {
      status: _status,
      isWalkIn: _isWalkIn,
      actualCheckIn: _actualCheckIn,
      actualCheckOut: _actualCheckOut,
      userId: _userId,
      createdBy: _createdBy,
      ...safeBody
    } = rawBody ?? {};

    const payload = {
      ...safeBody,
      userId: user.sub,
      guestName: rawBody.guestName || user.name,
      guestEmail: rawBody.guestEmail || user.email,
      createdBy: user.name,
    };

    console.log("[POST /api/reservations] Final reservation payload to save:", payload);

    const data = createReservationSchema.parse(payload);
    const reservation = await createReservation(data);

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
