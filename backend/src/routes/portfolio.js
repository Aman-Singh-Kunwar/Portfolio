import express from "express";
import { config } from "../config.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { getPortfolio, replacePortfolio } from "../services/portfolioStore.js";
import { asyncHandler } from "../utils/http.js";

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const data = await getPortfolio();
    const json = JSON.stringify(data);

    // Generate ETag from content hash for conditional requests (304 Not Modified)
    const { createHash } = await import("node:crypto");
    const etag = `"${createHash("md5").update(json).digest("hex")}"`;
    res.set("ETag", etag);
    res.set(
      "Cache-Control",
      `public, max-age=${config.cacheSeconds}, stale-while-revalidate=${config.cacheSeconds * 5}`
    );

    // Return 304 if client already has fresh data
    if (req.headers["if-none-match"] === etag) {
      return res.status(304).end();
    }

    return res.type("json").send(json);
  })
);

router.put(
  "/",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const data = await replacePortfolio(req.body);
    res.set("Cache-Control", "no-store");
    return res.json(data);
  })
);

export default router;
