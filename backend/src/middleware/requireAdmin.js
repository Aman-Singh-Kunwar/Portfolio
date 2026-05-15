import crypto from "node:crypto";
import { config } from "../config.js";

function safeEqual(provided, expected) {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}

export function requireAdmin(req, res, next) {
  const expected = config.adminToken;

  if (!expected) {
    return res.status(500).json({ error: "ADMIN_TOKEN is not set" });
  }

  const authHeader = req.headers.authorization || "";
  let provided = "";

  if (authHeader.startsWith("Bearer ")) {
    provided = authHeader.slice(7);
  } else if (authHeader) {
    provided = authHeader;
  } else if (req.headers["x-admin-token"]) {
    provided = req.headers["x-admin-token"];
  }

  if (!provided || !safeEqual(provided, expected)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return next();
}
