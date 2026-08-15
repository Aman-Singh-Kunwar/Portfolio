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
  redisUrl: process.env.REDIS_URL,
  adminToken: process.env.ADMIN_TOKEN || "admin-secret-token",
  corsOrigins: parseList(process.env.CORS_ORIGINS),
  apiUrl: process.env.API_URL || "https://aman-singh-kunwar-portfolio.onrender.com",
  clientUrl: process.env.CLIENT_URL || "https://aman-singh-kunwar-portfolio1.onrender.com/",
  adminUrl: process.env.ADMIN_URL || "https://aman-singh-kunwar-portfolio2.onrender.com/",
  bodyLimit: process.env.JSON_BODY_LIMIT || "1mb",
  cacheSeconds: parsePositiveInt(process.env.CACHE_SECONDS, 60),
  rateLimitWindowMs: parsePositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
  rateLimitMax: parsePositiveInt(process.env.RATE_LIMIT_MAX, 120)
};

export function isProduction() {
  return config.env === "production";
}

const ENV_SCHEMA = [
  { key: "MONGO_URI",     value: config.mongoUri,    required: isProduction(),  description: "MongoDB connection string" },
  { key: "REDIS_URL",     value: config.redisUrl,    required: false,           description: "Optional Redis cache connection string" },
  { key: "ADMIN_TOKEN",   value: config.adminToken,  required: true,            description: "Secret token for admin authentication" },
  { key: "CORS_ORIGINS",  value: config.corsOrigins.length > 0 ? "set" : "", required: false, description: "Comma-separated allowed origins" },
  { key: "API_URL",       value: config.apiUrl,       required: false,           description: "Public backend API URL" },
  { key: "CLIENT_URL",    value: config.clientUrl,    required: false,           description: "Public client application URL" },
  { key: "ADMIN_URL",     value: config.adminUrl,     required: false,           description: "Admin panel application URL" },
  { key: "PORT",          value: config.port,          required: false,           description: "HTTP server port (default: 4000)" },
];

export function validateConfig() {
  const missing = [];
  const warnings = [];

  for (const entry of ENV_SCHEMA) {
    const present = entry.value !== undefined && entry.value !== null && entry.value !== "";
    if (entry.required && !present) {
      missing.push(entry);
    } else if (!entry.required && !present) {
      warnings.push(entry);
    }
  }

  if (warnings.length > 0) {
    console.warn("\nOptional environment variables not set (using defaults):");
    for (const w of warnings) {
      console.warn(`  - ${w.key}: ${w.description}`);
    }
  }

  if (missing.length > 0) {
    console.error("\nFATAL: Missing required environment variables:");
    for (const m of missing) {
      console.error(`  - ${m.key}: ${m.description}`);
    }
    process.exit(1);
  }
}
