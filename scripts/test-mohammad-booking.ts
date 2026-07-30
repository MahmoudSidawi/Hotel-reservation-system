import { config } from "dotenv";
config({ path: ".env.local" });

async function testMohammadBooking() {
  const { connectToDatabase } = await import("../src/backend/config/db");
  const { User, Room, Reservation } = await import("../src/backend/models");
  const { createReservation, listReservations } = await import(
    "../src/backend/controllers/reservationController"
  );
  const { normalizeDate } = await import("../src/backend/controllers/roomController");

  await connectToDatabase();

  console.log("1. Finding user Mohammad (test1@gmail.com)...");
  const mohammad = await User.findOne({ email: "test1@gmail.com" });
  if (!mohammad) throw new Error("Mohammad test user not found");

  const room101 = await Room.findOne({ roomNumber: "101" });
  if (!room101) throw new Error("Room 101 not found");

  // Clean test bookings for dates Aug 15 -> Aug 18
  await Reservation.deleteMany({ checkIn: normalizeDate("2026-08-15") });

  console.log("2. Creating reservation with userId = Mohammad._id...");
  const res = await createReservation({
    userId: String(mohammad._id),
    roomId: String(room101._id),
    checkIn: normalizeDate("2026-08-15"),
    checkOut: normalizeDate("2026-08-18"),
    guests: 2,
    totalPrice: 403,
    createdBy: "mohammad-test",
  });

  console.log("Reservation created ID:", res._id);

  console.log("3. Fetching listReservations() (Receptionist / Admin Query)...");
  const allReservations = await listReservations();
  const found = allReservations.find((r) => String(r._id) === String(res._id));

  console.log("Populated userId on fetched reservation:", found?.userId);

  const populatedUser = found?.userId as any;
  if (populatedUser?.email === "test1@gmail.com") {
    console.log("\n✓ SUCCESS: Reservation is owned and displayed under Mohammad (test1@gmail.com)!");
  } else {
    console.error("\n❌ FAILED: Reservation populated wrong user:", populatedUser);
  }

  // Cleanup
  await Reservation.deleteMany({ createdBy: "mohammad-test" });
}

testMohammadBooking().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
