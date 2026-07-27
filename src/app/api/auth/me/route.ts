import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { connectToDatabase } from "@/backend/config/db";
import User from "@/backend/models/User";
import { AUTH_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const session = await getCurrentUser();
  if (!session || !session.sub) {
    const response = NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    response.cookies.set(AUTH_COOKIE, "", { maxAge: 0, path: "/" });
    return response;
  }

  try {
    await connectToDatabase();
    const dbUser = await User.findById(session.sub).select("-password").lean();

    if (!dbUser) {
      // User no longer exists in database — invalidate stale session cookie
      const response = NextResponse.json(
        { error: "User account no longer exists." },
        { status: 401 }
      );
      response.cookies.set(AUTH_COOKIE, "", { maxAge: 0, path: "/" });
      return response;
    }

    return NextResponse.json(
      {
        user: {
          id: String(dbUser._id),
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
          phone: dbUser.phone,
          notificationPrefs: dbUser.notificationPrefs,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (err) {
    console.error("[GET /api/auth/me] Database validation error:", err);
    return NextResponse.json({ error: "Authentication check failed" }, { status: 500 });
  }
}
