import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAvailableRooms } from "@/backend/controllers/roomController";
import { jsonError } from "@/backend/middlewares/errorHandler";

const querySchema = z
  .object({
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
    roomTypeId: z.string().optional(),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "checkOut must be after checkIn",
    path: ["checkOut"],
  });

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const { checkIn, checkOut, roomTypeId } = querySchema.parse(params);
    const rooms = await getAvailableRooms({ checkIn, checkOut, roomTypeId });
    return NextResponse.json(rooms);
  } catch (error) {
    return jsonError(error);
  }
}
