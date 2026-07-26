import { NextRequest, NextResponse } from "next/server";
import { updateReservationSchema } from "@/backend/validators/reservation";
import {
  getReservationById,
  updateReservation,
  deleteReservation,
} from "@/backend/controllers/reservationController";
import { jsonError } from "@/backend/middlewares/errorHandler";
import { requireUser, requireRole, isStaff } from "@/lib/apiAuth";

type Params = { params: Promise<{ id: string }> };

// A reservation belongs to its booking user (userId). Guests may only touch
// their own; staff may touch any. Walk-ins have no userId, so only staff.
function ownsReservation(
  reservation: { userId?: unknown } | null,
  userSub: string
): boolean {
  if (!reservation?.userId) return false;
  const owner = (reservation.userId as { _id?: unknown })._id ?? reservation.userId;
  return String(owner) === String(userSub);
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const actor = await requireUser();
    const reservation = await getReservationById(id);
    if (!isStaff(actor) && !ownsReservation(reservation, actor.sub)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(reservation);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const actor = await requireUser();
    const existing = await getReservationById(id);
    if (!isStaff(actor) && !ownsReservation(existing, actor.sub)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const data = updateReservationSchema.parse(await request.json());
    // Guests may not rewrite money, status, or check-in/out timestamps on their
    // own booking — those are staff/state-machine concerns. Strip them.
    if (!isStaff(actor)) {
      delete data.status;
      delete data.totalPrice;
      delete data.actualCheckIn;
      delete data.actualCheckOut;
      delete data.userId;
    }
    return NextResponse.json(await updateReservation(id, data));
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    // Hard delete is a staff-only administrative action; guests cancel instead.
    await requireRole("admin", "receptionist");
    await deleteReservation(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
