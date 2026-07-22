import { NextResponse } from "next/server";
import { connectToDatabase } from "@/backend/config/db";

export async function GET() {
  try {
    const mongoose = await connectToDatabase();
    return NextResponse.json({
      status: "connected",
      readyState: mongoose.connection.readyState,
      db: mongoose.connection.name,
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: (error as Error).message },
      { status: 500 }
    );
  }
}
