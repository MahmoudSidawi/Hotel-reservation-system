import { connectToDatabase } from "@/backend/config/db";
import mongoose from "mongoose";
import { NotFoundError, ForbiddenError, ConflictError } from "@/lib/errors";
import Review from "@/backend/models/Review";
import Reservation from "@/backend/models/Reservation";
import RoomType from "@/backend/models/RoomType";

// ─── List & detail ────────────────────────────────────────────────────────────

export async function getReviewsForRoomType(
  roomTypeId: string,
  { page = 1, limit = 10 }: { page?: number; limit?: number } = {}
) {
  await connectToDatabase();
  const skip = (page - 1) * limit;
  const [reviews, total] = await Promise.all([
    Review.find({ roomTypeId, isPublished: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name avatar")
      .lean(),
    Review.countDocuments({ roomTypeId, isPublished: true }),
  ]);
  return { reviews, total, page, pages: Math.ceil(total / limit) };
}

export async function getReviewByReservation(reservationId: string) {
  await connectToDatabase();
  return Review.findOne({ reservationId }).lean();
}

export async function getUserReviews(userId: string) {
  await connectToDatabase();
  return Review.find({ userId })
    .populate("roomTypeId", "name")
    .sort({ createdAt: -1 })
    .lean();
}

// ─── Create ───────────────────────────────────────────────────────────────────

type CreateReviewInput = {
  reservationId: string;
  ratings: {
    overall: number;
    cleanliness: number;
    comfort: number;
    staff: number;
    value: number;
  };
  comment?: string;
};

export async function createReview(userId: string, data: CreateReviewInput) {
  await connectToDatabase();

  // Verify the reservation is checked out and belongs to this user
  const reservation = await Reservation.findById(data.reservationId)
    .populate("roomId", "roomTypeId")
    .lean();
  if (!reservation) throw new NotFoundError("Reservation not found");
  if (String(reservation.userId) !== userId) {
    throw new ForbiddenError("You can only review your own reservations");
  }
  if (reservation.status !== "checked_out") {
    throw new ConflictError("You can only review completed stays");
  }

  // One review per reservation
  const existing = await Review.findOne({ reservationId: data.reservationId });
  if (existing) throw new ConflictError("You have already reviewed this stay");

  const roomTypeId = (reservation.roomId as unknown as { roomTypeId: unknown })?.roomTypeId;
  if (!roomTypeId) throw new NotFoundError("Room type not found for this reservation");

  const review = await Review.create({
    reservationId: data.reservationId,
    userId,
    roomTypeId: String(roomTypeId),
    ratings: data.ratings,
    comment: data.comment,
    verifiedStay: true,
    isPublished: true,
  });

  // Update the denormalised aggregate rating on RoomType
  await recalculateRoomTypeRating(String(roomTypeId));

  return review;
}

// ─── Admin moderation ─────────────────────────────────────────────────────────

export async function toggleReviewPublished(reviewId: string) {
  await connectToDatabase();
  const review = await Review.findById(reviewId);
  if (!review) throw new NotFoundError("Review not found");
  review.isPublished = !review.isPublished;
  await review.save();
  await recalculateRoomTypeRating(String(review.roomTypeId));
  return review;
}

export async function deleteReview(reviewId: string) {
  await connectToDatabase();
  const review = await Review.findByIdAndDelete(reviewId).lean();
  if (!review) throw new NotFoundError("Review not found");
  await recalculateRoomTypeRating(String(review.roomTypeId));
}

// ─── Aggregate rating ─────────────────────────────────────────────────────────

async function recalculateRoomTypeRating(roomTypeId: string) {
  const result = await Review.aggregate([
    { $match: { roomTypeId: { $eq: require("mongoose").Types.ObjectId.createFromHexString(roomTypeId) }, isPublished: true } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$ratings.overall" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const { avgRating = 0, reviewCount = 0 } = result[0] ?? {};
  await RoomType.findByIdAndUpdate(roomTypeId, {
    avgRating: Math.round(avgRating * 10) / 10,
    reviewCount,
  });
}
