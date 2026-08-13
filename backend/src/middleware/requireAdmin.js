import { config } from "../config.js";
import { verifyAdminSessionToken } from "../utils/token.js";

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

  if (!provided || !verifyAdminSessionToken(provided)) {
    return res.status(401).json({ error: "Unauthorized or session expired. Please log in again." });
  }

  return next();
}
