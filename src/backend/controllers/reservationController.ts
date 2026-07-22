import { connectToDatabase } from "@/backend/config/db";
import { NotFoundError } from "@/lib/errors";
import Reservation from "@/backend/models/Reservation";
import type {
  CreateReservationInput,
  UpdateReservationInput,
} from "@/backend/validators/reservation";

export async function listReservations() {
  await connectToDatabase();
  return Reservation.find().populate("userId").populate("roomId").lean();
}

export async function getReservationById(id: string) {
  await connectToDatabase();
  const reservation = await Reservation.findById(id)
    .populate("userId")
    .populate("roomId")
    .lean();
  if (!reservation) throw new NotFoundError("Reservation not found");
  return reservation;
}

export async function createReservation(data: CreateReservationInput) {
  await connectToDatabase();
  return (await Reservation.create(data)).toObject();
}

export async function updateReservation(id: string, data: UpdateReservationInput) {
  await connectToDatabase();
  const reservation = await Reservation.findByIdAndUpdate(id, data, { new: true }).lean();
  if (!reservation) throw new NotFoundError("Reservation not found");
  return reservation;
}

export async function deleteReservation(id: string) {
  await connectToDatabase();
  const reservation = await Reservation.findByIdAndDelete(id).lean();
  if (!reservation) throw new NotFoundError("Reservation not found");
}
