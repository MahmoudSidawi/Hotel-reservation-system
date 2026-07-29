"use client";

import { useEffect, useRef, useState } from "react";
import type { ReservationEventPayload } from "@/backend/events/reservationEvents";

export function useReservationEvents(onEvent?: (payload: ReservationEventPayload) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const callbackRef = useRef(onEvent);

  useEffect(() => {
    callbackRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let isCancelled = false;

    function connect() {
      if (isCancelled) return;

      eventSource = new EventSource("/api/events/reservations");

      eventSource.addEventListener("connected", () => {
        setIsConnected(true);
      });

      eventSource.addEventListener("reservation_event", (event: MessageEvent) => {
        try {
          const payload: ReservationEventPayload = JSON.parse(event.data);
          callbackRef.current?.(payload);
        } catch (err) {
          console.error("Failed to parse reservation SSE event:", err);
        }
      });

      eventSource.onerror = () => {
        setIsConnected(false);
        if (eventSource) {
          eventSource.close();
        }
        // Attempt reconnect after 5 seconds if connection drops
        setTimeout(() => {
          if (!isCancelled) connect();
        }, 5000);
      };
    }

    connect();

    return () => {
      isCancelled = true;
      setIsConnected(false);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  return { isConnected };
}
