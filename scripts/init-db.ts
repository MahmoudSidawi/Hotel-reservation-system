import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { connectToDatabase } = await import("../src/lib/mongodb");
  const { User, RoomType, RoomImage, Amenity, Room, Reservation, Payment } = await import(
    "../src/models"
  );

  const mongoose = await connectToDatabase();
  const models = [User, RoomType, RoomImage, Amenity, Room, Reservation, Payment];

  for (const m of models) {
    await m.createCollection();
    console.log(`Created collection: ${m.collection.collectionName}`);
  }

  await mongoose.connection.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
