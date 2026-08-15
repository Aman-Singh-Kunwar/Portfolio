import { test, expect } from "@playwright/test";

test.describe("Admin Panel & CRM E2E Flow", () => {
  const adminBaseUrl = process.env.PLAYWRIGHT_ADMIN_URL || "http://localhost:5174";

  test("redirects unauthenticated users to login page", async ({ page }) => {
    await page.goto(`${adminBaseUrl}/dashboard`);
    await expect(page).toHaveURL(/.*login/);
    const loginBtn = page.locator("button[type='submit'], button:has-text('Login')");
    await expect(loginBtn.first()).toBeVisible();
  });

  test("rejects invalid admin credentials gracefully", async ({ page }) => {
    await page.goto(`${adminBaseUrl}/login`);
    const tokenInput = page.locator("input[type='password'], input[name='token'], input[placeholder*='token' i]").first();
    const submitBtn = page.locator("button[type='submit'], button:has-text('Login')").first();

    if (await tokenInput.isVisible() && await submitBtn.isVisible()) {
      await tokenInput.fill("wrong-test-token-12345");
      await submitBtn.click();
      // Should remain on login page with error state
      await expect(page).toHaveURL(/.*login/);
    }
  });
});
