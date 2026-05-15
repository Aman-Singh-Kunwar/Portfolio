import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Portfolio from "../models/Portfolio.js";
import { HttpError } from "../utils/http.js";
import { logger } from "../utils/logger.js";
import { validatePortfolioData } from "../validators/portfolio.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.resolve(__dirname, "../../../data/portfolio.json");

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
  const fileData = await readJsonFile(dataPath);

  if (!fileData) {
    const existing = await Portfolio.findOne().lean();
    if (!existing) {
      throw new Error(`No portfolio data found at ${dataPath}`);
    }
    logger.warn("portfolio JSON file not found; using existing database document", {
      path: dataPath
    });
    return existing.data;
  }

  const validated = validatePortfolioData(fileData);
  const doc = await Portfolio.findOneAndUpdate(
    {},
    { data: validated },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  logger.info("portfolio seeded from JSON file", {
    projects: doc.data.projects?.length || 0,
    achievements: doc.data.achievements?.length || 0
  });

  return doc.data;
}

export async function getPortfolio() {
  const doc = await Portfolio.findOne().lean();
  if (!doc) {
    throw new HttpError(404, "Portfolio not found");
  }
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
  logger.info("portfolio replaced by admin update", {
    projects: doc.data.projects?.length || 0,
    achievements: doc.data.achievements?.length || 0
  });
  return doc.data;
}
