import { NextRequest, NextResponse } from "next/server";
import { requireUser, requireRole } from "@/lib/apiAuth";
import {
  getReviewsForRoomType,
  createReview,
} from "@/backend/controllers/reviewController";
import { jsonError } from "@/backend/middlewares/errorHandler";
import { z } from "zod";

const CreateReviewSchema = z.object({
  reservationId: z.string().min(1),
  ratings: z.object({
    overall: z.number().min(1).max(5),
    cleanliness: z.number().min(1).max(5),
    comfort: z.number().min(1).max(5),
    staff: z.number().min(1).max(5),
    value: z.number().min(1).max(5),
  }),
  comment: z.string().max(2000).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomTypeId = searchParams.get("roomTypeId");
    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "10");

    if (!roomTypeId) {
      return NextResponse.json({ error: "roomTypeId is required" }, { status: 400 });
    }

    const result = await getReviewsForRoomType(roomTypeId, { page, limit });
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const data = CreateReviewSchema.parse(body);
    const review = await createReview(user.sub, data);
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
