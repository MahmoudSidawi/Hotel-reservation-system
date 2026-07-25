"use client";

import { useEffect, useRef, useState } from "react";

export type ReservationRealtimeEvent = {
  type:
    | "RESERVATION_CREATED"
    | "RESERVATION_UPDATED"
    | "RESERVATION_CANCELLED"
    | "RESERVATION_CONFIRMED"
    | "RESERVATION_CHECKED_IN"
    | "RESERVATION_CHECKED_OUT"
    | "RESERVATION_DELETED"
    | "PAYMENT_COMPLETED";
  reservationId: string;
  userId?: string;
  status?: string;
  data?: Record<string, unknown>;
  timestamp: string;
};

export function useRealtimeReservations(
  onEvent?: (event: ReservationRealtimeEvent) => void
) {
  const [isConnected, setIsConnected] = useState(false);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryTimeout: NodeJS.Timeout;

    function connect() {
      try {
        eventSource = new EventSource("/api/events/reservations");

        eventSource.onopen = () => {
          setIsConnected(true);
        };

        eventSource.addEventListener("connected", () => {
          setIsConnected(true);
        });

        eventSource.addEventListener("reservation_event", (e: MessageEvent) => {
          try {
            const data: ReservationRealtimeEvent = JSON.parse(e.data);
            if (onEventRef.current) {
              onEventRef.current(data);
            }
          } catch (err) {
            console.error("Failed to parse SSE reservation event", err);
          }
        });

        eventSource.onerror = () => {
          setIsConnected(false);
          if (eventSource) {
            eventSource.close();
          }
          // Automatic reconnect attempt after 3 seconds
          retryTimeout = setTimeout(connect, 3000);
        };
      } catch (err) {
        console.error("Failed to initialize SSE connection", err);
        retryTimeout = setTimeout(connect, 5000);
      }
    }

    connect();

    return () => {
      clearTimeout(retryTimeout);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  return { isConnected };
}
