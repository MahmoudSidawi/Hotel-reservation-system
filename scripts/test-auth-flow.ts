import { config } from "dotenv";
config({ path: ".env.local" });

async function testAuth() {
  const { login } = await import("../src/backend/controllers/authController");
  const { verifySession } = await import("../src/lib/auth");

  console.log("1. Testing login for test1@gmail.com...");
  const { token, user } = await login({ email: "test1@gmail.com", password: "Mohammad12" });
  console.log("Logged in user:", user);

  if (user.email !== "test1@gmail.com" || user.role !== "guest") {
    throw new Error("Login returned incorrect user identity or role!");
  }

  console.log("\n2. Verifying session payload...");
  const decoded = await verifySession(token);
  console.log("Decoded JWT payload:", decoded);

  if (!decoded || decoded.email !== "test1@gmail.com" || decoded.role !== "guest") {
    throw new Error("Decoded session payload does not match guest identity!");
  }

  console.log("\n✓ AUTH FLOW VERIFICATION PASSED: Guest session correctly signed and verified.");
}

testAuth().catch((err) => {
  console.error("Auth test failed:", err);
  process.exit(1);
});
