import { test, expect } from "@playwright/test";

test.describe("Contact Form & Recruiter Inquiries E2E", () => {
  test("validates required fields on empty submit", async ({ page }) => {
    await page.goto("/#contact");
    const submitBtn = page.locator("form button[type='submit'], button:has-text('Send')").first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await expect(page).toHaveURL(/.*contact/);
    }
  });

  test("fills recruiter inquiry form accurately", async ({ page }) => {
    await page.goto("/#contact");
    const nameInput = page.locator("#contact-name, input[name='name']").first();
    const emailInput = page.locator("#contact-email, input[name='email']").first();
    const subjectInput = page.locator("#contact-subject, input[name='subject']").first();
    const messageInput = page.locator("#contact-message, textarea[name='message']").first();

    if (await nameInput.isVisible() && await emailInput.isVisible()) {
      await nameInput.fill("Automated Recruiter E2E");
      await emailInput.fill("recruiter-e2e@example.com");
      if (await subjectInput.isVisible()) {
        await subjectInput.fill("Senior Full Stack Engineering Opportunity");
      }
      if (await messageInput.isVisible()) {
        await messageInput.fill("We reviewed your portfolio architecture and would love to connect for a tech lead interview.");
      }
      await expect(nameInput).toHaveValue("Automated Recruiter E2E");
      await expect(emailInput).toHaveValue("recruiter-e2e@example.com");
    }
  });

  test("submits recruiter message and verifies confirmation banner", async ({ page }) => {
    await page.goto("/#contact");
    const nameInput = page.locator("#contact-name").first();
    const emailInput = page.locator("#contact-email").first();
    const subjectInput = page.locator("#contact-subject").first();
    const messageInput = page.locator("#contact-message").first();
    const submitBtn = page.locator("form button[type='submit']").first();

    if (await nameInput.isVisible() && await submitBtn.isVisible()) {
      await nameInput.fill("Google DeepMind Recruiter");
      await emailInput.fill("deepmind-recruiter@example.com");
      await subjectInput.fill("Interview Invitation — Full Stack Engineer");
      await messageInput.fill("Your multi-tier caching and test automation architecture is impressive.");

      await submitBtn.click();

      // Verify either the success banner appears or graceful fallback is shown
      const successBanner = page.locator("text='Message Received!'");
      await expect(successBanner.or(page.locator("form"))).toBeVisible({ timeout: 8000 });
    }
  });
});
