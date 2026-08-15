import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import Portfolio from "../models/Portfolio.js";
import { HttpError } from "../utils/http.js";
import { logger } from "../utils/logger.js";
import { validatePortfolioData } from "../validators/portfolio.js";
import { cache } from "./cache.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.resolve(__dirname, "../../../data/portfolio.json");
const CACHE_KEY = "portfolio:full";
const CACHE_TTL_SECONDS = 300; // 5 minutes

async function readJsonFile(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function writeJsonFile(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}

export async function seedPortfolioFromFile() {
  const forceSeed = process.env.FORCE_SEED === "true";
  const existing = await Portfolio.findOne().lean();
  if (existing && !forceSeed) {
    logger.info("portfolio data already exists in database; skipping seed from file", {
      projects: existing.data.projects?.length || 0,
      achievements: existing.data.achievements?.length || 0
    });
    return existing.data;
  }

  const fileData = await readJsonFile(dataPath);

  if (!fileData) {
    throw new Error(`No portfolio data found in database and JSON file not found at ${dataPath}`);
  }

  const validated = validatePortfolioData(fileData);
  const doc = await Portfolio.findOneAndUpdate(
    {},
    { data: validated },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  await cache.del(CACHE_KEY);

  logger.info("portfolio seeded from JSON file", {
    projects: doc.data.projects?.length || 0,
    achievements: doc.data.achievements?.length || 0
  });

  return doc.data;
}

export async function getPortfolio() {
  // Check in-memory / distributed cache first for sub-millisecond responses
  const cached = await cache.get(CACHE_KEY);
  if (cached) {
    return cached;
  }

  if (mongoose.connection.readyState !== 1) {
    const fileData = await readJsonFile(dataPath);
    if (!fileData) {
      throw new HttpError(503, "Portfolio data store is unavailable");
    }
    const validated = validatePortfolioData(fileData);
    await cache.set(CACHE_KEY, validated, CACHE_TTL_SECONDS);
    return validated;
  }

  const doc = await Portfolio.findOne().lean();
  if (!doc) {
    throw new HttpError(404, "Portfolio not found");
  }

  await cache.set(CACHE_KEY, doc.data, CACHE_TTL_SECONDS);
  return doc.data;
}

export async function replacePortfolio(payload) {
  const validated = validatePortfolioData(payload);
  const doc = await Portfolio.findOneAndUpdate(
    {},
    { data: validated },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  await writeJsonFile(dataPath, doc.data);
  // Invalidate cache immediately so changes reflect everywhere
  await cache.del(CACHE_KEY);

  logger.info("portfolio replaced by admin update", {
    projects: doc.data.projects?.length || 0,
    achievements: doc.data.achievements?.length || 0
  });
  return doc.data;
}
