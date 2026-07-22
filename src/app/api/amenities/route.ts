import { NextRequest, NextResponse } from "next/server";
import { createAmenitySchema } from "@/backend/validators/amenity";
import { listAmenities, createAmenity } from "@/backend/controllers/amenityController";
import { jsonError } from "@/backend/middlewares/errorHandler";

export async function GET() {
  try {
    return NextResponse.json(await listAmenities());
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = createAmenitySchema.parse(await request.json());
    const amenity = await createAmenity(data);
    return NextResponse.json(amenity, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
