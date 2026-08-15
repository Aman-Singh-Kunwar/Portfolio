import express from "express";
import cors from "cors";
import compression from "compression";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import authRoutes from "./routes/auth.js";
import portfolioRoutes from "./routes/portfolio.js";
import visitRoutes from "./routes/visits.js";
import contactRoutes from "./routes/contact.js";
import { getPortfolio } from "./services/portfolioStore.js";
import { config, isProduction } from "./config.js";
import { createRateLimiter } from "./middleware/rateLimit.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { securityHeaders } from "./middleware/security.js";
import { escapeHtml, sendError } from "./utils/http.js";
import { logger } from "./utils/logger.js";
import { metrics } from "./utils/metrics.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

// Request correlation ID middleware
app.use((req, res, next) => {
  const requestId = req.headers["x-request-id"] || crypto.randomUUID();
  req.id = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
});

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

function formatUptime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}

function renderBackendPage({ title, heading, message, reqPath }) {
  const safeTitle = escapeHtml(title);
  const safeHeading = escapeHtml(heading);
  const safeMessage = escapeHtml(message);
  const safeReqPath = escapeHtml(reqPath);
  const memoryMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
  const uptimeStr = formatUptime(process.uptime());

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
    <meta name="description" content="Portfolio RESTful API service status and telemetry portal." />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
      :root {
        color-scheme: dark;
        --bg: #090d16;
        --surface: #111827;
        --surface-border: #1f2937;
        --accent: #f59e0b;
        --accent-glow: rgba(245, 158, 11, 0.2);
        --text: #f3f4f6;
        --text-muted: #9ca3af;
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        min-height: 100vh;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        color: var(--text);
        background: radial-gradient(1000px 600px at 90% 5%, rgba(245, 158, 11, 0.12), transparent 60%),
                    radial-gradient(800px 500px at 10% 20%, rgba(56, 189, 248, 0.08), transparent 50%),
                    var(--bg);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2.5rem 1rem;
      }
      main {
        max-width: 820px;
        width: 100%;
        padding: 2.5rem;
        background: rgba(17, 24, 39, 0.9);
        border: 1px solid var(--surface-border);
        border-radius: 20px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(20px);
      }
      .top-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
        margin-bottom: 1.5rem;
        padding-bottom: 1.25rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }
      .brand-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 1rem;
        font-weight: 700;
        color: #ffffff;
      }
      .brand-tag {
        font-family: 'Fira Code', monospace;
        font-size: 10px;
        font-weight: 700;
        padding: 3px 8px;
        background: rgba(245, 158, 11, 0.15);
        color: var(--accent);
        border: 1px solid rgba(245, 158, 11, 0.3);
        border-radius: 6px;
      }
      .status-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 700;
        padding: 4px 12px;
        border-radius: 9999px;
        background: rgba(16, 185, 129, 0.12);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.3);
      }
      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #34d399;
        box-shadow: 0 0 8px #34d399;
      }
      h1 {
        font-size: 1.75rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: #ffffff;
        margin-bottom: 0.5rem;
      }
      p.subtitle {
        color: var(--text-muted);
        font-size: 0.95rem;
        line-height: 1.6;
        margin-bottom: 1.75rem;
      }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 0.75rem;
        margin-bottom: 1.75rem;
      }
      .stat-card {
        padding: 0.9rem 1.1rem;
        background: rgba(0, 0, 0, 0.35);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 12px;
      }
      .stat-label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #6b7280;
        font-weight: 600;
      }
      .stat-val {
        font-size: 1.1rem;
        font-weight: 700;
        color: #f9fafb;
        margin-top: 4px;
        font-family: 'Fira Code', monospace;
      }
      .cta-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1.5rem;
        padding: 1.25rem 1.5rem;
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(59, 130, 246, 0.08));
        border: 1px solid rgba(245, 158, 11, 0.3);
        border-radius: 14px;
        margin-bottom: 2rem;
      }
      .cta-box h3 {
        font-size: 1rem;
        color: #fbbf24;
        font-weight: 700;
        margin-bottom: 2px;
      }
      .cta-box p {
        font-size: 0.85rem;
        color: #d1d5db;
      }
      .btn-swagger {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 0.65rem 1.25rem;
        background: #f59e0b;
        color: #030712;
        font-weight: 700;
        font-size: 0.85rem;
        border-radius: 8px;
        text-decoration: none;
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
        transition: all 0.2s ease;
        white-space: nowrap;
      }
      .btn-swagger:hover {
        background: #fbbf24;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(245, 158, 11, 0.35);
      }
      h2.section-heading {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #6b7280;
        margin: 1.5rem 0 0.75rem;
        font-weight: 700;
      }
      .endpoint-list {
        display: grid;
        gap: 0.5rem;
      }
      .endpoint-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.7rem 1rem;
        background: rgba(255, 255, 255, 0.025);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        text-decoration: none;
        transition: all 0.15s ease;
      }
      .endpoint-item:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.12);
        transform: translateX(4px);
      }
      .endpoint-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .method-badge {
        font-size: 10px;
        font-weight: 800;
        font-family: 'Fira Code', monospace;
        padding: 2px 7px;
        border-radius: 5px;
      }
      .method-get { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
      .method-post { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
      .method-put { background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); }
      .method-patch { background: rgba(236, 72, 153, 0.15); color: #f472b6; border: 1px solid rgba(236, 72, 153, 0.3); }
      .endpoint-path {
        font-family: 'Fira Code', monospace;
        font-size: 0.85rem;
        color: #f3f4f6;
        font-weight: 500;
      }
      .endpoint-desc {
        font-size: 0.8rem;
        color: #6b7280;
      }
      .apps-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
        margin-top: 0.5rem;
      }
      .app-card {
        padding: 0.9rem 1.1rem;
        background: rgba(0, 0, 0, 0.35);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 12px;
        text-decoration: none;
        color: #f3f4f6;
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: all 0.2s ease;
      }
      .app-card:hover {
        background: rgba(245, 158, 11, 0.08);
        border-color: rgba(245, 158, 11, 0.3);
        transform: translateY(-2px);
      }
    </style>
  </head>
  <body>
    <main>
      <div class="top-row">
        <div class="brand-title">
          <span class="brand-tag">API GATEWAY</span>
          <span>Portfolio Backend Service</span>
        </div>
        <div class="status-pill">
          <span class="status-dot"></span>
          <span>Operational</span>
        </div>
      </div>

      <h1>${safeHeading}</h1>
      <p class="subtitle">${safeMessage}</p>

      <!-- Live Server Telemetry Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Environment</div>
          <div class="stat-val" style="color: #38bdf8;">${config.env}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Node Runtime</div>
          <div class="stat-val">${process.version}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Heap Memory</div>
          <div class="stat-val">${memoryMB} MB</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Uptime</div>
          <div class="stat-val" style="color: #34d399;">${uptimeStr}</div>
        </div>
      </div>

      <!-- Swagger Explorer Callout -->
      <div class="cta-box">
        <div>
          <h3>Interactive Swagger API Documentation</h3>
          <p>Explore schemas, live request execution, and HMAC authentication details.</p>
        </div>
        <a href="/api/docs" class="btn-swagger">Explore Swagger UI →</a>
      </div>

      <!-- Public API Endpoints -->
      <h2 class="section-heading">Public Endpoints</h2>
      <div class="endpoint-list">
        <a href="/api/health" class="endpoint-item">
          <div class="endpoint-left">
            <span class="method-badge method-get">GET</span>
            <span class="endpoint-path">/api/health</span>
          </div>
          <span class="endpoint-desc">Service Health & Telemetry</span>
        </a>
        <a href="/api/metrics" class="endpoint-item">
          <div class="endpoint-left">
            <span class="method-badge method-get">GET</span>
            <span class="endpoint-path">/api/metrics</span>
          </div>
          <span class="endpoint-desc">Prometheus APM Telemetry</span>
        </a>
        <a href="/api/portfolio" class="endpoint-item">
          <div class="endpoint-left">
            <span class="method-badge method-get">GET</span>
            <span class="endpoint-path">/api/portfolio</span>
          </div>
          <span class="endpoint-desc">Complete Portfolio Dataset</span>
        </a>
        <a href="/api/visits" class="endpoint-item">
          <div class="endpoint-left">
            <span class="method-badge method-get">GET</span>
            <span class="endpoint-path">/api/visits</span>
          </div>
          <span class="endpoint-desc">7-Day Visitor Analytics</span>
        </a>
        <a href="/sitemap.xml" class="endpoint-item">
          <div class="endpoint-left">
            <span class="method-badge method-get">GET</span>
            <span class="endpoint-path">/sitemap.xml</span>
          </div>
          <span class="endpoint-desc">Dynamic XML Sitemap</span>
        </a>
      </div>

      <!-- Admin Endpoints -->
      <h2 class="section-heading">Admin Protected Endpoints (HMAC Auth)</h2>
      <div class="endpoint-list">
        <div class="endpoint-item" style="cursor: default;">
          <div class="endpoint-left">
            <span class="method-badge method-post">POST</span>
            <span class="endpoint-path">/api/auth/login</span>
          </div>
          <span class="endpoint-desc">Issue 24h HMAC Session Token</span>
        </div>
        <div class="endpoint-item" style="cursor: default;">
          <div class="endpoint-left">
            <span class="method-badge method-put">PUT</span>
            <span class="endpoint-path">/api/portfolio</span>
          </div>
          <span class="endpoint-desc">Overwrite Portfolio Database</span>
        </div>
        <div class="endpoint-item" style="cursor: default;">
          <div class="endpoint-left">
            <span class="method-badge method-patch">PATCH</span>
            <span class="endpoint-path">/api/contact/:id/status</span>
          </div>
          <span class="endpoint-desc">Update Recruiter Lead Status</span>
        </div>
      </div>

      <!-- Connected Frontend Applications -->
      <h2 class="section-heading">Connected Applications</h2>
      <div class="apps-grid">
        <a href="${config.clientUrl}" target="_blank" rel="noreferrer" class="app-card">
          <div>
            <div style="font-weight: 700; font-size: 0.9rem;">Client Web App</div>
            <div style="font-size: 0.75rem; color: #9ca3af;">Portfolio Homepage</div>
          </div>
          <span style="color: #f59e0b;">→</span>
        </a>
        <a href="${config.adminUrl}" target="_blank" rel="noreferrer" class="app-card">
          <div>
            <div style="font-weight: 700; font-size: 0.9rem;">Admin Control Center</div>
            <div style="font-size: 0.75rem; color: #9ca3af;">CRM & Content Studio</div>
          </div>
          <span style="color: #f59e0b;">→</span>
        </a>
      </div>
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

app.get("/api/metrics", (req, res) => {
  res.set("Content-Type", "text/plain; version=0.0.4");
  res.set("Cache-Control", "no-store");
  res.send(metrics.toPrometheusFormat());
});

app.use("/api/auth", authRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/contact", contactRoutes);

// Interactive API Documentation (Swagger UI with Clean GitHub Dark Theme)
app.get("/api/docs/spec.json", async (req, res) => {
  const { getSwaggerSpec } = await import("./docs/swagger.js");
  res.set("Cache-Control", "public, max-age=300");
  res.json(getSwaggerSpec());
});

app.get("/api/docs", (req, res) => {
  res.set("Content-Type", "text/html");
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Aman Singh Kunwar — Portfolio API Explorer</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"/>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    /* Modern Developer Theme for Swagger UI */
    :root {
      --bg: #090d16;
      --surface: #111827;
      --surface-card: #161f30;
      --surface-border: #1f293d;
      --border-highlight: #2d3b55;
      --text: #f3f4f6;
      --text-muted: #94a3b8;
      --accent: #f59e0b;
      --accent-glow: rgba(245, 158, 11, 0.2);
      --blue: #38bdf8;
      --green: #34d399;
      --purple: #c084fc;
      --pink: #f472b6;
      --red: #f87171;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: radial-gradient(1200px 700px at 90% 0%, rgba(245, 158, 11, 0.08), transparent 60%),
                  radial-gradient(1000px 600px at 10% 20%, rgba(56, 189, 248, 0.06), transparent 50%),
                  var(--bg) !important;
      color: var(--text) !important;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
    }
    
    /* Top Navbar */
    .custom-navbar {
      background: rgba(17, 24, 39, 0.85);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--surface-border);
      padding: 14px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .custom-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: #ffffff;
      font-weight: 700;
      font-size: 1rem;
    }
    .brand-icon {
      font-family: 'Fira Code', monospace;
      font-size: 10px;
      font-weight: 800;
      padding: 4px 9px;
      border-radius: 6px;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.35);
      color: var(--accent);
      letter-spacing: 0.05em;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .nav-link {
      padding: 6px 14px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--surface-border);
      color: #cbd5e1;
      text-decoration: none;
      font-size: 0.82rem;
      font-weight: 600;
      transition: all 0.15s ease;
    }
    .nav-link:hover {
      background: rgba(245, 158, 11, 0.12);
      border-color: rgba(245, 158, 11, 0.4);
      color: #fbbf24;
      transform: translateY(-1px);
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 9999px;
      background: rgba(16, 185, 129, 0.12);
      color: var(--green);
      font-size: 11px;
      font-weight: 700;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--green);
      box-shadow: 0 0 8px var(--green);
    }

    /* Swagger Base Wrapper */
    .topbar { display: none !important; }
    .swagger-ui {
      max-width: 1180px;
      margin: 0 auto;
      padding: 28px 20px 80px;
      color: var(--text) !important;
    }
    .swagger-ui .wrapper { padding: 0 !important; }
    
    /* Info Card */
    .swagger-ui .info {
      margin: 0 0 24px;
      padding: 24px 28px;
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-radius: 16px;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
    }
    .swagger-ui .info .title {
      color: #ffffff !important;
      font-weight: 800;
      font-size: 1.85rem;
      letter-spacing: -0.02em;
    }
    .swagger-ui .info .title small {
      background: rgba(245, 158, 11, 0.15) !important;
      color: #fbbf24 !important;
      border: 1px solid rgba(245, 158, 11, 0.3) !important;
      border-radius: 9999px !important;
      padding: 3px 10px !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      top: -3px !important;
    }
    .swagger-ui .info p, .swagger-ui .info li {
      color: var(--text-muted) !important;
      font-size: 0.92rem;
      line-height: 1.65;
    }
    .swagger-ui .info h1, .swagger-ui .info h2, .swagger-ui .info h3 {
      color: #ffffff !important;
      font-weight: 700;
    }
    .swagger-ui .info a { color: var(--blue) !important; text-decoration: none; }
    .swagger-ui .info a:hover { text-decoration: underline; }
    
    /* Toolbar (Server & Authorize) */
    .swagger-ui .scheme-container {
      background: var(--surface) !important;
      border: 1px solid var(--surface-border);
      border-radius: 14px;
      box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5) !important;
      padding: 16px 20px !important;
      margin-bottom: 24px !important;
    }
    .swagger-ui .schemes {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .swagger-ui select {
      background: #090d16 !important;
      color: #f3f4f6 !important;
      border: 1px solid var(--surface-border) !important;
      border-radius: 8px;
      padding: 8px 14px;
      font-size: 0.85rem;
      font-family: 'Fira Code', monospace;
      outline: none;
    }
    .swagger-ui select:focus {
      border-color: var(--accent) !important;
    }

    /* Filter Input */
    .swagger-ui .filter {
      margin-bottom: 24px !important;
    }
    .swagger-ui .filter input {
      background: var(--surface) !important;
      border: 1px solid var(--surface-border) !important;
      border-radius: 12px !important;
      color: #ffffff !important;
      padding: 12px 18px !important;
      font-size: 0.9rem !important;
      font-family: 'Inter', sans-serif !important;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      transition: all 0.2s ease;
    }
    .swagger-ui .filter input:focus {
      border-color: var(--accent) !important;
      box-shadow: 0 0 0 3px var(--accent-glow) !important;
    }

    /* Tag Section Cards (Categories) */
    .swagger-ui .opblock-tag-section {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-radius: 16px;
      margin-bottom: 18px;
      overflow: hidden;
      box-shadow: 0 10px 25px -10px rgba(0, 0, 0, 0.4);
      transition: border-color 0.2s ease;
    }
    .swagger-ui .opblock-tag-section:hover {
      border-color: var(--border-highlight);
    }
    .swagger-ui .opblock-tag {
      background: rgba(255, 255, 255, 0.02) !important;
      border-bottom: 1px solid var(--surface-border) !important;
      padding: 16px 20px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      margin: 0 !important;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .swagger-ui .opblock-tag:hover {
      background: rgba(255, 255, 255, 0.04) !important;
    }
    .swagger-ui .opblock-tag a {
      color: #ffffff !important;
      font-size: 1.05rem !important;
      font-weight: 700 !important;
      text-decoration: none !important;
    }
    .swagger-ui .opblock-tag small {
      color: var(--text-muted) !important;
      font-size: 0.82rem !important;
      font-weight: 400 !important;
      margin-left: 12px;
    }
    .swagger-ui .opblock-tag svg {
      fill: var(--text-muted) !important;
      width: 18px;
      height: 18px;
    }
    
    /* Operations Inside Cards */
    .swagger-ui .opblock-tag-section .opblock {
      margin: 10px 16px 14px !important;
      border-radius: 10px !important;
      border: 1px solid var(--surface-border) !important;
      background: rgba(9, 13, 22, 0.7) !important;
      box-shadow: none !important;
      transition: all 0.15s ease;
    }
    .swagger-ui .opblock-tag-section .opblock:hover {
      border-color: var(--border-highlight) !important;
      transform: translateY(-1px);
    }
    .swagger-ui .opblock .opblock-summary {
      padding: 10px 16px !important;
    }
    .swagger-ui .opblock.is-open .opblock-summary {
      border-bottom: 1px solid var(--surface-border);
    }
    .swagger-ui .opblock .opblock-summary-path {
      color: #f3f4f6 !important;
      font-family: 'Fira Code', monospace !important;
      font-weight: 600 !important;
      font-size: 0.88rem !important;
    }
    .swagger-ui .opblock .opblock-summary-description {
      color: var(--text-muted) !important;
      font-size: 0.82rem !important;
    }
    
    /* Method Badges */
    .swagger-ui .opblock-summary-method {
      border-radius: 6px !important;
      font-weight: 800 !important;
      font-size: 11px !important;
      padding: 4px 10px !important;
      min-width: 65px !important;
      text-align: center;
      font-family: 'Fira Code', monospace !important;
      letter-spacing: 0.05em;
    }
    .swagger-ui .opblock-get { border-color: rgba(56, 189, 248, 0.25) !important; background: rgba(56, 189, 248, 0.04) !important; }
    .swagger-ui .opblock-get .opblock-summary-method { background: #0284c7 !important; color: #ffffff !important; }
    
    .swagger-ui .opblock-post { border-color: rgba(245, 158, 11, 0.25) !important; background: rgba(245, 158, 11, 0.04) !important; }
    .swagger-ui .opblock-post .opblock-summary-method { background: #d97706 !important; color: #ffffff !important; }
    
    .swagger-ui .opblock-put { border-color: rgba(192, 132, 252, 0.25) !important; background: rgba(192, 132, 252, 0.04) !important; }
    .swagger-ui .opblock-put .opblock-summary-method { background: #9333ea !important; color: #ffffff !important; }
    
    .swagger-ui .opblock-patch { border-color: rgba(244, 114, 182, 0.25) !important; background: rgba(244, 114, 182, 0.04) !important; }
    .swagger-ui .opblock-patch .opblock-summary-method { background: #db2777 !important; color: #ffffff !important; }
    
    .swagger-ui .opblock-delete { border-color: rgba(248, 113, 113, 0.25) !important; background: rgba(248, 113, 113, 0.04) !important; }
    .swagger-ui .opblock-delete .opblock-summary-method { background: #dc2626 !important; color: #ffffff !important; }

    /* Expanded Details */
    .swagger-ui .opblock-body {
      background: #090d16 !important;
      padding: 18px 20px !important;
    }
    .swagger-ui .opblock-section-header {
      background: var(--surface) !important;
      border-radius: 8px;
      padding: 10px 14px !important;
      border: 1px solid var(--surface-border);
      margin-bottom: 12px;
    }
    .swagger-ui .opblock-section-header h4 {
      color: #ffffff !important;
      font-size: 0.85rem !important;
      font-weight: 700 !important;
    }
    .swagger-ui .tab li button.tablinks { color: var(--text-muted) !important; font-size: 0.85rem; font-weight: 600; }
    .swagger-ui .tab li.active button.tablinks { color: var(--blue) !important; font-weight: 700; border-bottom: 2px solid var(--blue); }
    .swagger-ui .opblock-description-wrapper p, .swagger-ui .renderedMarkdown p { color: #cbd5e1 !important; font-size: 0.9rem; line-height: 1.6; }
    
    /* Parameters & Responses Tables */
    .swagger-ui table.parameters, .swagger-ui table.responses-table { background: transparent !important; width: 100% !important; }
    .swagger-ui table.parameters thead tr th, .swagger-ui table.responses-table thead tr th { color: #94a3b8 !important; border-bottom: 1px solid var(--surface-border) !important; font-size: 0.82rem; font-weight: 700; padding: 10px 8px; text-transform: uppercase; letter-spacing: 0.05em; }
    .swagger-ui table.parameters tbody tr td, .swagger-ui table.responses-table tbody tr td { color: #e2e8f0 !important; border-bottom: 1px solid rgba(255,255,255,0.06) !important; font-size: 0.88rem; padding: 12px 8px; }
    .swagger-ui .parameter__name { color: var(--blue) !important; font-family: 'Fira Code', monospace; font-weight: 600; font-size: 0.88rem; }
    .swagger-ui .parameter__type { color: var(--purple) !important; font-family: 'Fira Code', monospace; font-size: 0.82rem; }
    .swagger-ui .parameter__empty { color: #94a3b8 !important; font-size: 0.88rem; }
    
    /* Response Headers High-Contrast Fix */
    .swagger-ui .response-headers { margin-top: 12px; }
    .swagger-ui .response-headers td, .swagger-ui .response-headers th { color: #cbd5e1 !important; }
    .swagger-ui .response-headers th { color: #94a3b8 !important; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; }
    .swagger-ui .response-headers .header__name { color: #38bdf8 !important; font-family: 'Fira Code', monospace; font-weight: 600; }
    .swagger-ui .response-headers .header__type { color: #c084fc !important; font-family: 'Fira Code', monospace; }
    .swagger-ui .response-col_links { color: #64748b !important; font-size: 0.82rem; }

    /* Responses Box */
    .swagger-ui .responses-inner { background: var(--surface) !important; padding: 18px; border-radius: 12px; border: 1px solid var(--surface-border); }
    .swagger-ui .response-col_status { color: var(--green) !important; font-weight: 800; font-family: 'Fira Code', monospace; font-size: 0.95rem; }
    .swagger-ui .response-col_description { color: #e2e8f0 !important; font-size: 0.88rem; }
    .swagger-ui .response-col_description__inner div { color: #e2e8f0 !important; }
    .swagger-ui pre, .swagger-ui .highlight-code { background: #090d16 !important; border: 1px solid var(--surface-border) !important; border-radius: 8px !important; }
    .swagger-ui pre code { color: #f3f4f6 !important; font-family: 'Fira Code', monospace !important; font-size: 0.85rem; }
    
    /* Action Buttons */
    .swagger-ui .btn.authorize {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05)) !important;
      border: 1px solid rgba(245, 158, 11, 0.4) !important;
      color: #fbbf24 !important;
      font-weight: 700;
      border-radius: 8px;
      padding: 8px 18px;
      font-size: 0.85rem;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
    }
    .swagger-ui .btn.authorize:hover {
      background: rgba(245, 158, 11, 0.25) !important;
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(245, 158, 11, 0.25);
    }
    .swagger-ui .btn.authorize svg { fill: #fbbf24 !important; margin-right: 6px; }
    
    .swagger-ui .btn.execute {
      background: #0284c7 !important;
      border: 1px solid #38bdf8 !important;
      color: #ffffff !important;
      font-weight: 700;
      border-radius: 8px;
      padding: 8px 22px;
      font-size: 0.85rem;
      box-shadow: 0 4px 14px rgba(2, 132, 199, 0.3);
      transition: all 0.15s ease;
    }
    .swagger-ui .btn.execute:hover {
      background: #0369a1 !important;
      transform: translateY(-1px);
    }
    .swagger-ui .btn.try-out__btn {
      color: var(--blue) !important;
      border: 1px solid var(--surface-border) !important;
      background: var(--surface) !important;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 5px 12px;
    }
    .swagger-ui .btn.try-out__btn.cancel {
      color: var(--red) !important;
      border-color: rgba(248, 113, 113, 0.3) !important;
    }
    .swagger-ui input[type=text], .swagger-ui textarea {
      background: #090d16 !important;
      border: 1px solid var(--surface-border) !important;
      color: #f3f4f6 !important;
      border-radius: 8px;
      font-family: 'Fira Code', monospace;
      padding: 8px 12px;
      font-size: 0.85rem;
    }
    .swagger-ui input[type=text]:focus, .swagger-ui textarea:focus {
      border-color: var(--accent) !important;
      outline: none;
    }

    /* Schemas Section */
    .swagger-ui section.models {
      border: 1px solid var(--surface-border) !important;
      border-radius: 16px !important;
      background: var(--surface) !important;
      margin-top: 28px !important;
      box-shadow: 0 10px 25px -10px rgba(0, 0, 0, 0.4);
    }
    .swagger-ui section.models h4 { color: #ffffff !important; font-weight: 700; font-size: 1rem; }
    .swagger-ui .model-box { background: #090d16 !important; border-radius: 8px; padding: 12px; border: 1px solid var(--surface-border); }
    .swagger-ui .model { color: var(--text) !important; font-family: 'Fira Code', monospace; font-size: 0.82rem; }
    .swagger-ui .prop-type { color: var(--blue) !important; }
    .swagger-ui .model-title { color: #ffffff !important; }
    
    /* Authorize Modal High Contrast */
    .swagger-ui .dialog-ux .backdrop-ux { background: rgba(0,0,0,0.8) !important; backdrop-filter: blur(8px); }
    .swagger-ui .dialog-ux .modal-ux {
      background: #111827 !important;
      border: 1px solid var(--surface-border) !important;
      border-radius: 16px !important;
      box-shadow: 0 25px 60px rgba(0,0,0,0.9) !important;
      padding: 24px !important;
    }
    .swagger-ui .dialog-ux .modal-ux-header { border-bottom: 1px solid var(--surface-border); padding-bottom: 14px; }
    .swagger-ui .dialog-ux .modal-ux-header h3 { color: #ffffff !important; font-size: 1.15rem; font-weight: 700; }
    .swagger-ui .dialog-ux .modal-ux-content { color: #cbd5e1 !important; padding: 16px 0; }
    .swagger-ui .dialog-ux .modal-ux-content h4 { color: #ffffff !important; font-size: 0.95rem; font-weight: 700; }
    .swagger-ui .dialog-ux .modal-ux-content label { color: #e2e8f0 !important; font-size: 0.9rem; font-weight: 600; display: block; margin-top: 8px; }
    .swagger-ui .dialog-ux .modal-ux-content code { background: #090d16; color: var(--blue); padding: 3px 8px; border-radius: 6px; font-family: 'Fira Code', monospace; border: 1px solid var(--surface-border); }
    .swagger-ui .modal-ux-content .btn.modal-btn.auth.btn-done {
      background: #1f2937 !important;
      border: 1px solid #374151 !important;
      color: #f3f4f6 !important;
      border-radius: 8px;
      font-weight: 600;
      padding: 8px 18px;
    }
    .swagger-ui .modal-ux-content .btn.modal-btn.auth.authorize {
      background: #f59e0b !important;
      border: 1px solid #fbbf24 !important;
      color: #030712 !important;
      border-radius: 8px;
      font-weight: 700;
      padding: 8px 20px;
    }
  </style>
</head>
<body>
  <!-- Top Navigation Header -->
  <header class="custom-navbar">
    <a href="/" class="custom-brand">
      <span class="brand-icon">API GATEWAY</span>
      <span>Aman Singh Kunwar</span>
    </a>
    <div class="nav-links">
      <div class="status-pill">
        <span class="status-dot"></span>
        <span>Gateway Online</span>
      </div>
      <a href="/" class="nav-link">Backend Portal</a>
      <a href="${config.clientUrl}" target="_blank" rel="noreferrer" class="nav-link">Client App →</a>
      <a href="${config.adminUrl}" target="_blank" rel="noreferrer" class="nav-link">Admin Panel →</a>
    </div>
  </header>

  <!-- Swagger UI Mount Point -->
  <div id="swagger-ui"></div>

  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: "/api/docs/spec.json",
      dom_id: "#swagger-ui",
      deepLinking: true,
      displayRequestDuration: true,
      docExpansion: "none",
      defaultModelsExpandDepth: -1,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true
    });
  </script>
</body>
</html>`);
});

app.get("/sitemap.xml", async (req, res) => {
  const siteUrl = config.clientUrl.replace(/\/$/, "");
  const now = new Date().toISOString();
  let projects = [];
  let achievements = [];

  try {
    const portfolio = await getPortfolio();
    projects = portfolio.projects || [];
    achievements = portfolio.achievements || [];
  } catch {
    // Continue with empty list on failure
  }

  const projectUrls = projects
    .map((p) => {
      const slug = p?.slug || (p?.name || p?.title || "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      return `  <url>
    <loc>${siteUrl}/projects/${slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join("\n");

  const achievementUrls = achievements
    .map((a) => {
      const slug = a?.slug || (a?.title || a?.name || "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      return `  <url>
    <loc>${siteUrl}/achievements/${slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${projectUrls}
${achievementUrls}
</urlset>`;

  res.set("Content-Type", "application/xml");
  res.set("Cache-Control", "public, max-age=3600");
  return res.status(200).send(xml);
});

app.get("/robots.txt", (req, res) => {
  const siteUrl = config.clientUrl.replace(/\/$/, "");
  const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
Sitemap: ${req.protocol}://${req.get("host")}/sitemap.xml
`;
  res.set("Content-Type", "text/plain");
  res.set("Cache-Control", "public, max-age=86400");
  return res.status(200).send(robots);
});

app.get("/", (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const html = renderBackendPage({
    title: "Portfolio Backend API — Status Portal",
    heading: "Portfolio Backend API Gateway",
    message:
      "This RESTful service powers the Portfolio Client, Admin Control Center, and Recruiter CRM. Explore the interactive Swagger API documentation or use the endpoints below.",
    reqPath: req.originalUrl
  });
  res.status(200).type("html").send(html);
});

app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

// Non-API Route 404 Handler
app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      error: "Route not found",
      path: req.originalUrl,
      availableEndpoints: ["/api/docs", "/api/health", "/api/metrics", "/api/portfolio", "/api/visits", "/api/contact", "/sitemap.xml", "/robots.txt"]
    });
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const html = renderBackendPage({
    title: "Route Not Found — Portfolio API",
    heading: "404 — Route Not Found",
    message:
      "The page or route you requested does not exist on this backend API service. Use one of the valid routes below.",
    reqPath: req.originalUrl
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
