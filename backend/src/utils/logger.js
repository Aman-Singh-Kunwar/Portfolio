const levelWeight = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

const configuredLevel = process.env.LOG_LEVEL || "info";

function shouldLog(level) {
  return levelWeight[level] >= (levelWeight[configuredLevel] || levelWeight.info);
}

function formatMeta(meta) {
  if (!meta || !Object.keys(meta).length) {
    return "";
  }

  return ` ${JSON.stringify(meta)}`;
}

function log(level, message, meta = {}) {
  if (!shouldLog(level)) {
    return;
  }

  const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
  const line = `${timestamp} ${level.toUpperCase()} ${message}${formatMeta(meta)}`;

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
}

export const logger = {
  debug(message, meta) {
    log("debug", message, meta);
  },
  info(message, meta) {
    log("info", message, meta);
  },
  warn(message, meta) {
    log("warn", message, meta);
  },
  error(message, meta) {
    log("error", message, meta);
  }
};
