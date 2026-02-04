export function requireAdmin(req, res, next) {
  const expected = process.env.ADMIN_TOKEN;

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

  if (provided !== expected) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return next();
}