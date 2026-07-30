import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";
import {
  listMaintenanceRequests,
  createMaintenanceRequest,
} from "@/backend/controllers/maintenanceController";
import { jsonError } from "@/backend/middlewares/errorHandler";
import { z } from "zod";

const CreateSchema = z.object({
  roomId: z.string().min(1),
  category: z.enum(["electrical", "plumbing", "hvac", "furniture", "appliance", "cleaning", "security", "other"]),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  title: z.string().min(2).max(120),
  description: z.string().max(2000).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole("admin", "receptionist", "housekeeping");
    const { searchParams } = new URL(request.url);

    const result = await listMaintenanceRequests({
      status: searchParams.get("status") ?? undefined,
      priority: searchParams.get("priority") ?? undefined,
      roomId: searchParams.get("roomId") ?? undefined,
      assignedTo: searchParams.get("assignedTo") ?? undefined,
      page: Number(searchParams.get("page") ?? "1"),
      limit: Number(searchParams.get("limit") ?? "50"),
    });

    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole("admin", "receptionist", "housekeeping");
    const body = await request.json();
    const data = CreateSchema.parse(body);

    const req = await createMaintenanceRequest({
      ...data,
      reportedBy: user.sub,
      reporterRole: user.role,
    });

    return NextResponse.json(req, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
