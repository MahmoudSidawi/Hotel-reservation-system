import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";
import { toggleReviewPublished, deleteReview } from "@/backend/controllers/reviewController";
import { jsonError } from "@/backend/middlewares/errorHandler";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("admin");
    const { id } = await params;
    const review = await toggleReviewPublished(id);
    return NextResponse.json(review);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("admin");
    const { id } = await params;
    await deleteReview(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
