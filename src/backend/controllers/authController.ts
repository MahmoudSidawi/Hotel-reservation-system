import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/backend/config/db";
import User from "@/backend/models/User";
import { UnauthorizedError } from "@/lib/errors";
import { signSession, type UserRole } from "@/lib/auth";
import type { LoginInput } from "@/backend/validators/auth";

export async function login({ email, password }: LoginInput) {
  await connectToDatabase();

  const user = await User.findOne({ email });
  if (!user) throw new UnauthorizedError("Invalid email or password");

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) throw new UnauthorizedError("Invalid email or password");

  const publicUser = {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
  };

  const token = await signSession({
    sub: publicUser.id,
    email: publicUser.email,
    role: publicUser.role,
    name: publicUser.name,
  });

  return { token, user: publicUser };
}
