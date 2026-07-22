import { NextRequest, NextResponse } from "next/server";
import { updateAmenitySchema } from "@/backend/validators/amenity";
import { getAmenityById, updateAmenity, deleteAmenity } from "@/backend/controllers/amenityController";
import { jsonError } from "@/backend/middlewares/errorHandler";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    return NextResponse.json(await getAmenityById(id));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const data = updateAmenitySchema.parse(await request.json());
    return NextResponse.json(await updateAmenity(id, data));
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await deleteAmenity(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
