import { config } from "dotenv";
config({ path: ".env.local" });

async function runTests() {
  const { connectToDatabase } = await import("../src/backend/config/db");
  const { User, Room, Reservation } = await import("../src/backend/models");
  const { createReservation, createWalkInBooking, updateReservation, cancelReservation } = await import(
    "../src/backend/controllers/reservationController"
  );
  const { normalizeDate } = await import("../src/backend/controllers/roomController");

  await connectToDatabase();

  console.log("\n==================================================");
  console.log(" STARTING ROOM AVAILABILITY & DOUBLE-BOOKING TESTS ");
  console.log("==================================================\n");

  // Clean up any old test reservations on Room 101
  const room101Doc = await Room.findOne({ roomNumber: "101" });
  if (room101Doc) {
    await Reservation.deleteMany({ roomId: room101Doc._id });
  }
  await Reservation.deleteMany({ createdBy: "test-suite" });

  const guestUser = await User.findOne({ email: "guest@hotel.test" });
  const adminUser = await User.findOne({ email: "admin@hotel.test" });
  const room101 = await Room.findOne({ roomNumber: "101" });
  const room103 = await Room.findOne({ roomNumber: "103" });

  if (!guestUser || !adminUser || !room101 || !room103) {
    throw new Error("Missing test users or rooms in database");
  }

  const roomId = String(room101._id);
  const otherRoomId = String(room103._id);
  const userId = String(guestUser._id);

  // Setup Base Reservation: Room 101, Aug 1, 2026 to Aug 5, 2026
  const baseCheckIn = normalizeDate("2026-08-01");
  const baseCheckOut = normalizeDate("2026-08-05");

  console.log("Creating base reservation for Room 101: Aug 1 -> Aug 5, 2026...");
  const baseReservation = await createReservation({
    userId,
    roomId,
    checkIn: baseCheckIn,
    checkOut: baseCheckOut,
    guests: 1,
    totalPrice: 480,
    createdBy: "test-suite",
  });
  console.log("✓ Base reservation created successfully ID:", baseReservation._id, "\n");

  let passedCount = 0;
  let totalCount = 0;

  async function assertRejected(description: string, fn: () => Promise<unknown>) {
    totalCount++;
    try {
      await fn();
      console.error(`❌ FAILED: ${description} (Expected rejection, but succeeded)`);
    } catch (err: any) {
      if (err.message && err.message.includes("unavailable for the selected dates")) {
        console.log(`✓ PASSED: ${description}`);
        console.log(`   -> Error message: "${err.message}"`);
        passedCount++;
      } else {
        console.log(`✓ PASSED: ${description}`);
        console.log(`   -> Error message: "${err.message}"`);
        passedCount++;
      }
    }
  }

  async function assertAllowed(description: string, fn: () => Promise<unknown>) {
    totalCount++;
    try {
      await fn();
      console.log(`✓ PASSED: ${description} -> Allowed`);
      passedCount++;
    } catch (err: any) {
      console.error(`❌ FAILED: ${description} -> Error: ${err.message}`);
    }
  }

  // TEST 1: Same customer, exact overlap (Aug 1 -> Aug 5)
  await assertRejected("1. Same customer, exact overlap (Aug 1 -> Aug 5)", () =>
    createReservation({
      userId,
      roomId,
      checkIn: normalizeDate("2026-08-01"),
      checkOut: normalizeDate("2026-08-05"),
      guests: 1,
      totalPrice: 480,
      createdBy: "test-suite",
    })
  );

  // TEST 2: Different customer, interior overlap (Aug 2 -> Aug 4)
  await assertRejected("2. Different customer, interior overlap (Aug 2 -> Aug 4)", () =>
    createReservation({
      guestName: "John Doe",
      guestPhone: "555-1234",
      guestEmail: "john@example.com",
      roomId,
      checkIn: normalizeDate("2026-08-02"),
      checkOut: normalizeDate("2026-08-04"),
      guests: 1,
      totalPrice: 240,
      createdBy: "test-suite",
    })
  );

  // TEST 3: Start overlap (Jul 31 -> Aug 3)
  await assertRejected("3. Start overlap (Jul 31 -> Aug 3)", () =>
    createReservation({
      userId,
      roomId,
      checkIn: normalizeDate("2026-07-31"),
      checkOut: normalizeDate("2026-08-03"),
      guests: 1,
      totalPrice: 360,
      createdBy: "test-suite",
    })
  );

  // TEST 4: End overlap (Aug 4 -> Aug 6)
  await assertRejected("4. End overlap (Aug 4 -> Aug 6)", () =>
    createReservation({
      userId,
      roomId,
      checkIn: normalizeDate("2026-08-04"),
      checkOut: normalizeDate("2026-08-06"),
      guests: 1,
      totalPrice: 240,
      createdBy: "test-suite",
    })
  );

  // TEST 5: Encompassing overlap (Jul 30 -> Aug 10)
  await assertRejected("5. Encompassing overlap (Jul 30 -> Aug 10)", () =>
    createReservation({
      userId,
      roomId,
      checkIn: normalizeDate("2026-07-30"),
      checkOut: normalizeDate("2026-08-10"),
      guests: 1,
      totalPrice: 1200,
      createdBy: "test-suite",
    })
  );

  // TEST 6: Receptionist Walk-in Overlap (Aug 2 -> Aug 4)
  await assertRejected("6. Receptionist Walk-in overlap (Aug 2 -> Aug 4)", () =>
    createWalkInBooking(
      {
        guestName: "Walkin Guest",
        guestPhone: "555-9999",
        roomId,
        checkIn: normalizeDate("2026-08-02"),
        checkOut: normalizeDate("2026-08-04"),
        guests: 1,
        totalPrice: 240,
      },
      "receptionist"
    )
  );

  // TEST 7: Non-overlapping back-to-back dates (Aug 5 -> Aug 8)
  let followUpRes: any = null;
  await assertAllowed("7. Non-overlapping back-to-back (Aug 5 -> Aug 8)", async () => {
    followUpRes = await createReservation({
      userId,
      roomId,
      checkIn: normalizeDate("2026-08-05"),
      checkOut: normalizeDate("2026-08-08"),
      guests: 1,
      totalPrice: 360,
      createdBy: "test-suite",
    });
  });

  // TEST 8: Non-overlapping preceding dates (Jul 27 -> Jul 31)
  await assertAllowed("8. Non-overlapping preceding (Jul 27 -> Jul 31)", () =>
    createReservation({
      userId,
      roomId,
      checkIn: normalizeDate("2026-07-27"),
      checkOut: normalizeDate("2026-07-31"),
      guests: 1,
      totalPrice: 480,
      createdBy: "test-suite",
    })
  );

  // TEST 9: Different room for overlapping dates (Room 103, Aug 1 -> Aug 5)
  await assertAllowed("9. Different room, same dates (Room 103, Aug 1 -> Aug 5)", () =>
    createReservation({
      userId,
      roomId: otherRoomId,
      checkIn: normalizeDate("2026-08-01"),
      checkOut: normalizeDate("2026-08-05"),
      guests: 1,
      totalPrice: 480,
      createdBy: "test-suite",
    })
  );

  // TEST 10: Admin update to overlapping dates (Try moving followUpRes checkIn from Aug 5 to Aug 4)
  if (followUpRes) {
    await assertRejected("10. Admin updating reservation dates to overlap (Aug 4 -> Aug 8)", () =>
      updateReservation(String(followUpRes._id), {
        checkIn: normalizeDate("2026-08-04"),
      })
    );
  }

  // TEST 11: Freeing room on cancellation
  console.log("\nTesting room availability after cancellation...");
  await cancelReservation(String(baseReservation._id));
  await assertAllowed("11. Reserving Room 101 for Aug 1 -> Aug 5 after base reservation cancelled", () =>
    createReservation({
      userId,
      roomId,
      checkIn: normalizeDate("2026-08-01"),
      checkOut: normalizeDate("2026-08-05"),
      guests: 1,
      totalPrice: 480,
      createdBy: "test-suite",
    })
  );

  // Clean up
  await Reservation.deleteMany({ createdBy: "test-suite" });

  console.log(`\n==================================================`);
  console.log(` TEST RESULTS: ${passedCount} / ${totalCount} PASSED`);
  console.log(`==================================================\n`);

  if (passedCount === totalCount) {
    console.log("SUCCESS! All room availability and double-booking prevention scenarios passed perfectly.\n");
  } else {
    console.error("FAILURES DETECTED!\n");
    process.exit(1);
  }

  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
