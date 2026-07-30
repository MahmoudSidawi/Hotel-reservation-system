import { config } from "dotenv";
config({ path: ".env.local" });

async function runAuditTests() {
  const { connectToDatabase } = await import("../src/backend/config/db");
  const { User, Room, Reservation } = await import("../src/backend/models");
  const { createReservation, listReservations, listReservationsByUser } = await import(
    "../src/backend/controllers/reservationController"
  );
  const { normalizeDate } = await import("../src/backend/controllers/roomController");
  const bcrypt = (await import("bcryptjs")).default;

  await connectToDatabase();

  console.log("\n==================================================");
  console.log(" STARTING SYSTEM OVERHAUL & AUDIT TEST SUITE      ");
  console.log("==================================================\n");

  // 1. Ensure Mohammad test user exists
  let mohammad = await User.findOne({ email: "test1@gmail.com" });
  if (!mohammad) {
    const hashed = await bcrypt.hash("Mohammad12", 10);
    mohammad = await User.create({
      name: "Mohammad",
      email: "test1@gmail.com",
      password: hashed,
      role: "guest",
    });
    console.log("Created test user: Mohammad (test1@gmail.com)");
  }

  const mohammadId = String(mohammad._id);

  // Clean up previous test-audit reservations
  await Reservation.deleteMany({ createdBy: "audit-suite" });

  const room101 = await Room.findOne({ roomNumber: "101" });
  const room103 = await Room.findOne({ roomNumber: "103" });

  if (!room101 || !room103) {
    throw new Error("Required test rooms (101, 103) missing from database");
  }

  // Clean up any active reservations on test rooms for these dates
  await Reservation.deleteMany({ roomId: room101._id });
  await Reservation.deleteMany({ roomId: room103._id });

  let passed = 0;
  let total = 0;

  // TEST 1: RESERVATION OWNERSHIP
  total++;
  console.log("Test 1: Creating reservation for Mohammad (test1@gmail.com)...");
  const res1 = await createReservation({
    userId: mohammadId,
    roomId: String(room101._id),
    checkIn: normalizeDate("2026-09-01"),
    checkOut: normalizeDate("2026-09-05"),
    guests: 2,
    totalPrice: 480,
    createdBy: "audit-suite",
  });

  const allReservations = await listReservations();
  const fetchedRes = allReservations.find((r) => String(r._id) === String(res1._id));

  const populatedUser = fetchedRes?.userId as any;
  if (populatedUser && populatedUser.email === "test1@gmail.com" && populatedUser.name.includes("Mohammad")) {
    console.log("✓ PASSED: Reservation correctly populated with Mohammad (test1@gmail.com)");
    passed++;
  } else {
    console.error("❌ FAILED: Reservation populated with wrong user:", populatedUser);
  }

  // TEST 2: MULTIPLE RESERVATIONS PER CUSTOMER
  total++;
  console.log("\nTest 2: Creating 2nd reservation for Mohammad for Room 103...");
  const res2 = await createReservation({
    userId: mohammadId,
    roomId: String(room103._id),
    checkIn: normalizeDate("2026-09-01"),
    checkOut: normalizeDate("2026-09-05"),
    guests: 2,
    totalPrice: 600,
    createdBy: "audit-suite",
  });

  const mohammadReservations = await listReservationsByUser(mohammadId);
  if (mohammadReservations.length >= 2) {
    console.log(`✓ PASSED: Mohammad holds ${mohammadReservations.length} active reservations under single account`);
    passed++;
  } else {
    console.error("❌ FAILED: Multiple reservations under single customer failed");
  }

  // TEST 3: VERIFY NO HARDCODED ALICE ADMIN FALLBACK
  total++;
  const aliceCount = mohammadReservations.filter((r: any) => r.userId?.email === "admin@hotel.test").length;
  if (aliceCount === 0) {
    console.log("✓ PASSED: Zero Alice Admin fallbacks detected in customer reservations");
    passed++;
  } else {
    console.error("❌ FAILED: Hardcoded Alice Admin detected in customer reservations");
  }

  // Clean up
  await Reservation.deleteMany({ createdBy: "audit-suite" });

  console.log(`\n==================================================`);
  console.log(` AUDIT RESULT: ${passed} / ${total} TESTS PASSED`);
  console.log(`==================================================\n`);

  if (passed === total) {
    console.log("SUCCESS! All system audit requirements verified successfully.");
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAuditTests().catch((err) => {
  console.error("Audit test failed:", err);
  process.exit(1);
});
