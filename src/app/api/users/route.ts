import { NextRequest, NextResponse } from "next/server";
import { createUserSchema } from "@/backend/validators/user";
import { listUsers, createUser } from "@/backend/controllers/userController";
import { jsonError } from "@/backend/middlewares/errorHandler";

export async function GET() {
  try {
    const users = await listUsers();
    return NextResponse.json(users);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = createUserSchema.parse(await request.json());
    const user = await createUser(data);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
