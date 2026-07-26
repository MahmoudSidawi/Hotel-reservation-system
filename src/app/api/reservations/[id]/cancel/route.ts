import { NextRequest, NextResponse } from "next/server";
import {
  getReservationById,
  cancelReservation,
} from "@/backend/controllers/reservationController";
import { jsonError } from "@/backend/middlewares/errorHandler";
import { requireUser, isStaff } from "@/lib/apiAuth";

type Params = { params: Promise<{ id: string }> };

// Customer-facing cancellation. The receptionist cancel route sits behind
// role middleware that rejects guests (403), so guests need their own,
// ownership-checked path to cancel their bookings.
export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const actor = await requireUser();
    const reservation = await getReservationById(id);

    const ownerId = reservation.userId
      ? String((reservation.userId as { _id?: unknown })._id ?? reservation.userId)
      : null;

    if (!isStaff(actor) && ownerId !== String(actor.sub)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(await cancelReservation(id));
  } catch (error) {
    return jsonError(error);
  }
}
