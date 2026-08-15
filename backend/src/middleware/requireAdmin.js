import { config, isProduction } from "../config.js";
import { cache } from "../services/cache.js";
import { isSignedAdminSessionToken, verifyAdminSessionToken } from "../utils/token.js";

export async function requireAdmin(req, res, next) {
  const expected = config.adminToken;

  if (!expected) {
    return res.status(500).json({ error: "ADMIN_TOKEN is not configured" });
  }

  const authHeader = req.headers.authorization || "";
  let provided = "";

  if (authHeader.startsWith("Bearer ")) {
    provided = authHeader.slice(7).trim();
  } else if (authHeader) {
    provided = authHeader.trim();
  } else if (req.headers["x-admin-token"]) {
    provided = req.headers["x-admin-token"].toString().trim();
  }

  if (!provided) {
    return res.status(401).json({ error: "Authentication required. Missing token." });
  }

  // In production, enforce signed session tokens ONLY (no raw secret token in headers)
  if (isProduction() && !isSignedAdminSessionToken(provided)) {
    return res.status(401).json({ error: "Invalid authentication format. Session token required." });
  }

  // Verify HMAC signature
  if (!verifyAdminSessionToken(provided)) {
    return res.status(401).json({ error: "Unauthorized or invalid session signature." });
  }

  // For signed tokens, verify active session in Redis/cache tier
  if (isSignedAdminSessionToken(provided)) {
    try {
      const activeSession = await cache.get(`session:${provided}`);
      if (!activeSession) {
        return res.status(401).json({ error: "Session expired or revoked. Please log in again." });
      }
    } catch {
      return res.status(401).json({ error: "Failed to verify session store." });
    }
  }

  return next();
}
