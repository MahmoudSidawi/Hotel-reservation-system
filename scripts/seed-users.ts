import { config } from "dotenv";
config({ path: ".env.local" });

const TEST_PASSWORD = "Password123!";

const TEST_USERS = [
  { name: "Alice Admin", email: "admin@hotel.test", role: "admin" as const, department: "Management", password: TEST_PASSWORD },
  { name: "Rita Receptionist", email: "receptionist@hotel.test", role: "receptionist" as const, department: "Front Desk", password: TEST_PASSWORD },
  { name: "Helen Housekeeper", email: "housekeeper@hotel.test", role: "housekeeping" as const, department: "Housekeeping", password: TEST_PASSWORD },
  { name: "Gary Guest", email: "guest@hotel.test", role: "guest" as const, password: TEST_PASSWORD },
  { name: "Mohammad Guest", email: "test1@gmail.com", role: "guest" as const, password: "Mohammad12" },
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
    const password = await bcrypt.hash(testUser.password, 10);
    const { password: rawPass, ...userData } = testUser;
    await User.create({ ...userData, password });
    console.log(`Created: ${testUser.email} (${testUser.role})`);
  }

  console.log(`\nAll test accounts use the password: ${TEST_PASSWORD}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
