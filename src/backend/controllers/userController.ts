import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/backend/config/db";
import { NotFoundError } from "@/lib/errors";
import User from "@/backend/models/User";
import type { CreateUserInput, UpdateUserInput } from "@/backend/validators/user";

const PUBLIC_FIELDS = "-password";

export async function listUsers() {
  await connectToDatabase();
  return User.find().select(PUBLIC_FIELDS).lean();
}

export async function getUserById(id: string) {
  await connectToDatabase();
  const user = await User.findById(id).select(PUBLIC_FIELDS).lean();
  if (!user) throw new NotFoundError("User not found");
  return user;
}

export async function createUser(data: CreateUserInput) {
  await connectToDatabase();
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await User.create({ ...data, password: hashedPassword });
  const { password: _password, ...rest } = user.toObject();
  return rest;
}

export async function updateUser(id: string, data: UpdateUserInput) {
  await connectToDatabase();
  const update: UpdateUserInput = { ...data };
  if (update.password) {
    update.password = await bcrypt.hash(update.password, 10);
  }
  const user = await User.findByIdAndUpdate(id, update, { new: true })
    .select(PUBLIC_FIELDS)
    .lean();
  if (!user) throw new NotFoundError("User not found");
  return user;
}

export async function deleteUser(id: string) {
  await connectToDatabase();
  const user = await User.findByIdAndDelete(id).lean();
  if (!user) throw new NotFoundError("User not found");
}
