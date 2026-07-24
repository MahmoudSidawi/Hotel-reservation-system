import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { NotFoundError, UnauthorizedError, ForbiddenError, ConflictError } from "@/lib/errors";

export function jsonError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed", issues: error.issues },
      { status: 400 }
    );
  }

  if (error instanceof NotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  if (error instanceof ForbiddenError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }

  if (error instanceof ConflictError) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }

  if (error instanceof Error && error.name === "ValidationError") {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (error instanceof Error && error.name === "MongoServerError" && "code" in error && (error as { code?: number }).code === 11000) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  if (error instanceof Error && (error.name === "MongooseServerSelectionError" || error.message.includes("ECONNREFUSED"))) {
    return NextResponse.json(
      { error: "Database connection failed. Please ensure MongoDB is running or check MONGODB_URI in .env.local" },
      { status: 500 }
    );
  }

  console.error("Unhandled API Error:", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
