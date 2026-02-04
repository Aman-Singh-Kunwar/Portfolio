import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Portfolio from "../models/Portfolio.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.resolve(__dirname, "../../../data/portfolio.json");

const router = express.Router();

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function mergeDeep(target, source) {
  const output = { ...(isPlainObject(target) ? target : {}) };
  if (!isPlainObject(source)) {
    return output;
  }

  for (const [key, value] of Object.entries(source)) {
    if (isPlainObject(value) && isPlainObject(output[key])) {
      output[key] = mergeDeep(output[key], value);
    } else {
      output[key] = value;
    }
  }

  return output;
}

router.get("/", async (req, res) => {
  try {
    const doc = await Portfolio.findOne().lean();
    if (!doc) {
      return res.status(404).json({ error: "Portfolio not found" });
    }
    return res.json(doc.data);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch portfolio" });
  }
});

router.put("/", requireAdmin, async (req, res) => {
  const payload = req.body;

  if (!payload || typeof payload !== "object") {
    return res.status(400).json({ error: "Invalid payload" });
  }

  try {
    let existingData = null;
    let doc = await Portfolio.findOne();
    if (!doc) {
      try {
        const raw = await fs.readFile(dataPath, "utf-8");
        existingData = JSON.parse(raw);
      } catch (error) {
        if (error.code !== "ENOENT") {
          throw error;
        }
      }

      const merged = mergeDeep(existingData || {}, payload);
      doc = await Portfolio.create({ data: merged });
    } else {
      const merged = mergeDeep(doc.data || {}, payload);
      doc.data = merged;
      await doc.save();
    }

    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    await fs.writeFile(
      dataPath,
      JSON.stringify(doc.data, null, 2),
      "utf-8"
    );

    return res.json(doc.data);
  } catch (error) {
    console.error("Failed to update portfolio:", error);
    return res.status(500).json({
      error: "Failed to update portfolio",
      details: error.message
    });
  }
});

export default router;
