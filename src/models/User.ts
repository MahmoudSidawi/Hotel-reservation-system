import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["guest", "staff", "admin"], default: "guest" },
    phone: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type User = InferSchemaType<typeof UserSchema>;

export default models.User || model("User", UserSchema);
