import { SignJWT, jwtVerify } from "jose";

// Edge-safe (uses jose, not Node's crypto) so this file can be imported by
// both middleware.ts (Edge runtime) and regular server code (Node runtime).

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_hotel_system_jwt_token_2026";

const secretKey = new TextEncoder().encode(JWT_SECRET);

export const AUTH_COOKIE = "hrs_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

export type UserRole = "guest" | "receptionist" | "admin";

export type SessionPayload = {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
};

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secretKey);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
