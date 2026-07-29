import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["guest", "receptionist", "housekeeping", "admin"],
      default: "guest",
    },
    phone: { type: String },
    department: { type: String, default: "" },   // e.g. "Front Desk", "Housekeeping"
    avatar: { type: String, default: "" },         // URL or base64
    // Account state — deactivated users cannot log in
    isActive: { type: Boolean, default: true },
    // Guest-facing notification preferences, managed from the settings page.
    notificationPrefs: {
      bookingUpdates: { type: Boolean, default: true },
      offersAndPromos: { type: Boolean, default: true },
      smsAlerts: { type: Boolean, default: false },
    },
    // Tracks last login for admin audit visibility
    lastLoginAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type User = InferSchemaType<typeof UserSchema>;

export default models.User || model("User", UserSchema);
