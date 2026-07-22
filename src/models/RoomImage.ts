import { Schema, models, model, type InferSchemaType } from "mongoose";

const RoomImageSchema = new Schema({
  roomTypeId: { type: Schema.Types.ObjectId, ref: "RoomType", required: true },
  imageUrl: { type: String, required: true },
  isPrimary: { type: Boolean, default: false },
});

export type RoomImage = InferSchemaType<typeof RoomImageSchema>;

export default models.RoomImage || model("RoomImage", RoomImageSchema);
