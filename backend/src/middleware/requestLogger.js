import { logger } from "../utils/logger.js";
import { metrics } from "../utils/metrics.js";

export function requestLogger(req, res, next) {
  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

    metrics.recordRequest(req.method, req.route?.path || req.path, res.statusCode, durationMs);

    logger[level]("http_request", {
      requestId: req.id || "-",
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      ip: req.ip,
      userAgent: req.get("user-agent") ? req.get("user-agent").slice(0, 50) : "-"
    });
  });

  next();
}
