import { EventEmitter } from "events";

export type ReservationEventType =
  | "RESERVATION_CREATED"
  | "RESERVATION_UPDATED"
  | "RESERVATION_CANCELLED"
  | "RESERVATION_CONFIRMED"
  | "RESERVATION_CHECKED_IN"
  | "RESERVATION_CHECKED_OUT"
  | "RESERVATION_DELETED"
  | "PAYMENT_COMPLETED";

export interface ReservationEventPayload {
  type: ReservationEventType;
  reservationId: string;
  userId?: string;
  status?: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

class ReservationEventEmitter extends EventEmitter {
  constructor() {
    super();
    // Allow multiple active client connections (e.g. up to 200 concurrent tabs/clients)
    this.setMaxListeners(200);
  }

  broadcast(type: ReservationEventType, payload: Partial<ReservationEventPayload>) {
    const fullPayload: ReservationEventPayload = {
      type,
      reservationId: payload.reservationId || "",
      userId: payload.userId,
      status: payload.status,
      data: payload.data,
      timestamp: new Date().toISOString(),
    };
    this.emit("reservation_event", fullPayload);
  }
}

// Global singleton instance across Next.js module reloads
const globalForEvents = globalThis as unknown as {
  reservationEventEmitter?: ReservationEventEmitter;
};

export const reservationEvents =
  globalForEvents.reservationEventEmitter ?? new ReservationEventEmitter();

if (process.env.NODE_ENV !== "production") {
  globalForEvents.reservationEventEmitter = reservationEvents;
}
