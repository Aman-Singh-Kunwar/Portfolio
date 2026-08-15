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
  adminToken: process.env.ADMIN_TOKEN,
  corsOrigins: parseList(process.env.CORS_ORIGINS),
  apiUrl: process.env.API_URL || "https://aman-singh-kunwar-portfolio.onrender.com",
  clientUrl: process.env.CLIENT_URL || "https://aman-singh-kunwar-portfolio1.onrender.com/",
  adminUrl: process.env.ADMIN_URL || "https://aman-singh-kunwar-portfolio2.onrender.com/",
  bodyLimit: process.env.JSON_BODY_LIMIT || "1mb",
  cacheSeconds: parsePositiveInt(process.env.CACHE_SECONDS, 60),
  rateLimitWindowMs: parsePositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
  rateLimitMax: parsePositiveInt(process.env.RATE_LIMIT_MAX, 120)
};

const ENV_SCHEMA = [
  { key: "MONGO_URI",     value: config.mongoUri,    required: true,  description: "MongoDB connection string" },
  { key: "REDIS_URL",     value: config.redisUrl,    required: false, description: "Optional Redis cache connection string" },
  { key: "ADMIN_TOKEN",   value: config.adminToken,  required: true,  description: "Secret token for admin authentication" },
  { key: "CORS_ORIGINS",  value: config.corsOrigins.length > 0 ? "set" : "", required: false, description: "Comma-separated allowed origins" },
  { key: "API_URL",       value: config.apiUrl,       required: false, description: "Public backend API URL" },
  { key: "CLIENT_URL",    value: config.clientUrl,    required: false, description: "Public client application URL" },
  { key: "ADMIN_URL",     value: config.adminUrl,     required: false, description: "Admin panel application URL" },
  { key: "PORT",          value: config.port,          required: false, description: "HTTP server port (default: 4000)" },
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
    console.warn("\n⚠️  Optional environment variables not set (using defaults):");
    console.warn("┌──────────────────┬──────────────────────────────────────────┐");
    console.warn("│ Variable         │ Description                              │");
    console.warn("├──────────────────┼──────────────────────────────────────────┤");
    for (const w of warnings) {
      console.warn(`│ ${w.key.padEnd(16)} │ ${w.description.padEnd(40)} │`);
    }
    console.warn("└──────────────────┴──────────────────────────────────────────┘\n");
  }

  if (missing.length > 0) {
    console.error("\n❌ FATAL: Missing required environment variables:");
    console.error("┌──────────────────┬──────────────────────────────────────────┐");
    console.error("│ Variable         │ Description                              │");
    console.error("├──────────────────┼──────────────────────────────────────────┤");
    for (const m of missing) {
      console.error(`│ ${m.key.padEnd(16)} │ ${m.description.padEnd(40)} │`);
    }
    console.error("└──────────────────┴──────────────────────────────────────────┘");
    console.error("\n💡 Create a backend/.env file with the variables above.");
    console.error("   See README.md for the full .env template.\n");
    process.exit(1);
  }
}

export function isProduction() {
  return config.env === "production";
}
