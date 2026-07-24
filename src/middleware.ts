import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, verifySession, type UserRole } from "@/lib/auth";

const protectedPrefixes: { prefix: string; roles: UserRole[] }[] = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/api/admin", roles: ["admin"] },
  { prefix: "/receptionist", roles: ["admin", "receptionist"] },
  { prefix: "/api/receptionist", roles: ["admin", "receptionist"] },
];

export async function middleware(request: NextRequest) {
  const rule = protectedPrefixes.find((r) => request.nextUrl.pathname.startsWith(r.prefix));
  if (!rule) return NextResponse.next();

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");

  console.log(`[Middleware] Path: ${request.nextUrl.pathname}, Session: ${session ? session.email + " (" + session.role + ")" : "null"}`);

  if (!session || !rule.roles.includes(session.role)) {
    if (isApiRoute) {
      return NextResponse.json(
        { error: session ? "Forbidden" : "Unauthorized" },
        { status: session ? 403 : 401 }
      );
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/receptionist/:path*", "/api/receptionist/:path*"],
};
