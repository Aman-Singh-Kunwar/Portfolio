import express from "express";
import crypto from "node:crypto";
import { config } from "../config.js";
import { generateAdminSessionToken } from "../utils/token.js";
import { asyncHandler, HttpError } from "../utils/http.js";
import { logger } from "../utils/logger.js";
import { cache } from "../services/cache.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { LoginPayloadSchema } from "../validators/schemas.js";

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
    const parseResult = LoginPayloadSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues[0]?.message || "Invalid login request";
      throw new HttpError(400, errorMsg);
    }

    const { token } = parseResult.data;

    const expected = config.adminToken;
    if (!expected) {
      throw new HttpError(500, "ADMIN_TOKEN is not set in backend environment");
    }

    if (!safeEqual(token.trim(), expected)) {
      logger.warn("unauthorized admin login attempt", { ip: req.ip });
      throw new HttpError(401, "Invalid admin token");
    }

    const session = generateAdminSessionToken();

    // Store active session token in cache/Redis tier (24h TTL)
    await cache.set(`session:${session.token}`, { issuedAt: Date.now() }, 86400);

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

router.post(
  "/logout",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

    if (token) {
      await cache.del(`session:${token}`);
    }

    res.set("Cache-Control", "no-store");
    return res.json({ success: true, message: "Session revoked." });
  })
);

export default router;
