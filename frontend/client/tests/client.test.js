import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const portfolioDataPath = path.resolve(__dirname, "../../../data/portfolio.json");

describe("Client Frontend Logic & Architecture Tests", () => {
  const getSlug = (item) =>
    item?.slug || (item?.name || item?.title || "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  test("getSlug generates URL-safe lowercase slugs with special characters stripped", () => {
    assert.equal(getSlug({ name: "ADHYAN.AI", slug: "adhyan-ai" }), "adhyan-ai");
    assert.equal(getSlug({ title: "HacktheWinter National Level Hackathon" }), "hackthewinter-national-level-hackathon");
    assert.equal(getSlug({ name: "Curriculum Management System" }), "curriculum-management-system");
    assert.equal(getSlug({ title: "Surge x DBUU 2026!" }), "surge-x-dbuu-2026");
  });

  test("getSlug is resilient against null, undefined, and empty objects without crashing", () => {
    assert.equal(getSlug(null), "");
    assert.equal(getSlug(undefined), "");
    assert.equal(getSlug({}), "");
    assert.equal(getSlug({ name: "" }), "");
  });

  test("Client portfolio data contains all required sections and valid structures", () => {
    const raw = fs.readFileSync(portfolioDataPath, "utf-8");
    const portfolio = JSON.parse(raw);

    assert.ok(portfolio.meta?.title, "Meta title must exist");
    assert.ok(portfolio.hero?.name, "Hero name must exist");
    assert.ok(portfolio.basics?.email, "Email must exist");
    assert.equal(Array.isArray(portfolio.projects), true);
    assert.equal(portfolio.projects.length >= 5, true, "Must have at least 5 projects");
    assert.equal(Array.isArray(portfolio.achievements), true);
    assert.equal(portfolio.achievements.length >= 5, true, "Must have at least 5 achievements");
    assert.equal(Array.isArray(portfolio.skills), true);
    assert.equal(Array.isArray(portfolio.experience), true);
    assert.equal(Array.isArray(portfolio.education), true);
  });

  test("All featured projects have unique slugs, descriptions, and non-empty tech tags", () => {
    const raw = fs.readFileSync(portfolioDataPath, "utf-8");
    const portfolio = JSON.parse(raw);
    const slugs = new Set();

    for (const p of portfolio.projects) {
      assert.ok(p.name, "Project must have a name");
      assert.ok(p.slug, `Project ${p.name} must have a slug`);
      assert.equal(slugs.has(p.slug), false, `Slug ${p.slug} must be unique`);
      slugs.add(p.slug);
      assert.ok(p.description, `Project ${p.name} must have a description`);
      assert.equal(Array.isArray(p.tech) && p.tech.length > 0, true, `Project ${p.name} must have tech tags`);
    }

    assert.equal(slugs.has("curriculum-management-system"), true, "Must include Curriculum Management System");
    assert.equal(slugs.has("adhyan-ai"), true, "Must include ADHYAN.AI");
    assert.equal(slugs.has("portfolio"), true, "Must include Portfolio");
    assert.equal(slugs.has("eventory"), true, "Must include Eventory");
    assert.equal(slugs.has("ecocommute"), true, "Must include EcoCommute");
  });

  test("All achievements have unique slugs, valid dates, and image cover paths", () => {
    const raw = fs.readFileSync(portfolioDataPath, "utf-8");
    const portfolio = JSON.parse(raw);
    const slugs = new Set();

    for (const a of portfolio.achievements) {
      assert.ok(a.title, "Achievement must have a title");
      assert.ok(a.slug, `Achievement ${a.title} must have a slug`);
      assert.equal(slugs.has(a.slug), false, `Achievement slug ${a.slug} must be unique`);
      slugs.add(a.slug);
      assert.ok(a.coverImage, `Achievement ${a.title} must have a coverImage`);
    }
  });

  test("Skills array items have valid level bounds between 0 and 100", () => {
    const raw = fs.readFileSync(portfolioDataPath, "utf-8");
    const portfolio = JSON.parse(raw);

    for (const s of portfolio.skills) {
      assert.ok(s.name, "Skill must have a name");
      assert.equal(typeof s.level, "number", `Skill ${s.name} level must be number`);
      assert.equal(s.level >= 0 && s.level <= 100, true, `Skill ${s.name} level must be 0-100`);
      assert.ok(s.category, `Skill ${s.name} must belong to a category`);
    }
  });

  test("Technical case studies collection contains valid architectures, metrics, and takeaways", () => {
    const raw = fs.readFileSync(portfolioDataPath, "utf-8");
    const portfolio = JSON.parse(raw);
    const slugs = new Set();

    assert.equal(Array.isArray(portfolio.caseStudies), true);
    assert.equal(portfolio.caseStudies.length >= 4, true, "Must have at least 4 case studies");

    for (const cs of portfolio.caseStudies) {
      assert.ok(cs.title, "Case study must have a title");
      assert.ok(cs.slug, `Case study ${cs.title} must have a slug`);
      assert.equal(slugs.has(cs.slug), false, `Case study slug ${cs.slug} must be unique`);
      slugs.add(cs.slug);
      assert.ok(cs.problem, `Case study ${cs.title} must define the problem`);
      assert.equal(Array.isArray(cs.architecture) && cs.architecture.length > 0, true);
      assert.equal(Array.isArray(cs.metrics) && cs.metrics.length > 0, true);
      assert.ok(cs.takeaway, `Case study ${cs.title} must include a key takeaway`);
    }

    assert.equal(slugs.has("eventory-concurrency"), true);
    assert.equal(slugs.has("adhyan-ai-architecture"), true);
    assert.equal(slugs.has("curriculum-management-system"), true);
    assert.equal(slugs.has("ecocommute-ml-routing"), true);
  });
});
