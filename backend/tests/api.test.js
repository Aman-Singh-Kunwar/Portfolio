import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import app from "../src/app.js";
import { config } from "../src/config.js";
import { generateAdminSessionToken, verifyAdminSessionToken } from "../src/utils/token.js";

let server;
let baseUrl;

before(async () => {
  // Set test token if not set
  if (!config.adminToken) {
    config.adminToken = "TestAdminSecret123!";
  }

  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

describe("Backend API Integration Tests", () => {
  test("GET /api/health returns service status and uptime", async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, "ok");
    assert.equal(data.service, "portfolio-backend");
    assert.equal(typeof data.uptime, "number");
  });

  test("GET /robots.txt returns valid robot directives", async () => {
    const res = await fetch(`${baseUrl}/robots.txt`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("content-type")?.includes("text/plain"), true);
    const text = await res.text();
    assert.equal(text.includes("User-agent: *"), true);
    assert.equal(text.includes("Sitemap:"), true);
  });

  test("GET /sitemap.xml returns valid XML sitemap", async () => {
    const res = await fetch(`${baseUrl}/sitemap.xml`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("content-type")?.includes("xml"), true);
    const text = await res.text();
    assert.equal(text.includes("<urlset"), true);
  });

  test("POST /api/auth/login with valid token issues 24h HMAC session token", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: config.adminToken })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(typeof data.token, "string");
    assert.equal(data.token.split(".").length, 3);
    assert.equal(typeof data.expiresAt, "number");
  });

  test("POST /api/auth/login with invalid token rejects with 401 Unauthorized", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "wrong-password-token" })
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.error, "Invalid admin token");
  });

  test("HMAC token generator and verifier works accurately", () => {
    const session = generateAdminSessionToken();
    assert.equal(typeof session.token, "string");
    assert.equal(verifyAdminSessionToken(session.token), true);
    assert.equal(verifyAdminSessionToken("invalid.tampered.token"), false);
  });

  test("POST /api/contact rejects missing required fields with 400 Validation Error", async () => {
    const res = await fetch(`${baseUrl}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Aman", email: "invalid-email" })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.error, "Validation failed");
    assert.equal(Array.isArray(data.details), true);
  });

  test("Non-existing API routes return standard 404 JSON response", async () => {
    const res = await fetch(`${baseUrl}/api/non-existent-endpoint`);
    assert.equal(res.status, 404);
    const data = await res.json();
    assert.equal(data.error, "Route not found");
  });
});
