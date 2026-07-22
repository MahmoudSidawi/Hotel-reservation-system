import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { NotFoundError } from "@/lib/errors";

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

  if (error instanceof Error && error.name === "ValidationError") {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (error instanceof Error && error.name === "MongoServerError" && "code" in error && (error as { code?: number }).code === 11000) {
    return NextResponse.json({ error: "Duplicate value violates a unique constraint" }, { status: 409 });
  }

  console.error(error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
