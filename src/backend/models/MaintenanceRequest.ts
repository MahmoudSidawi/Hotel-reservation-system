import { Schema, models, model, type InferSchemaType } from "mongoose";

const MaintenanceRequestSchema = new Schema(
  {
    roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    // Who reported this issue
    reportedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reporterRole: {
      type: String,
      enum: ["guest", "receptionist", "housekeeping", "admin"],
    },
    // Issue classification
    category: {
      type: String,
      enum: ["electrical", "plumbing", "hvac", "furniture", "appliance", "cleaning", "security", "other"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    title: { type: String, required: true, maxlength: 120 },
    description: { type: String, maxlength: 2000 },
    // Lifecycle
    status: {
      type: String,
      enum: ["open", "assigned", "in_progress", "resolved", "closed"],
      default: "open",
    },
    // Staff member assigned to resolve this
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    resolvedAt: { type: Date },
    resolutionNotes: { type: String },
  },
  { timestamps: true }
);

MaintenanceRequestSchema.index({ roomId: 1, status: 1 });
MaintenanceRequestSchema.index({ status: 1, priority: -1, createdAt: -1 });

export type MaintenanceRequest = InferSchemaType<typeof MaintenanceRequestSchema>;

export default models.MaintenanceRequest || model("MaintenanceRequest", MaintenanceRequestSchema);
