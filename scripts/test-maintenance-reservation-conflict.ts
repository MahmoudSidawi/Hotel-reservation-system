import { config } from "dotenv";
config({ path: ".env.local" });

async function testMaintenanceConflict() {
  const { connectToDatabase } = await import("../src/backend/config/db");
  const { User, Room, Reservation, MaintenanceRequest } = await import(
    "../src/backend/models"
  );
  const { createReservation } = await import(
    "../src/backend/controllers/reservationController"
  );
  const {
    createMaintenanceRequest,
    updateMaintenanceRequest,
    listMaintenanceRequests,
  } = await import("../src/backend/controllers/maintenanceController");
  const { normalizeDate, isRoomAvailable } = await import(
    "../src/backend/controllers/roomController"
  );

  await connectToDatabase();

  console.log("\n==================================================");
  console.log(" TESTING MAINTENANCE & RESERVATION INTEGRATION   ");
  console.log("==================================================\n");

  const guest = await User.findOne({ email: "test1@gmail.com" });
  const admin = await User.findOne({ email: "admin@hotel.test" });
  const room201 = await Room.findOne({ roomNumber: "201" });

  if (!guest || !admin || !room201) throw new Error("Missing test entities");

  // Clean test bookings on 201
  await Reservation.deleteMany({ roomId: room201._id });
  await MaintenanceRequest.deleteMany({ roomId: room201._id });
  await Room.findByIdAndUpdate(room201._id, { status: "available" });

  // 1. Mohammad reserves Room 201
  console.log("1. Mohammad creates a reservation for Room 201...");
  const res = await createReservation({
    userId: String(guest._id),
    roomId: String(room201._id),
    checkIn: normalizeDate("2026-08-15"),
    checkOut: normalizeDate("2026-08-18"),
    guests: 2,
    totalPrice: 540,
    createdBy: "maint-res-test",
  });
  console.log("Reservation created ID:", res._id, "| Status:", res.status);

  // 2. Admin reports maintenance on Room 201
  console.log("\n2. Admin reports maintenance on Room 201 ('needs Bed')...");
  const maintReq = await createMaintenanceRequest({
    roomId: String(room201._id),
    reportedBy: String(admin._id),
    reporterRole: "admin",
    category: "furniture",
    priority: "medium",
    title: "needs Bed",
    description: "Replace mattress before guest check-in",
  });

  const roomAfterMaint = await Room.findById(room201._id);
  console.log("Room Status after reporting maintenance:", roomAfterMaint?.status);

  // 3. Verify listMaintenanceRequests populates active reservation
  console.log("\n3. Verifying active reservation detection on maintenance list...");
  const listResult = await listMaintenanceRequests({ roomId: String(room201._id) });
  const foundReq = listResult.requests.find((r) => String(r._id) === String(maintReq._id));

  console.log("Active reservation attached to maintenance request:", foundReq?.activeReservation);

  if (foundReq?.activeReservation?.guestEmail === "test1@gmail.com") {
    console.log("✓ PASSED: System detected Mohammad's active booking on the maintenance card!");
  } else {
    throw new Error("❌ FAILED: Active booking was not detected");
  }

  // 4. Verify room is unbookable for new guests while in maintenance
  console.log("\n4. Verifying room availability is blocked...");
  const avail = await isRoomAvailable(String(room201._id), normalizeDate("2026-08-15"), normalizeDate("2026-08-18"));
  if (avail === false) {
    console.log("✓ PASSED: Room #201 is BLOCKED from new reservations while under maintenance!");
  } else {
    throw new Error("❌ FAILED: Room should be blocked");
  }

  // 5. Admin resolves maintenance request
  console.log("\n5. Admin marks maintenance as 'resolved'...");
  await updateMaintenanceRequest(String(maintReq._id), { status: "resolved" });

  const roomAfterResolve = await Room.findById(room201._id);
  console.log("Room Status after resolving maintenance:", roomAfterResolve?.status);

  if (roomAfterResolve?.status === "reserved") {
    console.log("✓ PASSED: Resolving maintenance restored Room #201 status to 'reserved' for Mohammad's stay!");
  } else {
    throw new Error(`❌ FAILED: Expected status 'reserved' but got '${roomAfterResolve?.status}'`);
  }

  // Cleanup
  await Reservation.deleteMany({ createdBy: "maint-res-test" });
  await MaintenanceRequest.deleteMany({ roomId: room201._id });

  console.log("\n==================================================");
  console.log(" MAINTENANCE & RESERVATION INTEGRATION PASSED 100% ");
  console.log("==================================================\n");
}

testMaintenanceConflict().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
