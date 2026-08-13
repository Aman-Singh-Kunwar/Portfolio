import crypto from "node:crypto";
import { config } from "../config.js";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

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

  // Check raw token match (legacy fallback)
  const rawProvidedBuffer = Buffer.from(providedToken);
  const rawSecretBuffer = Buffer.from(secret);
  if (
    rawProvidedBuffer.length === rawSecretBuffer.length &&
    crypto.timingSafeEqual(rawProvidedBuffer, rawSecretBuffer)
  ) {
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

  const providedHmacBuffer = Buffer.from(providedHmac);
  const expectedHmacBuffer = Buffer.from(expectedHmac);

  if (providedHmacBuffer.length !== expectedHmacBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedHmacBuffer, expectedHmacBuffer);
}
