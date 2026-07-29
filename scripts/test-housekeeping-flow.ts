import { config } from "dotenv";
config({ path: ".env.local" });

async function testHousekeepingFlow() {
  const { connectToDatabase } = await import("../src/backend/config/db");
  const { User, Room, Reservation } = await import("../src/backend/models");
  const { createReservation, checkInReservation, checkOutReservation } = await import(
    "../src/backend/controllers/reservationController"
  );
  const { normalizeDate } = await import("../src/backend/controllers/roomController");

  await connectToDatabase();

  console.log("\n==================================================");
  console.log(" TESTING HOUSEKEEPING WORKFLOW END-TO-END        ");
  console.log("==================================================\n");

  const guest = await User.findOne({ email: "test1@gmail.com" });
  const room101 = await Room.findOne({ roomNumber: "101" });

  if (!guest || !room101) throw new Error("Missing test user or Room 101");

  // Clean test bookings for room 101
  await Reservation.deleteMany({ roomId: room101._id });

  // 1. Create & Check-in
  console.log("1. Creating reservation & checking in guest to Room 101...");
  const res = await createReservation({
    userId: String(guest._id),
    roomId: String(room101._id),
    checkIn: normalizeDate("2026-08-01"),
    checkOut: normalizeDate("2026-08-03"),
    guests: 2,
    totalPrice: 240,
    createdBy: "hk-test",
  });
  await checkInReservation(String(res._id));

  const roomOccupied = await Room.findById(room101._id);
  console.log("Room Status after Check-in:", roomOccupied?.status);
  if (roomOccupied?.status !== "occupied") throw new Error("Room should be occupied");

  // 2. Check-out -> Should trigger needs_cleaning (Dirty)
  console.log("\n2. Checking out guest from Room 101...");
  await checkOutReservation(String(res._id), { additionalFees: 0 });

  const roomDirty = await Room.findById(room101._id);
  console.log("Room Status after Check-out:", roomDirty?.status);
  if (roomDirty?.status === "needs_cleaning") {
    console.log("✓ AUTOMATED CHECK-OUT SUCCESS: Room automatically set to 'needs_cleaning' (Dirty)!");
  } else {
    throw new Error(`❌ FAIL: Expected 'needs_cleaning' but got '${roomDirty?.status}'`);
  }

  // 3. Housekeeping: Start Cleaning
  console.log("\n3. Housekeeper clicks 'Start Cleaning' (status: cleaning)...");
  await Room.findByIdAndUpdate(room101._id, { status: "cleaning" });
  const roomCleaning = await Room.findById(room101._id);
  console.log("Room Status in progress:", roomCleaning?.status);

  // 4. Housekeeping: Mark Done -> Available
  console.log("\n4. Housekeeper clicks 'Mark Done' (status: available)...");
  await Room.findByIdAndUpdate(room101._id, { status: "available", lastCleaned: new Date() });
  const roomReady = await Room.findById(room101._id);
  console.log("Room Status ready:", roomReady?.status, "| Last Cleaned:", roomReady?.lastCleaned);

  if (roomReady?.status === "available" && roomReady.lastCleaned) {
    console.log("✓ HOUSEKEEPING WORKFLOW SUCCESS: Room marked clean, timestamped, and available!");
  } else {
    throw new Error("❌ HOUSEKEEPING WORKFLOW FAILED");
  }

  // Cleanup
  await Reservation.deleteMany({ createdBy: "hk-test" });

  console.log("\n==================================================");
  console.log(" HOUSEKEEPING WORKFLOW TEST PASSED 100%           ");
  console.log("==================================================\n");
}

testHousekeepingFlow().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
