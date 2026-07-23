import { NextResponse } from "next/server";
import { getDashboardData } from "@/backend/controllers/dashboardController";
import { jsonError } from "@/backend/middlewares/errorHandler";

export async function GET() {
  try {
    return NextResponse.json(await getDashboardData());
  } catch (error) {
    return jsonError(error);
  }
}
