import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import compression from "compression";
import portfolioRoutes from "./routes/portfolio.js";
import { connectAndSeed } from "./db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGO_URI;
const corsOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!mongoUri) {
  throw new Error("MONGO_URI is required. See backend/.env.example");
}

app.use(
  cors({
    origin: corsOrigins.length ? corsOrigins : true,
    credentials: true
  })
);
app.use(compression());
app.use(express.json({ limit: "1mb" }));

function renderBackendPage({ title, heading, message, reqPath, links }) {
  const linkItems = links
    .map((link) => `<li><a href="${link.href}">${link.label}</a></li>`)
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
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
      <h1>${heading}</h1>
      <p>${message}</p>
      <p>Requested path: <code>${reqPath}</code></p>
      <h2>Useful endpoints</h2>
      <ul>
        ${linkItems}
      </ul>
    </main>
  </body>
</html>`;
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/portfolio", portfolioRoutes);

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
      { href: "https://aman-singh-kunwar-portfolio1.onrender.com/", label: "Open client app" },
      { href: "https://aman-singh-kunwar-portfolio2.onrender.com/", label: "Open admin app" }
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
      availableEndpoints: ["/api/health", "/api/portfolio"]
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
      { href: `${baseUrl}/api/portfolio`, label: "GET /api/portfolio" }
    ]
  });
  return res.status(404).type("html").send(html);
});

connectAndSeed(mongoUri)
  .then(() => {
    app.listen(port, () => {
      console.log(`API listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
