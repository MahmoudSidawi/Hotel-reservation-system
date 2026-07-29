import { Schema, models, model, type InferSchemaType } from "mongoose";

const RoomSchema = new Schema(
  {
    roomNumber: { type: String, required: true, unique: true },
    roomTypeId: { type: Schema.Types.ObjectId, ref: "RoomType", required: true },
    // Extended status enum: available/reserved/occupied are booking-driven.
    // cleaning/needs_cleaning are housekeeping lifecycle states.
    // maintenance and out_of_service block all reservations.
    status: {
      type: String,
      enum: [
        "available",
        "reserved",
        "occupied",
        "needs_cleaning",
        "cleaning",
        "maintenance",
        "out_of_service",
      ],
      default: "available",
    },
    floor: { type: Number, required: true },
    notes: { type: String, default: "" }, // staff-facing internal notes
    lastCleaned: { type: Date },
  },
  { timestamps: true }
);

export type Room = InferSchemaType<typeof RoomSchema>;

export default models.Room || model("Room", RoomSchema);
