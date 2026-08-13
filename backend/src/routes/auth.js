import express from "express";
import { config } from "../config.js";
import { generateAdminSessionToken } from "../utils/token.js";
import { asyncHandler, HttpError } from "../utils/http.js";
import { logger } from "../utils/logger.js";
import crypto from "node:crypto";

const router = express.Router();

function safeEqual(provided, expected) {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { token } = req.body || {};

    if (!token || typeof token !== "string") {
      throw new HttpError(400, "Admin token is required");
    }

    const expected = config.adminToken;
    if (!expected) {
      throw new HttpError(500, "ADMIN_TOKEN is not set in backend environment");
    }

    if (!safeEqual(token.trim(), expected)) {
      logger.warn("unauthorized admin login attempt", { ip: req.ip });
      throw new HttpError(401, "Invalid admin token");
    }

    const session = generateAdminSessionToken();
    logger.info("admin logged in successfully, session token issued", { expiresAt: session.expiresAt });

    res.set("Cache-Control", "no-store");
    return res.json({
      success: true,
      token: session.token,
      expiresAt: session.expiresAt,
      message: "Authentication successful. Session expires in 24 hours."
    });
  })
);

export default router;
