import mongoose from "mongoose";
import { seedPortfolioFromFile } from "./services/portfolioStore.js";
import { logger } from "./utils/logger.js";

export async function connectAndSeed(mongoUri) {
  if (!mongoUri) {
    logger.info("MONGO_URI not set; running with zero-config local data fallback");
    return;
  }

  mongoose.set("strictQuery", true);
  logger.info("connecting to MongoDB");
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5_000
    });
    logger.info("MongoDB connected", {
      database: mongoose.connection.name
    });
    await seedPortfolioFromFile();
  } catch (err) {
    logger.warn("MongoDB connection failed; falling back to local dataset", { error: err.message });
  }
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected");
  }
}
