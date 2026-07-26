import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
import type { SessionPayload, UserRole } from "@/lib/auth";

// Route-handler authorization helpers. These throw typed errors that
// jsonError() maps to 401/403, so handlers can stay in the same try/catch
// shape as the rest of the codebase.

export async function requireUser(): Promise<SessionPayload> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError("You must be logged in to do this.");
  return user;
}

export async function requireRole(...roles: UserRole[]): Promise<SessionPayload> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new ForbiddenError("You do not have permission to perform this action.");
  }
  return user;
}

export function isStaff(user: { role: UserRole }): boolean {
  return user.role === "admin" || user.role === "receptionist";
}
