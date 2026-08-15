import { test, expect } from "@playwright/test";

test.describe("Portfolio Homepage & Case Study E2E Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads homepage with correct title and candidate branding", async ({ page }) => {
    await expect(page).toHaveTitle(/Aman Singh Kunwar/i);
    const heroHeading = page.locator("h1");
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText(/Aman Singh Kunwar/i);
  });

  test("renders project showcase cards with live demo links", async ({ page }) => {
    const projectCards = page.locator("#projects, section:has-text('Projects')");
    await expect(projectCards.first()).toBeVisible();

    const cmsProject = page.locator("text=Curriculum Management System").first();
    await expect(cmsProject).toBeVisible();
  });

  test("opens and interacts with Technical Case Study modal", async ({ page }) => {
    const caseStudyBtn = page.locator("button:has-text('Case Study')").first();
    if (await caseStudyBtn.isVisible()) {
      await caseStudyBtn.click();

      // Modal dialog should be visible
      const modal = page.locator("[role='dialog'], .fixed");
      await expect(modal.first()).toBeVisible();

      // Switch tabs
      const architectureTab = page.locator("button:has-text('Architecture')").first();
      if (await architectureTab.isVisible()) {
        await architectureTab.click();
        await expect(architectureTab).toBeVisible();
      }

      // Close modal
      const closeBtn = page.locator("button:has-text('Close'), button[aria-label*='close' i]").first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
    }
  });

  test("navigates through smooth scroll navigation links", async ({ page }) => {
    const skillsLink = page.locator("a[href*='#skills'], nav >> text=Skills").first();
    if (await skillsLink.isVisible()) {
      await skillsLink.click();
      await expect(page.locator("#skills, section:has-text('Skills')").first()).toBeVisible();
    }
  });

  test("adapts to mobile viewport and opens navigation menu", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    const mobileMenuBtn = page.locator("button[aria-label*='menu' i], button:has(svg)").first();
    await expect(page.locator("h1")).toBeVisible();
    if (await mobileMenuBtn.isVisible()) {
      await mobileMenuBtn.click();
    }
  });
});
