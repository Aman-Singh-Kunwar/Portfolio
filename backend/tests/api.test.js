import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import crypto from "node:crypto";
import app from "../src/app.js";
import { config } from "../src/config.js";
import { cache } from "../src/services/cache.js";
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
  await cache.flush();
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

describe("1. Core API & System Health", () => {
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

  test("GET /api/docs/spec.json returns valid OpenAPI 3.0 specification", async () => {
    const res = await fetch(`${baseUrl}/api/docs/spec.json`);
    assert.equal(res.status, 200);
    const spec = await res.json();
    assert.equal(spec.openapi, "3.0.3");
    assert.ok(spec.info?.title);
    assert.ok(spec.paths["/api/portfolio"]);
    assert.ok(spec.paths["/api/auth/login"]);
    assert.ok(spec.paths["/api/contact"]);
  });

  test("Non-existing API routes return standard 404 JSON response", async () => {
    const res = await fetch(`${baseUrl}/api/non-existent-endpoint`);
    assert.equal(res.status, 404);
    const data = await res.json();
    assert.equal(data.error, "Route not found");
  });
});

describe("2. HMAC Authentication & Session Security", () => {
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
    assert.ok(await cache.get(`session:${data.token}`), "Issued session must be stored in cache");
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

  test("Rejects forged HMAC session token with tampered timestamp", async () => {
    const session = generateAdminSessionToken();
    const [issuedAt, , hmac] = session.token.split(".");
    // Attacker modifies expiration timestamp to next year while keeping old HMAC signature
    const forgedExpiresAt = Date.now() + 365 * 24 * 60 * 60 * 1000;
    const forgedToken = `${issuedAt}.${forgedExpiresAt}.${hmac}`;

    assert.equal(verifyAdminSessionToken(forgedToken), false, "Tampered timestamp must fail HMAC verification");

    const res = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${forgedToken}` }
    });
    assert.equal(res.status, 401, "Protected endpoint must reject forged token");
  });

  test("Rejects expired HMAC session token", async () => {
    const pastIssuedAt = Date.now() - 100_000;
    const pastExpiresAt = Date.now() - 1_000; // Expired 1 second ago
    const payload = `${pastIssuedAt}.${pastExpiresAt}`;
    const hmac = crypto.createHmac("sha256", config.adminToken).update(payload).digest("hex");
    const expiredToken = `${payload}.${hmac}`;

    // Token has valid HMAC signature but is past its expiration time
    assert.equal(verifyAdminSessionToken(expiredToken), false, "Expired timestamp must fail token verification");

    const res = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${expiredToken}` }
    });
    assert.equal(res.status, 401, "Protected endpoint must reject expired token");
  });

  test("POST /api/auth/logout revokes cached admin session and prevents reuse", async () => {
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: config.adminToken })
    });
    assert.equal(loginRes.status, 200);
    const { token } = await loginRes.json();

    // 1st logout succeeds and deletes token from cache
    const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.equal(logoutRes.status, 200);
    assert.equal(await cache.get(`session:${token}`), null, "Token must be removed from cache on logout");

    // 2nd request with revoked token must fail with 401
    const secondLogoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.equal(secondLogoutRes.status, 401, "Revoked session must be rejected");
  });
});

describe("3. Runtime Zod Schema Validation & Error Handling", () => {
  test("POST /api/contact rejects empty body with 400 Bad Request", async () => {
    const res = await fetch(`${baseUrl}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.error, "Validation failed");
    assert.ok(Array.isArray(data.details));
    assert.ok(data.details.length >= 3, "Should report missing required fields");
  });

  test("POST /api/contact rejects invalid email format", async () => {
    const res = await fetch(`${baseUrl}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Jane Recruiter",
        email: "not-a-valid-email-address",
        subject: "Hiring Opportunity",
        message: "Hello, we would like to interview you for a senior role."
      })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.error, "Validation failed");
    assert.ok(
      data.details.some((msg) => msg.toLowerCase().includes("email")),
      "Should identify invalid email in details"
    );
  });

  test("POST /api/contact rejects message shorter than minimum length (10 chars)", async () => {
    const res = await fetch(`${baseUrl}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Jane Recruiter",
        email: "recruiter@company.com",
        subject: "Hiring",
        message: "Too short" // 9 chars
      })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.error, "Validation failed");
    assert.ok(
      data.details.some((msg) => msg.includes("10 characters")),
      "Should reject message under 10 characters"
    );
  });

  test("POST /api/auth/login rejects empty or missing token", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "   " })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.error.includes("token is required"));
  });
});

describe("4. Multi-Tier Cache & In-Memory Fallback Behavior", () => {
  test("Cache supports basic set, get, del, and flush operations", async () => {
    const testKey = "test:user:profile";
    const testData = { id: 42, role: "developer", tags: ["react", "node"] };

    await cache.set(testKey, testData, 60);
    const cached = await cache.get(testKey);
    assert.deepEqual(cached, testData, "Retrieved cache data must match saved payload");

    await cache.del(testKey);
    const afterDel = await cache.get(testKey);
    assert.equal(afterDel, null, "Deleted cache key must return null");
  });

  test("Cache respects TTL expiration in memory fallback", async () => {
    const expiringKey = "test:expiring:token";
    // Set 1-second TTL
    await cache.set(expiringKey, { active: true }, 1);
    assert.ok(await cache.get(expiringKey), "Should exist immediately after set");

    // Wait 1.1 seconds for TTL expiration
    await new Promise((resolve) => setTimeout(resolve, 1100));
    assert.equal(await cache.get(expiringKey), null, "Key must expire and return null after TTL elapses");
  });

  test("Cache getOrSet pattern evaluates factory function on miss", async () => {
    const computeKey = "test:computed:result";
    let factoryCalled = 0;

    const factory = async () => {
      factoryCalled += 1;
      return { answer: 42 };
    };

    // First call: cache miss -> calls factory
    const res1 = await cache.getOrSet(computeKey, factory, 60);
    assert.equal(res1.answer, 42);
    assert.equal(factoryCalled, 1);

    // Second call: cache hit -> returns cached without calling factory
    const res2 = await cache.getOrSet(computeKey, factory, 60);
    assert.equal(res2.answer, 42);
    assert.equal(factoryCalled, 1, "Factory must NOT be called on second hit");

    await cache.del(computeKey);
  });
});
