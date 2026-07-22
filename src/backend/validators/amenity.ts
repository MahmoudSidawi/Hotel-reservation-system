import { z } from "zod";

export const createAmenitySchema = z.object({
  name: z.string().min(1),
  icon: z.string().optional(),
});

export const updateAmenitySchema = createAmenitySchema.partial();

export type CreateAmenityInput = z.infer<typeof createAmenitySchema>;
export type UpdateAmenityInput = z.infer<typeof updateAmenitySchema>;
