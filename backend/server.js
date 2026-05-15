import app from "./src/app.js";
import { config, validateConfig } from "./src/config.js";
import { connectAndSeed, disconnectDatabase } from "./src/db.js";
import { logger } from "./src/utils/logger.js";

validateConfig();

logger.info("backend configuration loaded", {
  env: config.env,
  port: config.port,
  corsOrigins: config.corsOrigins.length
});

let server;

function shutdown(signal) {
  logger.info("shutdown signal received", { signal });
  server?.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

connectAndSeed(config.mongoUri)
  .then(() => {
    server = app.listen(config.port, () => {
      logger.info("API listening", {
        url: `http://localhost:${config.port}`
      });
    });
  })
  .catch((error) => {
    logger.error("failed to start server", {
      message: error.message,
      stack: error.stack
    });
    process.exit(1);
  });
