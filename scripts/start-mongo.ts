import { MongoMemoryServer } from "mongodb-memory-server";
import { config } from "dotenv";

config({ path: ".env.local" });

async function seedInitialData() {
  const { connectToDatabase } = await import("../src/backend/config/db");
  const { User, Amenity, RoomType, Room, Reservation } = await import("../src/backend/models");
  const bcrypt = (await import("bcryptjs")).default;

  await connectToDatabase();

  const TEST_PASSWORD = "Password123!";
  const TEST_USERS = [
    { name: "Alice Admin", email: "admin@hotel.test", role: "admin" as const },
    { name: "Rita Receptionist", email: "receptionist@hotel.test", role: "receptionist" as const },
    { name: "Gary Guest", email: "guest@hotel.test", role: "guest" as const },
  ];

  for (const testUser of TEST_USERS) {
    const existing = await User.findOne({ email: testUser.email });
    if (!existing) {
      const password = await bcrypt.hash(TEST_PASSWORD, 10);
      await User.create({ ...testUser, password });
      console.log(`Auto-seeded user: ${testUser.email} (${testUser.role})`);
    }
  }

  // Amenities & Rooms Seed
  const AMENITIES = [
    { name: "Free WiFi", icon: "wifi" },
    { name: "Air Conditioning", icon: "snowflake" },
    { name: "Minibar", icon: "wine" },
    { name: "Swimming Pool", icon: "waves" },
    { name: "Breakfast Included", icon: "coffee" },
    { name: "Free Parking", icon: "car" },
  ];

  const amenityIds = new Map<string, string>();
  for (const amenity of AMENITIES) {
    let doc = await Amenity.findOne({ name: amenity.name });
    if (!doc) {
      doc = await Amenity.create(amenity);
    }
    amenityIds.set(amenity.name, String(doc._id));
  }

  const ROOM_TYPES = [
    {
      name: "Standard Room",
      description: "Comfortable room with all essentials.",
      basePrice: 120,
      capacity: 2,
      amenityNames: ["Free WiFi", "Air Conditioning"],
      rooms: [
        { roomNumber: "101", floor: 1 },
        { roomNumber: "102", floor: 1 },
        { roomNumber: "103", floor: 1 },
      ],
    },
    {
      name: "Deluxe Room",
      description: "Spacious room with premium furnishings.",
      basePrice: 180,
      capacity: 2,
      amenityNames: ["Free WiFi", "Air Conditioning", "Minibar"],
      rooms: [
        { roomNumber: "201", floor: 2 },
        { roomNumber: "202", floor: 2 },
      ],
    },
    {
      name: "Executive Suite",
      description: "Largest suite with pool access and breakfast.",
      basePrice: 320,
      capacity: 4,
      amenityNames: ["Free WiFi", "Air Conditioning", "Minibar", "Swimming Pool", "Breakfast Included"],
      rooms: [{ roomNumber: "301", floor: 3 }],
    },
  ];

  for (const rt of ROOM_TYPES) {
    let roomType = await RoomType.findOne({ name: rt.name });
    if (!roomType) {
      roomType = await RoomType.create({
        name: rt.name,
        description: rt.description,
 basePrice: rt.basePrice,
        capacity: rt.capacity,
        amenities: rt.amenityNames.map((n) => amenityIds.get(n)),
      });
    }

    for (const room of rt.rooms) {
      const existing = await Room.findOne({ roomNumber: room.roomNumber });
      if (!existing) {
        await Room.create({ ...room, roomTypeId: roomType._id, status: "available" });
      }
    }
  }

  // Sample Reservation
  const guest = await User.findOne({ email: "guest@hotel.test" });
  const room102 = await Room.findOne({ roomNumber: "102" });
  if (guest && room102 && !(await Reservation.findOne({ roomId: room102._id }))) {
    const checkIn = new Date();
    checkIn.setHours(12, 0, 0, 0);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 3);

    await Reservation.create({
      userId: guest._id,
      roomId: room102._id,
      checkIn,
      checkOut,
      status: "checked_in",
      actualCheckIn: checkIn,
      guests: 2,
      totalPrice: 360,
      createdBy: "auto-seed",
    });
    await Room.findByIdAndUpdate(room102._id, { status: "occupied" });
  }

  console.log("Auto-seeding complete! Default Admin: admin@hotel.test / Password123!");
}

async function start() {
  console.log("Starting embedded local MongoDB server...");
  const mongoServer = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: "hotel_db",
    },
  });

  const uri = mongoServer.getUri();
  console.log(`\n==================================================`);
  console.log(` MongoDB Server is live!`);
  console.log(` URI: ${uri}`);
  console.log(` Listening on port 27017`);
  console.log(`==================================================\n`);

  await seedInitialData();

  process.on("SIGINT", async () => {
    console.log("Stopping MongoDB server...");
    await mongoServer.stop();
    process.exit(0);
  });
}

start().catch((err) => {
  console.error("Failed to start embedded MongoDB server:", err);
  process.exit(1);
});
