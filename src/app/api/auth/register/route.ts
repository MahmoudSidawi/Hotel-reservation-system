import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/backend/config/db";
import User from "@/backend/models/User";
import { jsonError } from "@/backend/middlewares/errorHandler";
import { signSession, AUTH_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const { fullName, email, phone, password } = await req.json();

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Please provide all required fields." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    // Hash password with bcrypt (10 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save to database matching exact schema structure
    const newUser = await User.create({
      name: fullName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "guest",
      phone: phone || undefined,
    });

    const publicUser = {
      id: String(newUser._id),
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role as "guest",
    };

    // Auto-login registered user by issuing JWT session cookie
    const token = await signSession({
      sub: publicUser.id,
      email: publicUser.email,
      role: publicUser.role,
      name: publicUser.name,
    });

    const response = NextResponse.json(
      {
        message: "User registered successfully",
        user: publicUser,
      },
      { status: 201 }
    );

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