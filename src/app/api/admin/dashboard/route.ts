import { NextResponse } from "next/server";
import { getAdminDashboardData } from "@/backend/controllers/dashboardController";
import { jsonError } from "@/backend/middlewares/errorHandler";

export async function GET() {
  try {
    return NextResponse.json(await getAdminDashboardData());
  } catch (error) {
    return jsonError(error);
  }
}
