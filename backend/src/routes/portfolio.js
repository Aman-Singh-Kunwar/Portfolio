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
    res.set(
      "Cache-Control",
      `public, max-age=${config.cacheSeconds}, stale-while-revalidate=${config.cacheSeconds * 5}`
    );
    return res.json(data);
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
