import dns from "dns";
import mongoose from "mongoose";
// Side-effect import: registers every model's schema on this mongoose
// instance, regardless of which specific model file the calling controller
// imported. Without this, populate("someRef") can throw MissingSchemaError
// if that ref's model was never imported anywhere in the current route's
// module graph (e.g. RoomType populating "Amenity" when only RoomType was imported).
import "@/backend/models";

// The local DNS resolver (often 127.0.0.1 behind a VPN/proxy) can refuse SRV
// queries needed for mongodb+srv:// URIs. Fall back to a public resolver for
// Node's own lookups without touching OS-wide DNS settings.
dns.setServers(["8.8.8.8", "1.1.1.1", ...dns.getServers()]);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hotel_db";

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable");
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cache;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI as string, {
      bufferCommands: false,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }

  return cache.conn;
}

export default connectToDatabase;
