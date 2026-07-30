import { Schema, models, model, type InferSchemaType } from "mongoose";

const SeasonalPricingSchema = new Schema(
  {
    name: { type: String, required: true }, // e.g. "Summer Peak", "Holiday"
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    multiplier: { type: Number, required: true, min: 0.1, max: 10, default: 1 },
  },
  { _id: false }
);

const RoomTypeSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  basePrice: { type: Number, required: true },
  capacity: { type: Number, required: true },
  amenities: [{ type: Schema.Types.ObjectId, ref: "Amenity" }],
  // Physical room attributes
  bedType: { type: String, default: "" },     // e.g. "King", "Twin", "Queen"
  size: { type: Number, default: 0 },          // sq meters
  floor: { type: String, default: "" },        // floor description
  view: { type: String, default: "" },         // e.g. "Ocean View", "Garden View"
  // Aggregate rating (denormalised, updated when reviews are posted)
  avgRating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  // Seasonal pricing overrides
  seasonalPricing: [SeasonalPricingSchema],
  // Whether this room type is bookable
  isActive: { type: Boolean, default: true },
});

export type RoomType = InferSchemaType<typeof RoomTypeSchema>;

export default models.RoomType || model("RoomType", RoomTypeSchema);
