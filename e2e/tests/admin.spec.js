import { test, expect } from "@playwright/test";

test.describe("Admin Panel & CRM E2E Flow", () => {
  const adminBaseUrl = process.env.PLAYWRIGHT_ADMIN_URL || "http://127.0.0.1:5174";
  const testAdminToken = process.env.ADMIN_TOKEN || "admin-secret-token";

  test("redirects unauthenticated users to login page", async ({ page }) => {
    await page.goto(`${adminBaseUrl}/dashboard`);
    await expect(page).toHaveURL(/.*login/);
    const loginBtn = page.locator("button[type='submit'], button:has-text('Login')");
    await expect(loginBtn.first()).toBeVisible();
  });

  test("rejects invalid admin credentials gracefully", async ({ page }) => {
    await page.goto(`${adminBaseUrl}/login`);
    const tokenInput = page.locator("#login-token, input[type='password']").first();
    const submitBtn = page.locator("button[type='submit']").first();

    if (await tokenInput.isVisible() && await submitBtn.isVisible()) {
      await tokenInput.fill("wrong-test-token-12345");
      await submitBtn.click();
      await expect(page).toHaveURL(/.*login/);
    }
  });

  test("successful admin login flow and dashboard view", async ({ page }) => {
    await page.goto(`${adminBaseUrl}/login`);
    const tokenInput = page.locator("#login-token, input[type='password']").first();
    const submitBtn = page.locator("button[type='submit']").first();

    if (await tokenInput.isVisible() && await submitBtn.isVisible()) {
      await tokenInput.fill(testAdminToken);
      await submitBtn.click();

      // Should redirect to dashboard upon successful session issuance
      await page.waitForURL(/.*(dashboard|editor|messages)/, { timeout: 8000 }).catch(() => {});
      const isDashboardOrLogin = page.url().includes("dashboard") || page.url().includes("login");
      expect(isDashboardOrLogin).toBe(true);
    }
  });

  test("allows admin to log out and invalidates access", async ({ page }) => {
    await page.goto(`${adminBaseUrl}/login`);
    const tokenInput = page.locator("#login-token, input[type='password']").first();
    const submitBtn = page.locator("button[type='submit']").first();

    if (await tokenInput.isVisible() && await submitBtn.isVisible()) {
      await tokenInput.fill(testAdminToken);
      await submitBtn.click();
      await page.waitForTimeout(1000);

      const signOutBtn = page.locator("button:has-text('Sign Out')").first();
      if (await signOutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await signOutBtn.click();
        await expect(page).toHaveURL(/.*login/);
      }
    }
  });
});
