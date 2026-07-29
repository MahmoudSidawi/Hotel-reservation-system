import { config } from "dotenv";
config({ path: ".env.local" });

async function testUnbookableStatuses() {
  const { connectToDatabase } = await import("../src/backend/config/db");
  const { User, Room, Reservation } = await import("../src/backend/models");
  const { isRoomAvailable, getAvailableRooms, normalizeDate } = await import(
    "../src/backend/controllers/roomController"
  );
  const { createReservation } = await import(
    "../src/backend/controllers/reservationController"
  );

  await connectToDatabase();

  console.log("\n==================================================");
  console.log(" TESTING MAINTENANCE & CLEANING ROOM BLOCKING     ");
  console.log("==================================================\n");

  const guest = await User.findOne({ email: "test1@gmail.com" });
  const room101 = await Room.findOne({ roomNumber: "101" });
  if (!guest || !room101) throw new Error("Missing test guest or Room 101");

  const checkIn = normalizeDate("2026-10-10");
  const checkOut = normalizeDate("2026-10-12");

  // TEST 1: Maintenance status
  console.log("1. Setting Room 101 status to 'maintenance'...");
  await Room.findByIdAndUpdate(room101._id, { status: "maintenance" });

  const availMaint = await isRoomAvailable(String(room101._id), checkIn, checkOut);
  console.log("isRoomAvailable for maintenance room:", availMaint);

  if (availMaint === false) {
    console.log("✓ PASSED: Room in 'maintenance' is BLOCKED from reservation!");
  } else {
    throw new Error("❌ FAILED: Maintenance room should not be available");
  }

  // TEST 2: Needs Cleaning status
  console.log("\n2. Setting Room 101 status to 'needs_cleaning'...");
  await Room.findByIdAndUpdate(room101._id, { status: "needs_cleaning" });

  const availNeedsClean = await isRoomAvailable(String(room101._id), checkIn, checkOut);
  console.log("isRoomAvailable for needs_cleaning room:", availNeedsClean);

  if (availNeedsClean === false) {
    console.log("✓ PASSED: Room in 'needs_cleaning' is BLOCKED from reservation!");
  } else {
    throw new Error("❌ FAILED: Dirty room should not be available");
  }

  // TEST 3: Cleaning in progress status
  console.log("\n3. Setting Room 101 status to 'cleaning'...");
  await Room.findByIdAndUpdate(room101._id, { status: "cleaning" });

  const availCleaning = await isRoomAvailable(String(room101._id), checkIn, checkOut);
  console.log("isRoomAvailable for cleaning room:", availCleaning);

  if (availCleaning === false) {
    console.log("✓ PASSED: Room in 'cleaning' is BLOCKED from reservation!");
  } else {
    throw new Error("❌ FAILED: Cleaning room should not be available");
  }

  // TEST 4: Attempting createReservation on dirty room should throw ConflictError
  console.log("\n4. Attempting to create reservation on room undergoing cleaning...");
  let threwError = false;
  try {
    await createReservation({
      userId: String(guest._id),
      roomId: String(room101._id),
      checkIn,
      checkOut,
      guests: 2,
      totalPrice: 240,
      createdBy: "unbookable-test",
    });
  } catch (err: any) {
    threwError = true;
    console.log("✓ Reservation correctly rejected with error:", err.message);
  }

  if (threwError) {
    console.log("✓ PASSED: Backend rejected reservation creation on unserviceable room!");
  } else {
    throw new Error("❌ FAILED: Reservation should have been rejected");
  }

  // TEST 5: Restore room to available
  console.log("\n5. Restoring Room 101 status to 'available'...");
  await Room.findByIdAndUpdate(room101._id, { status: "available" });
  const availReady = await isRoomAvailable(String(room101._id), checkIn, checkOut);
  console.log("isRoomAvailable for clean 'available' room:", availReady);

  if (availReady === true) {
    console.log("✓ PASSED: Clean & ready room is available for reservation!");
  } else {
    throw new Error("❌ FAILED: Clean room should be available");
  }

  console.log("\n==================================================");
  console.log(" ALL MAINTENANCE & CLEANING BLOCKING CHECKS PASSED ");
  console.log("==================================================\n");
}

testUnbookableStatuses().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
