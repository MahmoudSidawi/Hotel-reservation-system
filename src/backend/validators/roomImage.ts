import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createRoomImageSchema = z.object({
  roomTypeId: objectId,
  imageUrl: z.string().url(),
  isPrimary: z.boolean().optional(),
});

export const updateRoomImageSchema = createRoomImageSchema.partial();

export type CreateRoomImageInput = z.infer<typeof createRoomImageSchema>;
export type UpdateRoomImageInput = z.infer<typeof updateRoomImageSchema>;
