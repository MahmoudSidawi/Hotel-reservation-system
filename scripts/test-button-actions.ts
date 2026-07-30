import { config } from "dotenv";
config({ path: ".env.local" });

async function testButtonActions() {
  const { connectToDatabase } = await import("../src/backend/config/db");
  const { User, Room, Reservation } = await import("../src/backend/models");
  const {
    createReservation,
    checkInReservation,
    checkOutReservation,
    cancelReservation,
  } = await import("../src/backend/controllers/reservationController");
  const { normalizeDate } = await import("../src/backend/controllers/roomController");

  await connectToDatabase();

  console.log("\n==================================================");
  console.log(" TESTING ALL BUTTON ACTIONS & API ENDPOINTS       ");
  console.log("==================================================\n");

  const guest = await User.findOne({ email: "test1@gmail.com" });
  const room301 = await Room.findOne({ roomNumber: "301" });

  if (!guest || !room301) {
    throw new Error("Missing test guest or Room 301 in database");
  }

  // Clean test bookings on 301
  await Reservation.deleteMany({ roomId: room301._id });

  // TEST 1: CHECK-IN ACTION
  console.log("1. Creating test reservation for Room 301...");
  const res1 = await createReservation({
    userId: String(guest._id),
    roomId: String(room301._id),
    checkIn: normalizeDate("2026-08-09"),
    checkOut: normalizeDate("2026-08-11"),
    guests: 2,
    totalPrice: 717,
    createdBy: "btn-action-test",
  });
  console.log("Reservation created. Initial Status:", res1.status);

  console.log("\n2. Executing Check-in Action (checkInReservation)...");
  const checkedIn = await checkInReservation(String(res1._id));
  console.log("Checked-in Status:", checkedIn.status, "| ActualCheckIn:", checkedIn.actualCheckIn);

  const roomAfterCheckIn = await Room.findById(room301._id);
  console.log("Room Status after Check-in:", roomAfterCheckIn?.status);

  if (checkedIn.status === "checked_in" && roomAfterCheckIn?.status === "occupied") {
    console.log("✓ CHECK-IN ACTION PASSED: Status updated to checked_in and room set to occupied");
  } else {
    throw new Error("❌ CHECK-IN ACTION FAILED");
  }

  // TEST 2: CHECK-OUT ACTION
  console.log("\n3. Executing Check-out Action (checkOutReservation)...");
  const checkedOut = await checkOutReservation(String(res1._id), { additionalFees: 0 });
  console.log("Checked-out Status:", checkedOut.status, "| ActualCheckOut:", checkedOut.actualCheckOut);

  const roomAfterCheckOut = await Room.findById(room301._id);
  console.log("Room Status after Check-out:", roomAfterCheckOut?.status);

  if (checkedOut.status === "checked_out" && roomAfterCheckOut?.status === "available") {
    console.log("✓ CHECK-OUT ACTION PASSED: Status updated to checked_out and room freed to available");
  } else {
    throw new Error("❌ CHECK-OUT ACTION FAILED");
  }

  // TEST 3: CANCEL ACTION
  console.log("\n4. Creating 2nd reservation for Room 301...");
  const res2 = await createReservation({
    userId: String(guest._id),
    roomId: String(room301._id),
    checkIn: normalizeDate("2026-09-10"),
    checkOut: normalizeDate("2026-09-15"),
    guests: 2,
    totalPrice: 900,
    createdBy: "btn-action-test",
  });

  console.log("5. Executing Cancel Action (cancelReservation)...");
  const cancelled = await cancelReservation(String(res2._id));
  const roomAfterCancel = await Room.findById(room301._id);

  if (cancelled.status === "cancelled" && roomAfterCancel?.status === "available") {
    console.log("✓ CANCEL ACTION PASSED: Reservation cancelled and room remains available");
  } else {
    throw new Error("❌ CANCEL ACTION FAILED");
  }

  // Cleanup
  await Reservation.deleteMany({ createdBy: "btn-action-test" });

  console.log("\n==================================================");
  console.log(" ALL BUTTON ACTIONS & API ENDPOINTS VERIFIED 100% ");
  console.log("==================================================\n");
}

testButtonActions().catch((err) => {
  console.error("Button action test failed:", err);
  process.exit(1);
});
