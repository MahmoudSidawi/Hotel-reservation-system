import { NextRequest, NextResponse } from "next/server";
import { createUserSchema } from "@/backend/validators/user";
import { listUsers, createUser } from "@/backend/controllers/userController";
import { jsonError } from "@/backend/middlewares/errorHandler";
import { requireRole } from "@/lib/apiAuth";

export async function GET() {
  try {
    // The user directory (including roles) is an admin-only management view.
    await requireRole("admin");
    const users = await listUsers();
    return NextResponse.json(users);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Only admins may create accounts through this management endpoint.
    // Self-service signup goes through /api/auth/register, which hardcodes the
    // guest role. Without this guard, anyone could POST { role: "admin" }.
    await requireRole("admin");
    const data = createUserSchema.parse(await request.json());
    const user = await createUser(data);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
