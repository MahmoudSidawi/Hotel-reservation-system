import { NextRequest, NextResponse } from "next/server";
import { markNoShow } from "@/backend/controllers/reservationController";
import { jsonError } from "@/backend/middlewares/errorHandler";

type Params = { params: Promise<{ id: string }> };

// Route is under /api/receptionist, so middleware already restricts it to
// admin/receptionist. Records a no-show and releases the held room.
export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    return NextResponse.json(await markNoShow(id));
  } catch (error) {
    return jsonError(error);
  }
}
