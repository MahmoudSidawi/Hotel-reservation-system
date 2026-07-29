import { Schema, models, model, type InferSchemaType } from "mongoose";

const NotificationSchema = new Schema(
  {
    // Targeted recipient
    recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipientRole: {
      type: String,
      enum: ["guest", "receptionist", "housekeeping", "admin"],
      required: true,
    },
    // Notification type drives icon + color in the UI
    type: {
      type: String,
      enum: [
        "reservation_created",
        "reservation_confirmed",
        "reservation_cancelled",
        "reservation_modified",
        "check_in",
        "check_out",
        "payment_received",
        "maintenance_reported",
        "maintenance_resolved",
        "cleaning_requested",
        "cleaning_done",
        "system_alert",
        "new_review",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    // Optional link to related entity
    relatedId: { type: Schema.Types.ObjectId },
    relatedType: {
      type: String,
      enum: ["Reservation", "MaintenanceRequest", "Review", "Room", "Payment"],
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Index for fast per-recipient queries
NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

export type Notification = InferSchemaType<typeof NotificationSchema>;

export default models.Notification || model("Notification", NotificationSchema);
