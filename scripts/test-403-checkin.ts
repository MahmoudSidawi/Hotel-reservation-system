import { config } from "dotenv";
config({ path: ".env.local" });

async function testCheckInPermissions() {
  const { connectToDatabase } = await import("../src/backend/config/db");
  const { User, Room, Reservation } = await import("../src/backend/models");
  const { login } = await import("../src/backend/controllers/authController");
  const { verifySession } = await import("../src/lib/auth");
  const { checkInReservation } = await import("../src/backend/controllers/reservationController");
  const { normalizeDate } = await import("../src/backend/controllers/roomController");

  await connectToDatabase();

  console.log("\n==================================================");
  console.log(" TESTING CHECK-IN PERMISSIONS FOR ROLES           ");
  console.log("==================================================\n");

  // 1. Test Admin Login & Token
  console.log("1. Authenticating as Alice Admin (admin@hotel.test)...");
  const adminAuth = await login({ email: "admin@hotel.test", password: "Password123!" });
  const adminSession = await verifySession(adminAuth.token);
  console.log("Admin Session Role:", adminSession?.role);

  // 2. Test Receptionist Login & Token
  console.log("\n2. Authenticating as Rita Receptionist (receptionist@hotel.test)...");
  const recepAuth = await login({ email: "receptionist@hotel.test", password: "Password123!" });
  const recepSession = await verifySession(recepAuth.token);
  console.log("Receptionist Session Role:", recepSession?.role);

  // 3. Test Guest Login & Token
  console.log("\n3. Authenticating as Mohammad (test1@gmail.com)...");
  const guestAuth = await login({ email: "test1@gmail.com", password: "Mohammad12" });
  const guestSession = await verifySession(guestAuth.token);
  console.log("Guest Session Role:", guestSession?.role);

  // Create a test pending reservation
  const room101 = await Room.findOne({ roomNumber: "101" });
  if (!room101) throw new Error("Room 101 missing");

  const res = await Reservation.create({
    userId: guestAuth.user.id,
    roomId: room101._id,
    checkIn: normalizeDate("2026-08-01"),
    checkOut: normalizeDate("2026-08-05"),
    guests: 2,
    totalPrice: 480,
    status: "pending",
    createdBy: "perm-test",
  });

  console.log("\n4. Testing checkInReservation() logic...");
  const updated = await checkInReservation(String(res._id));
  console.log("Check-in successful! New status:", updated.status);

  // Cleanup
  await Reservation.findByIdAndDelete(res._id);

  console.log("\n==================================================");
  console.log(" CHECK-IN PERMISSION TEST COMPLETE                ");
  console.log("==================================================\n");
}

testCheckInPermissions().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
