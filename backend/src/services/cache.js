import { logger } from "../utils/logger.js";

/**
 * Multi-tier cache service.
 * Uses Redis when available and falls back to local memory for development/tests.
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
      const { createClient } = await import("redis");
      this.redisClient = createClient({ url: redisUrl });

      this.redisClient.on("error", (error) => {
        this.isRedisReady = false;
        logger.warn("cache: redis client error, using in-memory fallback", { error: error.message });
      });

      await this.redisClient.connect();
      this.isRedisReady = true;
      logger.info("cache", { mode: "redis", message: "Redis cache connected" });
    } catch (err) {
      logger.warn("cache: redis connection failed, fallback to in-memory", { error: err.message });
      this.redisClient = null;
      this.isRedisReady = false;
    }
  }

  async get(key) {
    if (this.isRedisReady && this.redisClient) {
      const raw = await this.redisClient.get(key);
      return raw ? JSON.parse(raw) : null;
    }

    const entry = this.memoryStore.get(key);
    if (!entry) return null;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(key, value, ttlSeconds = 300) {
    if (this.isRedisReady && this.redisClient) {
      const serialized = JSON.stringify(value);
      if (ttlSeconds > 0) {
        await this.redisClient.set(key, serialized, { EX: ttlSeconds });
      } else {
        await this.redisClient.set(key, serialized);
      }
      return;
    }

    const expiresAt = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
    this.memoryStore.set(key, { value, expiresAt });
  }

  async del(key) {
    if (this.isRedisReady && this.redisClient) {
      await this.redisClient.del(key);
      return;
    }

    this.memoryStore.delete(key);
  }

  async flush() {
    if (this.isRedisReady && this.redisClient) {
      await this.redisClient.flushDb();
      return;
    }

    this.memoryStore.clear();
  }

  async getOrSet(key, factoryFn, ttlSeconds = 300) {
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }
    const fresh = await factoryFn();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }

  async close() {
    if (this.redisClient) {
      await this.redisClient.quit();
      this.redisClient = null;
      this.isRedisReady = false;
    }
  }

  stats() {
    return {
      size: this.memoryStore.size,
      mode: this.isRedisReady ? "redis" : "in-memory"
    };
  }
}

export const cache = new CacheService();
