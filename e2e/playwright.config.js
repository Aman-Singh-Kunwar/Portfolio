import { defineConfig, devices } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

export default defineConfig({
  testDir: path.resolve(__dirname, "tests"),
  testMatch: "**/*.spec.js",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  webServer: [
    {
      command: "node backend/server.js",
      cwd: rootDir,
      url: "http://127.0.0.1:4000/api/health",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: "pipe",
      stderr: "pipe",
      env: {
        PORT: "4000",
        ADMIN_TOKEN: "admin-secret-token",
        NODE_ENV: "development"
      }
    },
    {
      command: "npm --prefix frontend/client run preview",
      cwd: rootDir,
      url: "http://127.0.0.1:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: "pipe",
      stderr: "pipe"
    },
    {
      command: "npm --prefix frontend/admin run preview",
      cwd: rootDir,
      url: "http://127.0.0.1:5174",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: "pipe",
      stderr: "pipe"
    }
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
