import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createRoomSchema = z.object({
  roomNumber: z.string().min(1),
  roomTypeId: objectId,
  status: z.enum(["available", "occupied", "maintenance"]).optional(),
  floor: z.number().int(),
});

export const updateRoomSchema = createRoomSchema.partial();

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
