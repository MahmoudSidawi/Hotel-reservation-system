import { config } from "dotenv";
config({ path: ".env.local" });

const TEST_PASSWORD = "Password123!";

const TEST_USERS = [
  { name: "Alice Admin", email: "admin@hotel.test", role: "admin" as const },
  { name: "Rita Receptionist", email: "receptionist@hotel.test", role: "receptionist" as const },
  { name: "Gary Guest", email: "guest@hotel.test", role: "guest" as const },
];

async function main() {
  const { connectToDatabase } = await import("../src/backend/config/db");
  const { User } = await import("../src/backend/models");
  const bcrypt = (await import("bcryptjs")).default;

  await connectToDatabase();

  for (const testUser of TEST_USERS) {
    const existing = await User.findOne({ email: testUser.email });
    if (existing) {
      console.log(`Already exists: ${testUser.email}`);
      continue;
    }
    const password = await bcrypt.hash(TEST_PASSWORD, 10);
    await User.create({ ...testUser, password });
    console.log(`Created: ${testUser.email} (${testUser.role})`);
  }

  console.log(`\nAll test accounts use the password: ${TEST_PASSWORD}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
