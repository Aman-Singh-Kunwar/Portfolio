import express from "express";
import { countVisitSession, getVisitCount } from "../services/visitStore.js";
import { asyncHandler } from "../utils/http.js";

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const count = await getVisitCount();
    res.set("Cache-Control", "no-store");
    return res.json({ count });
  })
);

router.post(
  "/session",
  asyncHandler(async (req, res) => {
    const result = await countVisitSession(req.body?.sessionId);
    res.set("Cache-Control", "no-store");
    return res.status(result.counted ? 201 : 200).json(result);
  })
);

export default router;
