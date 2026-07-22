import { NextRequest, NextResponse } from "next/server";
import { updateReservationSchema } from "@/backend/validators/reservation";
import {
  getReservationById,
  updateReservation,
  deleteReservation,
} from "@/backend/controllers/reservationController";
import { jsonError } from "@/backend/middlewares/errorHandler";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    return NextResponse.json(await getReservationById(id));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const data = updateReservationSchema.parse(await request.json());
    return NextResponse.json(await updateReservation(id, data));
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await deleteReservation(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
