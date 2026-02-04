import mongoose from "mongoose";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import Portfolio from "./models/Portfolio.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.resolve(__dirname, "../../data/portfolio.json");
const clientAppPath = path.resolve(__dirname, "../../frontend/client/src/App.jsx");
const adminAppPath = path.resolve(__dirname, "../../frontend/admin/src/App.jsx");

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

function extractObjectLiteral(source, identifier) {
  const marker = `const ${identifier}`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) {
    return null;
  }

  const braceStart = source.indexOf("{", markerIndex);
  if (braceStart === -1) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let stringChar = "";
  let escaped = false;

  for (let i = braceStart; i < source.length; i += 1) {
    const ch = source[i];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === stringChar) {
        inString = false;
        stringChar = "";
      }
      continue;
    }

    if (ch === "'" || ch === '"' || ch === "`") {
      inString = true;
      stringChar = ch;
      continue;
    }

    if (ch === "{") {
      depth += 1;
    } else if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(braceStart, i + 1);
      }
    }
  }

  return null;
}

function parseObjectLiteral(literal) {
  if (!literal) {
    return null;
  }
  try {
    return vm.runInNewContext(`(${literal})`, {});
  } catch (error) {
    return null;
  }
}

async function loadObjectFromFile(filePath, identifier) {
  try {
    const source = await fs.readFile(filePath, "utf-8");
    const literal = extractObjectLiteral(source, identifier);
    return parseObjectLiteral(literal);
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function connectAndSeed(mongoUri) {
  await mongoose.connect(mongoUri);

  let fileData = null;
  try {
    const raw = await fs.readFile(dataPath, "utf-8");
    fileData = JSON.parse(raw);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  const clientFallback = await loadObjectFromFile(clientAppPath, "fallbackData");
  const adminTemplate = await loadObjectFromFile(adminAppPath, "template");

  let merged = {};
  merged = mergeDeep(merged, adminTemplate || {});
  merged = mergeDeep(merged, clientFallback || {});
  merged = mergeDeep(merged, fileData || {});

  if (!Object.keys(merged).length) {
    const existing = await Portfolio.findOne();
    if (!existing) {
      throw new Error(
        `No portfolio data found. Checked ${dataPath}, ${clientAppPath}, and ${adminAppPath}.`
      );
    }
    return;
  }

  await fs.mkdir(path.dirname(dataPath), { recursive: true });
  await fs.writeFile(dataPath, JSON.stringify(merged, null, 2), "utf-8");

  await Portfolio.findOneAndUpdate(
    {},
    { data: merged },
    { upsert: true, new: true }
  );
}
