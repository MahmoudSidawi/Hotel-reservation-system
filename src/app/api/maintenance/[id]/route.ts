import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";
import {
  getMaintenanceRequestById,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
} from "@/backend/controllers/maintenanceController";
import { jsonError } from "@/backend/middlewares/errorHandler";
import { z } from "zod";

const UpdateSchema = z.object({
  status: z.enum(["open", "assigned", "in_progress", "resolved", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assignedTo: z.string().optional(),
  resolutionNotes: z.string().max(2000).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("admin", "receptionist", "housekeeping");
    const { id } = await params;
    const req = await getMaintenanceRequestById(id);
    return NextResponse.json(req);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("admin", "receptionist", "housekeeping");
    const { id } = await params;
    const body = await request.json();
    const data = UpdateSchema.parse(body);
    const updated = await updateMaintenanceRequest(id, data);
    return NextResponse.json(updated);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("admin");
    const { id } = await params;
    await deleteMaintenanceRequest(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
