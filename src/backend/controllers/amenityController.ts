import { connectToDatabase } from "@/backend/config/db";
import { NotFoundError } from "@/lib/errors";
import Amenity from "@/backend/models/Amenity";
import type { CreateAmenityInput, UpdateAmenityInput } from "@/backend/validators/amenity";

export async function listAmenities() {
  await connectToDatabase();
  return Amenity.find().lean();
}

export async function getAmenityById(id: string) {
  await connectToDatabase();
  const amenity = await Amenity.findById(id).lean();
  if (!amenity) throw new NotFoundError("Amenity not found");
  return amenity;
}

export async function createAmenity(data: CreateAmenityInput) {
  await connectToDatabase();
  return (await Amenity.create(data)).toObject();
}

export async function updateAmenity(id: string, data: UpdateAmenityInput) {
  await connectToDatabase();
  const amenity = await Amenity.findByIdAndUpdate(id, data, { new: true }).lean();
  if (!amenity) throw new NotFoundError("Amenity not found");
  return amenity;
}

export async function deleteAmenity(id: string) {
  await connectToDatabase();
  const amenity = await Amenity.findByIdAndDelete(id).lean();
  if (!amenity) throw new NotFoundError("Amenity not found");
}
