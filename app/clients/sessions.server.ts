import { createSessionStorage } from "react-router";
import { createClient } from "redis";

// Initialize Redis client
const redis = createClient({ url: process.env.REDIS_URL });

// Connect to Redis (ensure this runs only once or handle connection state)
let redisConnectionPromise: Promise<void> | null = null;

async function ensureRedisConnected() {
  if (redis.isOpen) return;
  if (!redisConnectionPromise) {
    redisConnectionPromise = redis.connect()
      .then(() => {}) // Ensure void return
      .catch((err) => {
        console.error("[Session] Redis connection error:", err);
        redisConnectionPromise = null; // Retry on next call
        throw err;
      });
  }
  await redisConnectionPromise;
}

type SessionData = {
  userId: string;
  [key: string]: any;
};

type SessionFlashData = {
  error: string;
  [key: string]: any;
};

const { getSession, commitSession, destroySession } = createSessionStorage<SessionData, SessionFlashData>({
  cookie: {
    name: "sinterklaas_session",
    httpOnly: true,
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET || "s3cr3t_s1nt3rkl44s"],
    secure: process.env.NODE_ENV === "production",
  },
  async createData(data, expires) {
    await ensureRedisConnected();
    const id = crypto.randomUUID();
    // Default to 1 day if no expiration is provided
    const ttl = expires ? Math.round((expires.getTime() - Date.now()) / 1000) : 60 * 60 * 24;
    
    await redis.set(id, JSON.stringify(data), { EX: ttl });
    return id;
  },
  async readData(id) {
    await ensureRedisConnected();
    try {
      const data = await redis.get(id);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  },
  async updateData(id, data, expires) {
    await ensureRedisConnected();
    const ttl = expires ? Math.round((expires.getTime() - Date.now()) / 1000) : 60 * 60 * 24;
    try {
      await redis.set(id, JSON.stringify(data), { EX: ttl });
    } catch (error) {
      console.error(`[Session] Error updating data for ID: ${id}`, error);
    }
  },
  async deleteData(id) {
    await ensureRedisConnected();
    try {
      await redis.del(id);
    } catch (error) {
      console.error(`[Session] Error deleting data for ID: ${id}`, error);
    }
  },
});

export { getSession, commitSession, destroySession };
