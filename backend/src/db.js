import mongoose from "mongoose";
import { seedPortfolioFromFile } from "./services/portfolioStore.js";
import { logger } from "./utils/logger.js";

export async function connectAndSeed(mongoUri) {
  mongoose.set("strictQuery", true);
  logger.info("connecting to MongoDB");
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10_000
  });
  logger.info("MongoDB connected", {
    database: mongoose.connection.name
  });
  await seedPortfolioFromFile();
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected");
}
