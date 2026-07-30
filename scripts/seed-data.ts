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

// Sample reservations so the receptionist Check-In / Check-Out screens have
// something to find. Arrivals must start today or earlier — checkInReservation
// rejects a check-in before the arrival date.
//   status "pending"/"confirmed" -> searchable on the Check-In screen
//   status "checked_in"          -> searchable on the Check-Out screen
const SAMPLE_RESERVATIONS = [
  // --- Ready to check in (arriving today) ---
  {
    roomNumber: "201",
    guestName: "Walk-in Sample Guest",
    guestPhone: "555-0199",
    isWalkIn: true,
    checkIn: 0,
    checkOut: 3,
    status: "confirmed",
    guests: 1,
    totalPrice: 540,
  },
  {
    roomNumber: "103",
    guestName: "Omar Haddad",
    guestPhone: "555-0142",
    guestEmail: "omar.haddad@example.com",
    checkIn: 0,
    checkOut: 2,
    status: "confirmed",
    guests: 2,
    totalPrice: 240,
  },
  {
    roomNumber: "104",
    guestName: "Layla Nasser",
    guestPhone: "555-0128",
    guestEmail: "layla.nasser@example.com",
    checkIn: 0,
    checkOut: 4,
    status: "confirmed",
    guests: 2,
    totalPrice: 480,
  },
  {
    roomNumber: "106",
    guestName: "Yusuf Karim",
    guestPhone: "555-0173",
    checkIn: 0,
    checkOut: 1,
    status: "pending",
    guests: 1,
    totalPrice: 90,
  },
  {
    roomNumber: "202",
    guestName: "Sara Mansour",
    guestPhone: "555-0156",
    guestEmail: "sara.mansour@example.com",
    checkIn: 0,
    checkOut: 3,
    status: "confirmed",
    guests: 2,
    totalPrice: 540,
  },
  {
    roomNumber: "301",
    guestName: "Daniel Fischer",
    guestPhone: "555-0110",
    guestEmail: "daniel.fischer@example.com",
    checkIn: -1,
    checkOut: 4,
    status: "confirmed",
    guests: 4,
    totalPrice: 1600,
  },

  // --- Currently in house, ready to check out ---
  {
    // The registered test guest, so the customer dashboard has a live stay too.
    roomNumber: "102",
    userEmail: "guest@hotel.test",
    checkIn: -1,
    checkOut: 2,
    status: "checked_in",
    guests: 2,
    totalPrice: 360,
  },
  {
    roomNumber: "105",
    guestName: "Nour Khalil",
    guestPhone: "555-0164",
    checkIn: -2,
    checkOut: 0,
    status: "checked_in",
    guests: 2,
    totalPrice: 240,
  },
  {
    roomNumber: "107",
    guestName: "Elena Petrova",
    guestPhone: "555-0135",
    guestEmail: "elena.petrova@example.com",
    checkIn: -3,
    checkOut: 0,
    status: "checked_in",
    guests: 1,
    totalPrice: 270,
  },
  {
    roomNumber: "203",
    guestName: "Marcus Wright",
    guestPhone: "555-0188",
    isWalkIn: true,
    checkIn: -1,
    checkOut: 1,
    status: "checked_in",
    guests: 2,
    totalPrice: 360,
  },
  {
    roomNumber: "401",
    guestName: "Hana Ibrahim",
    guestPhone: "555-0121",
    guestEmail: "hana.ibrahim@example.com",
    checkIn: -4,
    checkOut: 1,
    status: "checked_in",
    guests: 4,
    totalPrice: 1250,
  },
  {
    roomNumber: "501",
    guestName: "Victoria Lane",
    guestPhone: "555-0107",
    guestEmail: "victoria.lane@example.com",
    checkIn: -2,
    checkOut: 2,
    status: "checked_in",
    guests: 2,
    totalPrice: 2000,
  },
] as const;

// Room.status mirrors where the reservation currently stands.
const ROOM_STATUS_FOR_RESERVATION: Record<string, string> = {
  pending: "reserved",
  confirmed: "reserved",
  checked_in: "occupied",
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

  // Sample reservations so the receptionist screens have data to work with.
  for (const sample of SAMPLE_RESERVATIONS) {
    const room = await Room.findOne({ roomNumber: sample.roomNumber });
    if (!room) {
      console.log(`Skipped reservation: room ${sample.roomNumber} not found`);
      continue;
    }
    if (await Reservation.findOne({ roomId: room._id })) {
      console.log(`Already exists: reservation for room ${sample.roomNumber}`);
      continue;
    }

    const userEmail = "userEmail" in sample ? sample.userEmail : undefined;
    let userId: unknown;
    if (userEmail) {
      const user = await User.findOne({ email: userEmail });
      if (!user) {
        console.log(`Skipped reservation for room ${sample.roomNumber}: no user ${userEmail}`);
        continue;
      }
      userId = user._id;
    }

    await Reservation.create({
      userId,
      guestName: "guestName" in sample ? sample.guestName : undefined,
      guestPhone: "guestPhone" in sample ? sample.guestPhone : undefined,
      guestEmail: "guestEmail" in sample ? sample.guestEmail : undefined,
      isWalkIn: "isWalkIn" in sample ? sample.isWalkIn : false,
      roomId: room._id,
      checkIn: daysFromNow(sample.checkIn),
      checkOut: daysFromNow(sample.checkOut),
      status: sample.status,
      actualCheckIn: sample.status === "checked_in" ? daysFromNow(sample.checkIn) : undefined,
      guests: sample.guests,
      totalPrice: sample.totalPrice,
      createdBy: "seed-script",
    });

    const roomStatus = ROOM_STATUS_FOR_RESERVATION[sample.status];
    if (roomStatus) await Room.findByIdAndUpdate(room._id, { status: roomStatus });

    console.log(
      `Created reservation: ${userEmail ?? ("guestName" in sample ? sample.guestName : "guest")} ` +
        `in room ${sample.roomNumber} (${sample.status})`
    );
  }

  console.log("\nSeed data complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
