import { Schema, models, model, type InferSchemaType } from "mongoose";

const RoomTypeSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  basePrice: { type: Number, required: true },
  capacity: { type: Number, required: true },
  amenities: [{ type: Schema.Types.ObjectId, ref: "Amenity" }],
});

export type RoomType = InferSchemaType<typeof RoomTypeSchema>;

export default models.RoomType || model("RoomType", RoomTypeSchema);
