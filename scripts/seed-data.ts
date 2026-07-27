import { config } from "dotenv";
config({ path: ".env.local" });

const AMENITIES = [
  { name: "Free WiFi", icon: "wifi" },
  { name: "Air Conditioning", icon: "snowflake" },
  { name: "Minibar", icon: "wine" },
  { name: "Swimming Pool", icon: "waves" },
  { name: "Breakfast Included", icon: "coffee" },
  { name: "Free Parking", icon: "car" },
];

const ROOM_TYPES = [
  {
    name: "Standard Room",
    description: "Comfortable room with all the essentials for a pleasant stay.",
    basePrice: 120,
    capacity: 2,
    amenityNames: ["Free WiFi", "Air Conditioning"],
    rooms: [
      { roomNumber: "101", floor: 1 },
      { roomNumber: "102", floor: 1 },
      { roomNumber: "103", floor: 1 },
      { roomNumber: "104", floor: 1 },
      { roomNumber: "105", floor: 1 },
    ],
  },
  {
    name: "Deluxe Room",
    description: "Spacious room with premium furnishings and a minibar.",
    basePrice: 180,
    capacity: 2,
    amenityNames: ["Free WiFi", "Air Conditioning", "Minibar"],
    rooms: [
      { roomNumber: "201", floor: 2 },
      { roomNumber: "202", floor: 2 },
      { roomNumber: "203", floor: 2 },
      { roomNumber: "204", floor: 2 },
    ],
  },
  {
    name: "Executive Suite",
    description: "Our largest suite, with pool access and breakfast included.",
    basePrice: 320,
    capacity: 4,
    amenityNames: [
      "Free WiFi",
      "Air Conditioning",
      "Minibar",
      "Swimming Pool",
      "Breakfast Included",
    ],
    rooms: [
      { roomNumber: "301", floor: 3 },
      { roomNumber: "302", floor: 3 },
    ],
  },
  {
    name: "Single Room",
    description: "Compact, budget-friendly room ideal for solo travelers.",
    basePrice: 90,
    capacity: 1,
    amenityNames: ["Free WiFi", "Air Conditioning"],
    rooms: [
      { roomNumber: "106", floor: 1 },
      { roomNumber: "107", floor: 1 },
      { roomNumber: "108", floor: 1 },
    ],
  },
  {
    name: "Family Room",
    description: "Extra-spacious room designed for families, with room for everyone to relax.",
    basePrice: 250,
    capacity: 4,
    amenityNames: ["Free WiFi", "Air Conditioning", "Minibar"],
    rooms: [
      { roomNumber: "401", floor: 4 },
      { roomNumber: "402", floor: 4 },
    ],
  },
  {
    name: "Penthouse Suite",
    description: "Our most exclusive suite, with panoramic views and every amenity included.",
    basePrice: 500,
    capacity: 4,
    amenityNames: [
      "Free WiFi",
      "Air Conditioning",
      "Minibar",
      "Swimming Pool",
      "Breakfast Included",
      "Free Parking",
    ],
    rooms: [{ roomNumber: "501", floor: 5 }],
  },
];

// Real room photos stored as RoomImage documents (imageUrl is what the schema
// holds). First entry per type is the primary image. Without these, the UI has
// nothing to show and falls back to a generic placeholder.
const ROOM_IMAGES: Record<string, string[]> = {
  "Standard Room": [
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1600",
  ],
  "Deluxe Room": [
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1611048268330-53de574cae3b?auto=format&fit=crop&q=80&w=1600",
  ],
  "Executive Suite": [
    "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=1600",
  ],
  "Single Room": [
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1505692952047-1a78307da8f2?auto=format&fit=crop&q=80&w=1600",
  ],
  "Family Room": [
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&q=80&w=1600",
  ],
  "Penthouse Suite": [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1600",
  ],
};

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
}

async function main() {
  const { connectToDatabase } = await import("../src/backend/config/db");
  const { Amenity, RoomType, RoomImage, Room, User, Reservation } = await import("../src/backend/models");

  await connectToDatabase();

  // Amenities
  const amenityIds = new Map<string, string>();
  for (const amenity of AMENITIES) {
    let doc = await Amenity.findOne({ name: amenity.name });
    if (!doc) {
      doc = await Amenity.create(amenity);
      console.log(`Created amenity: ${amenity.name}`);
    }
    amenityIds.set(amenity.name, String(doc._id));
  }

  // Room types + rooms
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
      console.log(`Created room type: ${rt.name}`);
    }

    for (const room of rt.rooms) {
      const existing = await Room.findOne({ roomNumber: room.roomNumber });
      if (existing) {
        console.log(`Already exists: room ${room.roomNumber}`);
        continue;
      }
      await Room.create({ ...room, roomTypeId: roomType._id, status: "available" });
      console.log(`Created room: ${room.roomNumber} (${rt.name})`);
    }

    // Room images (skip if this type already has any)
    const imageUrls = ROOM_IMAGES[rt.name] ?? [];
    const hasImages = await RoomImage.findOne({ roomTypeId: roomType._id });
    if (!hasImages && imageUrls.length > 0) {
      await RoomImage.insertMany(
        imageUrls.map((imageUrl, i) => ({
          roomTypeId: roomType._id,
          imageUrl,
          isPrimary: i === 0,
        }))
      );
      console.log(`Created ${imageUrls.length} images for ${rt.name}`);
    }
  }

  // A couple of sample reservations so the receptionist dashboard has data.
  const guest = await User.findOne({ email: "guest@hotel.test" });
  const standardRoom = await Room.findOne({ roomNumber: "102" });
  const deluxeRoom = await Room.findOne({ roomNumber: "201" });

  if (guest && standardRoom && !(await Reservation.findOne({ roomId: standardRoom._id }))) {
    await Reservation.create({
      userId: guest._id,
      roomId: standardRoom._id,
      checkIn: daysFromNow(-1),
      checkOut: daysFromNow(2),
      status: "checked_in",
      actualCheckIn: daysFromNow(-1),
      guests: 2,
      totalPrice: 360,
      createdBy: "seed-script",
    });
    await Room.findByIdAndUpdate(standardRoom._id, { status: "occupied" });
    console.log("Created sample reservation: currently checked-in guest in room 102");
  }

  if (deluxeRoom && !(await Reservation.findOne({ roomId: deluxeRoom._id }))) {
    await Reservation.create({
      guestName: "Walk-in Sample Guest",
      guestPhone: "555-0199",
      isWalkIn: true,
      roomId: deluxeRoom._id,
      checkIn: daysFromNow(0),
      checkOut: daysFromNow(3),
      status: "confirmed",
      guests: 1,
      totalPrice: 540,
      createdBy: "seed-script",
    });
    await Room.findByIdAndUpdate(deluxeRoom._id, { status: "reserved" });
    console.log("Created sample reservation: arriving today in room 201");
  }

  console.log("\nSeed data complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
