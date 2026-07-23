import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchReservations } from "@/backend/controllers/reservationController";
import { jsonError } from "@/backend/middlewares/errorHandler";

const searchQuerySchema = z.object({
  query: z.string().optional(),
  status: z
    .enum(["pending", "confirmed", "checked_in", "checked_out", "cancelled", "no_show"])
    .optional(),
  sortBy: z.enum(["checkIn", "checkOut", "createdAt"]).optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const { query, status, sortBy, sortDir } = searchQuerySchema.parse(params);
    const reservations = await searchReservations({ query, status, sortBy, sortDir });
    return NextResponse.json(reservations);
  } catch (error) {
    return jsonError(error);
  }
}
