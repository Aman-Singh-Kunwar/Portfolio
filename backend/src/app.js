import express from "express";
import cors from "cors";
import compression from "compression";
import portfolioRoutes from "./routes/portfolio.js";
import visitRoutes from "./routes/visits.js";
import { config, isProduction } from "./config.js";
import { createRateLimiter } from "./middleware/rateLimit.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { securityHeaders } from "./middleware/security.js";
import { escapeHtml, sendError } from "./utils/http.js";
import { logger } from "./utils/logger.js";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || !config.corsOrigins.length || config.corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(compression());
app.use(securityHeaders);
app.use(requestLogger);
app.use(createRateLimiter({ windowMs: config.rateLimitWindowMs, max: config.rateLimitMax }));
app.use(express.json({ limit: config.bodyLimit }));

function renderBackendPage({ title, heading, message, reqPath, links }) {
  const linkItems = links
    .map(
      (link) =>
        `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`
    )
    .join("");
  const safeTitle = escapeHtml(title);
  const safeHeading = escapeHtml(heading);
  const safeMessage = escapeHtml(message);
  const safeReqPath = escapeHtml(reqPath);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
    <meta name="description" content="Portfolio backend API service status and route information." />
    <style>
      :root {
        color-scheme: light;
      }
      body {
        margin: 0;
        font-family: "Segoe UI", Arial, sans-serif;
        color: #0f172a;
        background: #f8fafc;
      }
      main {
        max-width: 720px;
        margin: 3rem auto;
        padding: 1.5rem;
        background: #ffffff;
        border: 1px solid #dbeafe;
        border-radius: 12px;
      }
      h1 {
        margin-top: 0;
        font-size: 1.75rem;
      }
      p {
        line-height: 1.6;
      }
      code {
        font-family: Consolas, Menlo, monospace;
        background: #eff6ff;
        padding: 0.125rem 0.375rem;
        border-radius: 4px;
      }
      ul {
        padding-left: 1.2rem;
      }
      a {
        color: #1d4ed8;
      }
      a:hover,
      a:focus {
        color: #1e40af;
      }
    </style>
  </head>
  <body>
    <main id="main">
      <h1>${safeHeading}</h1>
      <p>${safeMessage}</p>
      <p>Requested path: <code>${safeReqPath}</code></p>
      <h2>Useful endpoints</h2>
      <ul>
        ${linkItems}
      </ul>
    </main>
  </body>
</html>`;
}

app.get("/api/health", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({
    status: "ok",
    env: config.env,
    uptime: Math.round(process.uptime()),
    service: "portfolio-backend"
  });
});

app.use("/api/portfolio", portfolioRoutes);
app.use("/api/visits", visitRoutes);

app.get("/", (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const html = renderBackendPage({
    title: "Portfolio Backend API",
    heading: "Portfolio Backend API",
    message:
      "This service powers the portfolio client and admin apps. Use the endpoints below to check service health and fetch portfolio data.",
    reqPath: req.originalUrl,
    links: [
      { href: `${baseUrl}/api/health`, label: "GET /api/health" },
      { href: `${baseUrl}/api/portfolio`, label: "GET /api/portfolio" },
      { href: `${baseUrl}/api/visits`, label: "GET /api/visits" },
      { href: config.clientUrl, label: "Open client app" },
      { href: config.adminUrl, label: "Open admin app" }
    ]
  });
  res.status(200).type("html").send(html);
});

app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

app.use((req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      error: "Route not found",
      path: req.originalUrl,
      availableEndpoints: ["/api/health", "/api/portfolio", "/api/visits"]
    });
  }

  const html = renderBackendPage({
    title: "Route Not Found",
    heading: "Route not found",
    message:
      "The page you requested does not exist on this backend service. Use one of the valid routes below.",
    reqPath: req.originalUrl,
    links: [
      { href: `${baseUrl}/`, label: "GET /" },
      { href: `${baseUrl}/api/health`, label: "GET /api/health" },
      { href: `${baseUrl}/api/portfolio`, label: "GET /api/portfolio" },
      { href: `${baseUrl}/api/visits`, label: "GET /api/visits" }
    ]
  });
  return res.status(404).type("html").send(html);
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "CORS origin not allowed" });
  }

  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  if (!error.statusCode || error.statusCode >= 500) {
    logger.error("unhandled request error", {
      message: error.message,
      stack: isProduction() ? undefined : error.stack
    });
  } else {
    logger.warn("request rejected", {
      message: error.message,
      details: error.details
    });
  }

  return sendError(res, error, !isProduction());
});

export default app;
