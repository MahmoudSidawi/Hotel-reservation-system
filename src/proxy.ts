import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, verifySession, type UserRole } from "@/lib/auth";

const protectedPrefixes: { prefix: string; roles: UserRole[] }[] = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/receptionist", roles: ["admin", "receptionist"] },
  { prefix: "/api/receptionist", roles: ["admin", "receptionist"] },
];

export async function proxy(request: NextRequest) {
  const rule = protectedPrefixes.find((r) => request.nextUrl.pathname.startsWith(r.prefix));
  if (!rule) return NextResponse.next();

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  const isApiRoute = rule.prefix.startsWith("/api");

  // Allow direct page access in development mode if session cookie is not set
  if (!session && process.env.NODE_ENV === "development" && !isApiRoute) {
    return NextResponse.next();
  }

  if (!session || !rule.roles.includes(session.role)) {
    if (isApiRoute) {
      return NextResponse.json(
        { error: session ? "Forbidden" : "Unauthorized" },
        { status: session ? 403 : 401 }
      );
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/receptionist/:path*", "/api/receptionist/:path*"],
};
