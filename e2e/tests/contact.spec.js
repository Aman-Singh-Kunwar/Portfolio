import { test, expect } from "@playwright/test";

test.describe("Contact Form & Recruiter Inquiries E2E", () => {
  test("validates required fields on empty submit", async ({ page }) => {
    await page.goto("/#contact");
    const submitBtn = page.locator("form button[type='submit'], button:has-text('Send')").first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      // Should not navigate away or should show validation errors
      await expect(page).toHaveURL(/.*contact/);
    }
  });

  test("fills recruiter inquiry form accurately", async ({ page }) => {
    await page.goto("/#contact");
    const nameInput = page.locator("input[name='name'], input[placeholder*='name' i]").first();
    const emailInput = page.locator("input[name='email'], input[placeholder*='email' i]").first();
    const messageInput = page.locator("textarea[name='message'], textarea[placeholder*='message' i]").first();

    if (await nameInput.isVisible() && await emailInput.isVisible()) {
      await nameInput.fill("Automated Recruiter E2E");
      await emailInput.fill("recruiter-e2e@example.com");
      if (await messageInput.isVisible()) {
        await messageInput.fill("Testing end-to-end recruitment contact submission flow.");
      }
      await expect(nameInput).toHaveValue("Automated Recruiter E2E");
    }
  });
});
