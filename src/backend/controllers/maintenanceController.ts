import { connectToDatabase } from "@/backend/config/db";
import { NotFoundError } from "@/lib/errors";
import MaintenanceRequest from "@/backend/models/MaintenanceRequest";
import Room from "@/backend/models/Room";
import Reservation from "@/backend/models/Reservation";
import { notifyRole } from "@/backend/controllers/notificationController";

type CreateMaintenanceInput = {
  roomId: string;
  reportedBy?: string;
  reporterRole?: string;
  category: string;
  priority?: string;
  title: string;
  description?: string;
};

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createMaintenanceRequest(data: CreateMaintenanceInput) {
  await connectToDatabase();

  const room = await Room.findById(data.roomId).lean();
  if (!room) throw new NotFoundError("Room not found");

  const request = await MaintenanceRequest.create(data);

  // Mark the room as under maintenance so it cannot be booked
  await Room.findByIdAndUpdate(data.roomId, { status: "maintenance" });

  // Notify all admins about the new maintenance issue
  await notifyRole("admin", {
    type: "maintenance_reported",
    title: "Maintenance Request",
    message: `New ${data.priority ?? "medium"} priority ${data.category} issue reported for Room ${(room as unknown as { roomNumber: string }).roomNumber}: "${data.title}"`,
    relatedId: String(request._id),
    relatedType: "MaintenanceRequest",
  });

  return request;
}

// ─── List & detail ────────────────────────────────────────────────────────────

type ListFilter = {
  status?: string;
  priority?: string;
  roomId?: string;
  assignedTo?: string;
  page?: number;
  limit?: number;
};

export async function listMaintenanceRequests(filter: ListFilter = {}) {
  await connectToDatabase();
  const query: Record<string, unknown> = {};
  if (filter.status) query.status = filter.status;
  if (filter.priority) query.priority = filter.priority;
  if (filter.roomId) query.roomId = filter.roomId;
  if (filter.assignedTo) query.assignedTo = filter.assignedTo;

  const page = Math.max(1, filter.page ?? 1);
  const limit = Math.min(100, filter.limit ?? 50);
  const skip = (page - 1) * limit;

  const [rawRequests, total] = await Promise.all([
    MaintenanceRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("roomId", "roomNumber floor")
      .populate("reportedBy", "name role")
      .populate("assignedTo", "name role")
      .lean(),
    MaintenanceRequest.countDocuments(query),
  ]);

  const ReservationModel = (await import("@/backend/models/Reservation")).default;

  const requests = await Promise.all(
    rawRequests.map(async (req) => {
      const room = req.roomId as unknown as { _id?: string } | null;
      if (!room?._id) return req;
      const activeRes = await ReservationModel.findOne({
        roomId: room._id,
        status: { $in: ["pending", "confirmed", "checked_in"] },
      })
        .populate("userId", "name email")
        .lean();
      return {
        ...req,
        activeReservation: activeRes
          ? {
              id: String(activeRes._id),
              guestName: (activeRes.userId as any)?.name ?? activeRes.guestName ?? "Guest",
              guestEmail: (activeRes.userId as any)?.email ?? activeRes.guestEmail ?? "",
              checkIn: activeRes.checkIn,
              checkOut: activeRes.checkOut,
              status: activeRes.status,
            }
          : null,
      };
    })
  );

  return { requests, total, page, pages: Math.ceil(total / limit) };
}

export async function getMaintenanceRequestById(id: string) {
  await connectToDatabase();
  const req = await MaintenanceRequest.findById(id)
    .populate("roomId", "roomNumber floor")
    .populate("reportedBy", "name role email")
    .populate("assignedTo", "name role email")
    .lean();
  if (!req) throw new NotFoundError("Maintenance request not found");
  return req;
}

// ─── Update ───────────────────────────────────────────────────────────────────

type UpdateMaintenanceInput = {
  status?: string;
  priority?: string;
  assignedTo?: string;
  resolutionNotes?: string;
};

export async function updateMaintenanceRequest(id: string, data: UpdateMaintenanceInput) {
  await connectToDatabase();

  const request = await MaintenanceRequest.findById(id).populate("roomId", "roomNumber").lean();
  if (!request) throw new NotFoundError("Maintenance request not found");

  const update: Record<string, unknown> = { ...data };

  if (data.status === "resolved" || data.status === "closed") {
    update.resolvedAt = new Date();

    // Check if active or upcoming reservations exist for this room
    const activeRes = await Reservation.findOne({
      roomId: request.roomId,
      status: { $in: ["pending", "confirmed", "checked_in"] },
    }).sort({ checkIn: 1 });

    const newRoomStatus = activeRes
      ? activeRes.status === "checked_in"
        ? "occupied"
        : "reserved"
      : "available";

    await Room.findByIdAndUpdate(request.roomId, { status: newRoomStatus });

    // Notify admins and receptionists
    await notifyRole("admin", {
      type: "maintenance_resolved",
      title: "Maintenance Resolved",
      message: `Maintenance request "${(request as unknown as { title: string }).title}" for Room ${((request.roomId as unknown) as { roomNumber: string }).roomNumber} has been marked as ${data.status}.`,
      relatedId: id,
      relatedType: "MaintenanceRequest",
    });
  }

  const updated = await MaintenanceRequest.findByIdAndUpdate(id, update, { new: true })
    .populate("roomId", "roomNumber floor")
    .populate("assignedTo", "name role")
    .lean();

  return updated;
}

export async function deleteMaintenanceRequest(id: string) {
  await connectToDatabase();
  const req = await MaintenanceRequest.findByIdAndDelete(id).lean();
  if (!req) throw new NotFoundError("Maintenance request not found");
  // If the room was set to maintenance by this request alone, free it
  const others = await MaintenanceRequest.countDocuments({
    roomId: req.roomId,
    status: { $nin: ["resolved", "closed"] },
  });
  if (others === 0) {
    await Room.findByIdAndUpdate(req.roomId, { status: "available" });
  }
}
