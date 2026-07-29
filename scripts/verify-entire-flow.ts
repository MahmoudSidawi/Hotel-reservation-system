import { config } from "dotenv";
config({ path: ".env.local" });

async function verifyEntireFlow() {
  const { connectToDatabase } = await import("../src/backend/config/db");
  const { User, Room, Reservation } = await import("../src/backend/models");
  const { login } = await import("../src/backend/controllers/authController");
  const { verifySession } = await import("../src/lib/auth");
  const { createReservation, listReservations, listReservationsByUser } = await import(
    "../src/backend/controllers/reservationController"
  );
  const { normalizeDate } = await import("../src/backend/controllers/roomController");

  await connectToDatabase();

  console.log("\n==================================================");
  console.log(" END-TO-END RESERVATION OWNERSHIP VERIFICATION    ");
  console.log("==================================================\n");

  // Step 1: Login as Mohammad
  console.log("1. Authenticating as Mohammad (test1@gmail.com)...");
  const { token, user: loggedUser } = await login({
    email: "test1@gmail.com",
    password: "Mohammad12",
  });
  console.log("✓ Login successful. User returned by auth controller:", loggedUser);

  // Step 2: Verify JWT session decoding
  console.log("\n2. Verifying JWT session payload...");
  const session = await verifySession(token);
  if (!session || session.email !== "test1@gmail.com") {
    throw new Error("JWT session verification failed!");
  }
  console.log("✓ JWT decoded session payload:", session);

  // Step 3: Create reservation using session.sub
  const room201 = await Room.findOne({ roomNumber: "201" });
  if (!room201) throw new Error("Room 201 missing from DB");

  // Clean up any test reservation on 201 for test dates
  const checkIn = normalizeDate("2026-10-01");
  const checkOut = normalizeDate("2026-10-05");
  await Reservation.deleteMany({ roomId: room201._id, checkIn });

  console.log("\n3. Creating reservation using authenticated session.sub (Mohammad)...");
  const createdRes = await createReservation({
    userId: session.sub, // Injected from JWT in route.ts
    roomId: String(room201._id),
    checkIn,
    checkOut,
    guests: 2,
    totalPrice: 720,
    guestName: session.name,
    guestEmail: session.email,
    createdBy: session.name,
  });

  console.log("✓ Reservation created in DB:", {
    id: createdRes._id,
    userId: createdRes.userId,
    guestName: createdRes.guestName,
    guestEmail: createdRes.guestEmail,
  });

  // Step 4: Verify Admin / Receptionist query (listReservations)
  console.log("\n4. Fetching all reservations via listReservations() (Admin & Receptionist view)...");
  const allReservations = await listReservations();
  const found = allReservations.find((r) => String(r._id) === String(createdRes._id));

  const populatedUser = found?.userId as any;
  console.log("Populated userId on fetched reservation:", populatedUser);

  if (populatedUser && populatedUser.email === "test1@gmail.com") {
    console.log("✓ VERIFIED: Admin & Receptionist view populates Mohammad (test1@gmail.com)!");
  } else {
    throw new Error(`FAILED: Populated user is wrong: ${JSON.stringify(populatedUser)}`);
  }

  // Step 5: Verify My Reservations query (listReservationsByUser)
  console.log("\n5. Fetching customer reservations via listReservationsByUser(Mohammad._id)...");
  const myReservations = await listReservationsByUser(session.sub);
  const foundMy = myReservations.find((r) => String(r._id) === String(createdRes._id));

  if (foundMy) {
    console.log("✓ VERIFIED: My Reservations view returns reservation owned by Mohammad!");
  } else {
    throw new Error("FAILED: Reservation not found in listReservationsByUser");
  }

  // Cleanup test reservation
  await Reservation.deleteMany({ _id: createdRes._id });

  console.log("\n==================================================");
  console.log(" ALL END-TO-END VERIFICATION CHECKS PASSED 100%   ");
  console.log("==================================================\n");
}

verifyEntireFlow().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
