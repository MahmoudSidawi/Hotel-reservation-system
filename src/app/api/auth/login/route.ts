import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/backend/validators/auth";
import { login } from "@/backend/controllers/authController";
import { jsonError } from "@/backend/middlewares/errorHandler";
import { AUTH_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const data = loginSchema.parse(await request.json());
    const { token, user } = await login(data);

    const response = NextResponse.json({ user });
    response.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
