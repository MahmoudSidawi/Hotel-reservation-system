import { Schema, models, model, type InferSchemaType } from "mongoose";

const RoomSchema = new Schema({
  roomNumber: { type: String, required: true, unique: true },
  roomTypeId: { type: Schema.Types.ObjectId, ref: "RoomType", required: true },
  // Coarse current-state label for dashboards; actual booking conflicts are
  // resolved from Reservation date ranges, not this field (see roomController.getAvailableRooms).
  status: {
    type: String,
    enum: ["available", "reserved", "occupied", "maintenance"],
    default: "available",
  },
  floor: { type: Number, required: true },
});

export type Room = InferSchemaType<typeof RoomSchema>;

export default models.Room || model("Room", RoomSchema);
