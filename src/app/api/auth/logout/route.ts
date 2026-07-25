import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_COOKIE, "", { maxAge: 0, path: "/" });
  response.cookies.delete(AUTH_COOKIE);
  return response;
}
