import { NextRequest, NextResponse } from "next/server";
import { updateUserSchema } from "@/backend/validators/user";
import { getUserById, updateUser, deleteUser } from "@/backend/controllers/userController";
import { jsonError } from "@/backend/middlewares/errorHandler";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    return NextResponse.json(await getUserById(id));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const data = updateUserSchema.parse(await request.json());
    return NextResponse.json(await updateUser(id, data));
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await deleteUser(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
