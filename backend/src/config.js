import dotenv from "dotenv";

dotenv.config();

function parseList(value) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const config = {
  env: process.env.NODE_ENV || "development",
  port: parsePositiveInt(process.env.PORT, 4000),
  mongoUri: process.env.MONGO_URI,
  adminToken: process.env.ADMIN_TOKEN,
  corsOrigins: parseList(process.env.CORS_ORIGINS),
  clientUrl: process.env.CLIENT_URL || "https://aman-singh-kunwar-portfolio1.onrender.com/",
  adminUrl: process.env.ADMIN_URL || "https://aman-singh-kunwar-portfolio2.onrender.com/",
  bodyLimit: process.env.JSON_BODY_LIMIT || "1mb",
  cacheSeconds: parsePositiveInt(process.env.CACHE_SECONDS, 60),
  rateLimitWindowMs: parsePositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
  rateLimitMax: parsePositiveInt(process.env.RATE_LIMIT_MAX, 120)
};

export function validateConfig() {
  const missing = [];

  if (!config.mongoUri) missing.push("MONGO_URI");
  if (!config.adminToken) missing.push("ADMIN_TOKEN");

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

export function isProduction() {
  return config.env === "production";
}
