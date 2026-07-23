import { cookies } from "next/headers";
import { AUTH_COOKIE, verifySession, type SessionPayload } from "@/lib/auth";

// Node-only (uses next/headers) — for Server Components and Route Handlers.
// Do not import this from middleware.ts; use @/lib/auth there instead.
export async function getCurrentUser(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}
