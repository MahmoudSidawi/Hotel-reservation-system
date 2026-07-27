import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/backend/config/db";
import User from "@/backend/models/User";
import { jsonError } from "@/backend/middlewares/errorHandler";
import { requireUser } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

// Self-service password change. Verifies the current password against the
// stored hash before setting a new one, so the "current password" field is
// meaningful — not decorative.
export async function POST(request: Request) {
  try {
    const actor = await requireUser();
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Both current and new passwords are required." }, { status: 400 });
    }
    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters." }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(actor.sub);
    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
