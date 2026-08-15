import crypto from "node:crypto";
import { config } from "../config.js";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function safeEqual(a, b) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export function generateAdminSessionToken() {
  const secret = config.adminToken;
  if (!secret) {
    throw new Error("ADMIN_TOKEN is not set in environment");
  }

  const issuedAt = Date.now();
  const expiresAt = issuedAt + TOKEN_TTL_MS;
  const payload = `${issuedAt}.${expiresAt}`;

  const hmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  const token = `${payload}.${hmac}`;

  return { token, expiresAt };
}

export function verifyAdminSessionToken(providedToken) {
  const secret = config.adminToken;
  if (!secret || !providedToken) return false;

  // Raw token access is useful locally, but production should use issued sessions.
  if (config.env !== "production" && safeEqual(providedToken, secret)) {
    return true;
  }

  // Check signed HMAC session token
  const parts = providedToken.split(".");
  if (parts.length !== 3) return false;

  const [issuedAtStr, expiresAtStr, providedHmac] = parts;
  const expiresAt = Number.parseInt(expiresAtStr, 10);

  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    return false; // Token expired
  }

  const payload = `${issuedAtStr}.${expiresAtStr}`;
  const expectedHmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  return safeEqual(providedHmac, expectedHmac);
}

export function isSignedAdminSessionToken(providedToken) {
  return typeof providedToken === "string" && providedToken.split(".").length === 3;
}

export function getAdminSessionExpiry(providedToken) {
  if (!isSignedAdminSessionToken(providedToken)) return null;
  const [, expiresAtStr] = providedToken.split(".");
  const expiresAt = Number.parseInt(expiresAtStr, 10);
  return Number.isFinite(expiresAt) ? expiresAt : null;
}
