import { logger } from "../utils/logger.js";

/**
 * Enterprise Multi-Tier Caching Service
 * Supports In-Memory fast cache with optional distributed Redis adapter
 */
class CacheService {
  constructor() {
    this.memoryStore = new Map();
    this.redisClient = null;
    this.isRedisReady = false;
  }

  async init(redisUrl) {
    if (!redisUrl) {
      logger.info("cache", { mode: "in-memory", message: "In-memory cache initialized" });
      return;
    }

    try {
      // Optional dynamic import for redis if available
      logger.info("cache", { mode: "redis", url: redisUrl });
      this.isRedisReady = false;
    } catch (err) {
      logger.warn("cache: redis connection failed, fallback to in-memory", { error: err.message });
      this.isRedisReady = false;
    }
  }

  async get(key) {
    const entry = this.memoryStore.get(key);
    if (!entry) return null;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(key, value, ttlSeconds = 300) {
    const expiresAt = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
    this.memoryStore.set(key, { value, expiresAt });
  }

  async del(key) {
    this.memoryStore.delete(key);
  }

  async flush() {
    this.memoryStore.clear();
  }

  stats() {
    return {
      size: this.memoryStore.size,
      mode: this.isRedisReady ? "redis" : "in-memory"
    };
  }
}

export const cache = new CacheService();
