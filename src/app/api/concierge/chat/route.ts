import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { processConciergeMessage, ConciergeMessage } from "@/backend/controllers/conciergeController";
import { jsonError } from "@/backend/middlewares/errorHandler";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const message: string = body.message ?? "";
    const history: ConciergeMessage[] = body.history ?? [];

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    const response = await processConciergeMessage(message, history, user?.sub);
    return NextResponse.json(response);
  } catch (error) {
    return jsonError(error);
  }
}
