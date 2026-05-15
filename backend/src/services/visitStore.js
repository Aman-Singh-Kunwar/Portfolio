import crypto from "node:crypto";
import VisitCounter from "../models/VisitCounter.js";
import VisitSession from "../models/VisitSession.js";
import { HttpError } from "../utils/http.js";
import { logger } from "../utils/logger.js";

const COUNTER_KEY = "portfolio";
const SESSION_TTL_DAYS = 7;

function hashSessionId(sessionId) {
  return crypto.createHash("sha256").update(sessionId).digest("hex");
}

function getSessionExpiry() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS);
  return expiresAt;
}

async function getOrCreateCounter() {
  return VisitCounter.findOneAndUpdate(
    { key: COUNTER_KEY },
    { $setOnInsert: { count: 0 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
}

export async function getVisitCount() {
  const counter = await getOrCreateCounter();
  return counter.count;
}

export async function countVisitSession(sessionId) {
  if (typeof sessionId !== "string" || sessionId.trim().length < 16) {
    throw new HttpError(400, "A valid visitor session id is required");
  }

  const sessionIdHash = hashSessionId(sessionId.trim());

  try {
    await VisitSession.create({
      sessionIdHash,
      expiresAt: getSessionExpiry()
    });
  } catch (error) {
    if (error.code === 11000) {
      return {
        count: await getVisitCount(),
        counted: false
      };
    }
    throw error;
  }

  const counter = await VisitCounter.findOneAndUpdate(
    { key: COUNTER_KEY },
    { $inc: { count: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  logger.info("visitor counted", {
    count: counter.count
  });

  return {
    count: counter.count,
    counted: true
  };
}
