import { connectToDatabase } from "@/backend/config/db";
import Room from "@/backend/models/Room";
import RoomType from "@/backend/models/RoomType";
import Reservation from "@/backend/models/Reservation";
import Amenity from "@/backend/models/Amenity";
import RoomImage from "@/backend/models/RoomImage";
import User from "@/backend/models/User";
import { fallbackImageFor } from "@/lib/rooms-data";

export type ConciergeMessage = {
  sender: "user" | "concierge";
  text: string;
  timestamp?: string;
};

export type ConciergeCardRoom = {
  _id: string;
  typeId: string;
  roomNumber: string;
  name: string;
  basePrice: number;
  capacity: number;
  description: string;
  imageUrl: string;
  floor: number;
  amenities: string[];
  recommendationReason?: string;
};

export type ConciergeCardReservation = {
  _id: string;
  roomNumber: string;
  roomTypeName: string;
  checkIn: string;
  checkOut: string;
  status: string;
  guests: number;
  totalPrice: number;
};

export type ConciergeResponse = {
  reply: string;
  suggestedReplies?: string[];
  cardsType?: "rooms" | "reservations" | "amenities" | null;
  rooms?: ConciergeCardRoom[];
  reservations?: ConciergeCardReservation[];
};

export async function processConciergeMessage(
  message: string,
  history: ConciergeMessage[] = [],
  userId?: string
): Promise<ConciergeResponse> {
  await connectToDatabase();

  const lowerMsg = message.toLowerCase().trim();

  // 1. Resolve logged in user details if available
  let currentUser: { _id: string; name: string; email: string } | null = null;
  if (userId) {
    currentUser = await User.findById(userId).select("name email").lean();
  }

  const guestName = currentUser?.name ? currentUser.name.split(" ")[0] : "Guest";

  // ── INTENT 1: GUEST RESERVATION LOOKUP ─────────────────────────────────────
  if (
    lowerMsg.includes("my reservation") ||
    lowerMsg.includes("my booking") ||
    lowerMsg.includes("show my reservation") ||
    lowerMsg.includes("do i have a reservation") ||
    lowerMsg.includes("what's my room") ||
    lowerMsg.includes("whats my room") ||
    lowerMsg.includes("my room number") ||
    lowerMsg.includes("when is my check-in") ||
    lowerMsg.includes("when is my check in")
  ) {
    if (!currentUser) {
      return {
        reply: "To view your personalized reservation details, please sign in to your Velora account. Once logged in, I will display all your upcoming stays instantly!",
        suggestedReplies: ["Sign in", "Browse available rooms", "Hotel Amenities"],
      };
    }

    const userReservations = await Reservation.find({ userId: currentUser._id })
      .sort({ checkIn: -1 })
      .populate("roomId", "roomNumber floor roomTypeId")
      .lean();

    if (!userReservations || userReservations.length === 0) {
      return {
        reply: `Welcome back, ${guestName}. You currently don't have any active reservations with us. Would you like me to help you select and reserve a room today?`,
        suggestedReplies: ["Reserve a room", "View Deluxe Rooms", "Hotel Policies"],
      };
    }

    // Populate room type names
    const populatedRes: ConciergeCardReservation[] = await Promise.all(
      userReservations.map(async (res) => {
        const roomObj = res.roomId as unknown as { roomNumber?: string; roomTypeId?: string } | null;
        let roomTypeName = "Luxury Room";
        if (roomObj?.roomTypeId) {
          const rt = await RoomType.findById(roomObj.roomTypeId).lean();
          if (rt) roomTypeName = rt.name;
        }
        return {
          _id: String(res._id),
          roomNumber: roomObj?.roomNumber ?? "Assigned upon check-in",
          roomTypeName,
          checkIn: new Date(res.checkIn).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          checkOut: new Date(res.checkOut).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          status: res.status,
          guests: res.guests,
          totalPrice: res.totalPrice,
        };
      })
    );

    return {
      reply: `Here are your current reservation details, ${guestName}:`,
      cardsType: "reservations",
      reservations: populatedRes,
      suggestedReplies: ["Check-in Policy", "Contact Front Desk", "Reserve Another Room"],
    };
  }

  // ── INTENT 2: HOTEL FAQ & POLICIES ──────────────────────────────────────────
  if (lowerMsg.includes("check-in") || lowerMsg.includes("check in") || lowerMsg.includes("checkin")) {
    return {
      reply: `Standard check-in time at Velora Hotel starts at **3:00 PM**. If you arrive early, our concierge team will gladly store your luggage securely or arrange early check-in subject to room availability.`,
      suggestedReplies: ["What time is Check-out?", "Airport Shuttle", "Browse Rooms"],
    };
  }

  if (lowerMsg.includes("check-out") || lowerMsg.includes("check out") || lowerMsg.includes("checkout")) {
    return {
      reply: `Standard check-out time is **11:00 AM**. Late check-out options (up to 2:00 PM) can be requested at the front desk or arranged through your reservation details.`,
      suggestedReplies: ["Check-in Time", "Luggage Storage", "Book a Room"],
    };
  }

  if (lowerMsg.includes("cancel") || lowerMsg.includes("cancellation")) {
    return {
      reply: `At Velora Hotel, flexible reservations can be cancelled without penalty up to **24 hours prior** to your scheduled check-in date. You can manage or cancel your stay under your profile dashboard.`,
      suggestedReplies: ["Show my reservations", "Contact Support", "Browse Rooms"],
    };
  }

  if (lowerMsg.includes("breakfast") || lowerMsg.includes("dining") || lowerMsg.includes("restaurant") || lowerMsg.includes("food")) {
    return {
      reply: `Velora Signature Breakfast is served daily from **6:30 AM to 10:30 AM** at Our Fine Dining Restaurant. Suites include complimentary daily gourmet breakfast, and in-room dining is available 24/7.`,
      suggestedReplies: ["View Executive Suite", "Hotel Amenities", "Reserve a Room"],
    };
  }

  if (lowerMsg.includes("pool") || lowerMsg.includes("spa") || lowerMsg.includes("gym") || lowerMsg.includes("parking") || lowerMsg.includes("wifi") || lowerMsg.includes("amenities")) {
    return {
      reply: `Velora Luxury Amenities include:\n\n• **Rooftop Heated Pool & Cabanas** (7:00 AM – 10:00 PM)\n• **Serenity Spa & Thermal Suites**\n• **24/7 Fitness Center** with personal trainers\n• **Complimentary High-Speed Wi-Fi** throughout the property\n• **Valet Parking & EV Charging Stations**\n• **Private Airport Shuttle Service**`,
      suggestedReplies: ["Recommend a Suite", "Check Room Rates", "Show My Booking"],
    };
  }

  // ── INTENT 3: ROOM RECOMMENDATION & SEARCH ─────────────────────────────────

  // Parse guest count preference
  let targetGuests = 2;
  if (lowerMsg.includes("family") || lowerMsg.includes("4 guests") || lowerMsg.includes("4 people") || lowerMsg.includes("children") || lowerMsg.includes("kids")) {
    targetGuests = 4;
  } else if (lowerMsg.includes("1 guest") || lowerMsg.includes("single") || lowerMsg.includes("solo") || lowerMsg.includes("alone")) {
    targetGuests = 1;
  } else if (lowerMsg.includes("3 guests") || lowerMsg.includes("3 people")) {
    targetGuests = 3;
  }

  // Parse preference intent
  const isHoneymoon = lowerMsg.includes("honeymoon") || lowerMsg.includes("romantic") || lowerMsg.includes("anniversary") || lowerMsg.includes("ocean view");
  const isLuxury = lowerMsg.includes("luxury") || lowerMsg.includes("suite") || lowerMsg.includes("executive") || lowerMsg.includes("best room");
  const isBudget = lowerMsg.includes("cheap") || lowerMsg.includes("cheapest") || lowerMsg.includes("budget") || lowerMsg.includes("best price") || lowerMsg.includes("affordable");

  // Fetch all active physical rooms populated with room type & amenities
  const allRooms = await Room.find({ status: { $nin: ["maintenance"] } })
    .populate({
      path: "roomTypeId",
      populate: { path: "amenities" },
    })
    .lean();

  const images = await RoomImage.find().lean();

  const cardRooms: ConciergeCardRoom[] = allRooms.map((r) => {
    const rt = r.roomTypeId as unknown as {
      _id: string;
      name: string;
      basePrice: number;
      capacity: number;
      description: string;
      amenities?: Array<{ name: string }>;
    } | null;

    const typeId = rt?._id ? String(rt._id) : String(r._id);
    const roomTypeName = rt?.name ?? "Standard Room";
    const basePrice = rt?.basePrice ?? 120;
    const capacity = rt?.capacity ?? 2;
    const description = rt?.description ?? "Luxurious accommodations with premium amenities.";

    const imgForType = images.find((i) => String(i.roomTypeId) === typeId);
    const imageUrl = imgForType?.imageUrl ?? fallbackImageFor(typeId);

    const amenityNames = Array.isArray(rt?.amenities) ? rt.amenities.map((a) => a.name) : ["High-speed Wi-Fi", "Air Conditioning", "King Bed"];

    // Tailored recommendation rationale
    let reason = "Ideal choice for a comfortable and refined stay.";
    if (isHoneymoon || isLuxury || roomTypeName.includes("Suite")) {
      reason = "✨ Top Recommendation for luxury & romantic escapes: Features panoramic views, king-size comfort, and VIP suite privileges.";
    } else if (isBudget || basePrice <= 150) {
      reason = "💡 Best Value Choice: Combines high luxury with our most attractive nightly rates.";
    } else if (capacity >= targetGuests) {
      reason = `👨‍👩‍👧‍👦 Excellent fit for ${capacity} guests with spacious layout and full amenities.`;
    }

    return {
      _id: String(r._id),
      typeId,
      roomNumber: r.roomNumber,
      name: `Room #${r.roomNumber} — ${roomTypeName}`,
      basePrice,
      capacity,
      description,
      imageUrl,
      floor: r.floor,
      amenities: amenityNames,
      recommendationReason: reason,
    };
  });

  // Filter & sort based on guest preferences
  let filtered = [...cardRooms];

  if (isBudget) {
    filtered.sort((a, b) => a.basePrice - b.basePrice);
  } else if (isLuxury || isHoneymoon) {
    filtered.sort((a, b) => b.basePrice - a.basePrice);
  } else {
    // Filter by capacity
    filtered = filtered.filter((r) => r.capacity >= targetGuests);
    if (filtered.length === 0) filtered = [...cardRooms];
  }

  const topRecommendations = filtered.slice(0, 4);

  let introGreeting = currentUser?.name
    ? `It would be my pleasure to assist you, ${guestName}.`
    : `Welcome to Velora Hotel. I am your Virtual Concierge.`;

  let responseExplanation = `${introGreeting} Based on your criteria, here are our top available accommodations tailored to your stay:`;

  if (isHoneymoon) {
    responseExplanation = `${introGreeting} For a truly unforgettable romantic celebration, I highly recommend our **Executive Suite** or high-floor Deluxe rooms featuring stunning ambient design and plush king beds:`;
  } else if (isBudget) {
    responseExplanation = `${introGreeting} Here are our best value offerings, delivering maximum five-star comfort at our most competitive rates:`;
  } else if (isLuxury) {
    responseExplanation = `${introGreeting} Presenting our finest luxury suites and high-floor accommodations for an exceptional stay:`;
  }

  return {
    reply: responseExplanation,
    cardsType: "rooms",
    rooms: topRecommendations,
    suggestedReplies: [
      "I need a room for 2 guests",
      "Executive Suite details",
      "Hotel Amenities",
      "Show my reservations",
    ],
  };
}
