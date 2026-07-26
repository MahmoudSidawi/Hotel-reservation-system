import { NextRequest, NextResponse } from "next/server";
import { updateUserSchema } from "@/backend/validators/user";
import { getUserById, updateUser, deleteUser } from "@/backend/controllers/userController";
import { jsonError } from "@/backend/middlewares/errorHandler";
import { requireUser, requireRole, isStaff } from "@/lib/apiAuth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const actor = await requireUser();
    // A user can read their own record; only staff can read anyone's.
    if (actor.sub !== id && !isStaff(actor)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(await getUserById(id));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const actor = await requireUser();
    // A user may edit only their own record unless they are an admin.
    if (actor.sub !== id && actor.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const data = updateUserSchema.parse(await request.json());
    // Only admins can change a role (prevents self-promotion to admin).
    if (actor.role !== "admin") delete data.role;
    return NextResponse.json(await updateUser(id, data));
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await requireRole("admin");
    await deleteUser(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
