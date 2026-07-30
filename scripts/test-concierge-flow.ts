import { config } from "dotenv";
config({ path: ".env.local" });

async function testConciergeFlow() {
  const { connectToDatabase } = await import("../src/backend/config/db");
  const { User } = await import("../src/backend/models");
  const { processConciergeMessage } = await import(
    "../src/backend/controllers/conciergeController"
  );

  await connectToDatabase();

  console.log("\n==================================================");
  console.log(" TESTING VELORA AI CONCIERGE ASSISTANT FLOW      ");
  console.log("==================================================\n");

  const guest = await User.findOne({ email: "test1@gmail.com" });
  if (!guest) throw new Error("Missing test guest");

  // 1. Test Room Search Intent
  console.log("1. Testing Room Search intent ('I need a room for 2 guests')...");
  const roomRes = await processConciergeMessage("I need a room for 2 guests");
  console.log("Reply:", roomRes.reply);
  console.log("Cards Type:", roomRes.cardsType);
  console.log("Room Cards Returned:", roomRes.rooms?.length ?? 0);

  if (roomRes.cardsType === "rooms" && (roomRes.rooms?.length ?? 0) > 0) {
    console.log("✓ PASSED: Room search returned live recommended room cards!");
  } else {
    throw new Error("❌ FAILED: Room cards were not returned");
  }

  // 2. Test Honeymoon / Luxury Intent
  console.log("\n2. Testing Honeymoon intent ('I am on my honeymoon and want a luxury suite')...");
  const luxuryRes = await processConciergeMessage("I am on my honeymoon and want a luxury suite");
  console.log("Reply:", luxuryRes.reply);
  console.log("Top Recommended Room:", luxuryRes.rooms?.[0]?.name);
  console.log("Recommendation Reason:", luxuryRes.rooms?.[0]?.recommendationReason);

  if (luxuryRes.rooms?.[0]?.recommendationReason?.includes("romantic")) {
    console.log("✓ PASSED: Tailored honeymoon recommendation reason generated!");
  } else {
    throw new Error("❌ FAILED: Honeymoon recommendation reason missing");
  }

  // 3. Test Hotel Policy FAQ Intent
  console.log("\n3. Testing Hotel Policy FAQ intent ('What time is check-in?')...");
  const policyRes = await processConciergeMessage("What time is check-in?");
  console.log("Reply:", policyRes.reply);

  if (policyRes.reply.includes("3:00 PM")) {
    console.log("✓ PASSED: Accurate check-in policy delivered!");
  } else {
    throw new Error("❌ FAILED: Policy response incorrect");
  }

  // 4. Test Authenticated Guest Reservations Lookup
  console.log("\n4. Testing Guest Reservation Lookup ('Show my reservations' for Mohammad)...");
  const myRes = await processConciergeMessage("Show my reservations", [], String(guest._id));
  console.log("Reply:", myRes.reply);
  console.log("Cards Type:", myRes.cardsType);
  console.log("User Reservations Returned:", myRes.reservations?.length ?? 0);

  if (myRes.cardsType === "reservations") {
    console.log("✓ PASSED: Live guest reservation cards returned for Mohammad!");
  } else {
    throw new Error("❌ FAILED: Guest reservations lookup failed");
  }

  console.log("\n==================================================");
  console.log(" VELORA AI CONCIERGE ASSISTANT PASSED 100%       ");
  console.log("==================================================\n");
}

testConciergeFlow().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
