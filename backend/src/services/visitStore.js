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

export async function getVisitTrends() {
  const now = new Date();
  const days = [];

  // Generate last 7 days labels
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayLabel = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    days.push({ date: dayLabel, dayKey: d.toISOString().slice(0, 10), count: 0 });
  }

  try {
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const sessions = await VisitSession.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      }
    ]);

    const sessionMap = new Map(sessions.map((s) => [s._id, s.count]));

    return days.map((d) => ({
      date: d.date,
      count: sessionMap.get(d.dayKey) || 0
    }));
  } catch {
    return days.map((d) => ({ date: d.date, count: 0 }));
  }
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
