import { Schema, models, model, type InferSchemaType } from "mongoose";

const RatingsSchema = new Schema(
  {
    overall: { type: Number, min: 1, max: 5, required: true },
    cleanliness: { type: Number, min: 1, max: 5, required: true },
    comfort: { type: Number, min: 1, max: 5, required: true },
    staff: { type: Number, min: 1, max: 5, required: true },
    value: { type: Number, min: 1, max: 5, required: true },
  },
  { _id: false }
);

const ReviewSchema = new Schema(
  {
    // One review per completed reservation (enforced by unique index below)
    reservationId: { type: Schema.Types.ObjectId, ref: "Reservation", required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    roomTypeId: { type: Schema.Types.ObjectId, ref: "RoomType", required: true },
    ratings: { type: RatingsSchema, required: true },
    comment: { type: String, maxlength: 2000 },
    // Automatically set true when the reservation is verified checked_out
    verifiedStay: { type: Boolean, default: true },
    // Admin can hide inappropriate reviews
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ReviewSchema.index({ roomTypeId: 1, isPublished: 1 });
ReviewSchema.index({ userId: 1 });

export type Review = InferSchemaType<typeof ReviewSchema>;

export default models.Review || model("Review", ReviewSchema);
