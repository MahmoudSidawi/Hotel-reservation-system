import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/session";
import {
  reservationEvents,
  ReservationEventPayload,
} from "@/backend/events/reservationEvents";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection header event
      const initMessage = `event: connected\ndata: ${JSON.stringify({
        status: "connected",
        user: { id: user.sub, role: user.role },
      })}\n\n`;
      controller.enqueue(encoder.encode(initMessage));

      const onReservationEvent = (payload: ReservationEventPayload) => {
        try {
          const message = `event: reservation_event\ndata: ${JSON.stringify(
            payload
          )}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch {
          // Controller might be closed
        }
      };

      reservationEvents.on("reservation_event", onReservationEvent);

      // Send periodic heartbeat every 15 seconds to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 15000);

      // Clean up when client disconnects
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeatInterval);
        reservationEvents.off("reservation_event", onReservationEvent);
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
