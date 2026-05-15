import { HttpError } from "../utils/http.js";
import { logger } from "../utils/logger.js";

const REQUIRED_TOP_LEVEL_KEYS = [
  "meta",
  "hero",
  "basics",
  "about",
  "skills",
  "techStack",
  "experience",
  "education",
  "projects",
  "achievements",
  "contact"
];

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateStringArray(value, path, errors, { allowEmpty = true } = {}) {
  if (!Array.isArray(value)) {
    errors.push(`${path} must be an array`);
    return;
  }

  if (!allowEmpty && value.length === 0) {
    errors.push(`${path} must contain at least one item`);
  }

  value.forEach((item, index) => {
    if (!isNonEmptyString(item)) {
      errors.push(`${path}[${index}] must be a non-empty string`);
    }
  });
}

function validateLinkObject(value, path, errors) {
  if (!isPlainObject(value)) {
    errors.push(`${path} must be an object`);
    return;
  }

  for (const [key, url] of Object.entries(value)) {
    if (url !== "" && typeof url !== "string") {
      errors.push(`${path}.${key} must be a string`);
    }
  }
}

function validateSlug(value, path, errors) {
  if (!isNonEmptyString(value)) {
    errors.push(`${path} must be a non-empty string`);
    return;
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    errors.push(`${path} must be URL-safe lowercase text, for example my-project`);
  }
}

export function normalizePortfolioData(payload) {
  const normalized = structuredClone(payload);

  normalized.stats = {
    ...(isPlainObject(normalized.stats) ? normalized.stats : {}),
    projects: Array.isArray(normalized.projects) ? normalized.projects.length : 0,
    achievements: Array.isArray(normalized.achievements) ? normalized.achievements.length : 0
  };

  return normalized;
}

export function validatePortfolioData(payload) {
  const errors = [];

  if (!isPlainObject(payload)) {
    throw new HttpError(400, "Portfolio payload must be a JSON object");
  }

  for (const key of REQUIRED_TOP_LEVEL_KEYS) {
    if (!(key in payload)) {
      errors.push(`${key} is required`);
    }
  }

  if (isPlainObject(payload.meta)) {
    if (!isNonEmptyString(payload.meta.title)) errors.push("meta.title is required");
    if (!isNonEmptyString(payload.meta.description)) errors.push("meta.description is required");
  } else {
    errors.push("meta must be an object");
  }

  if (isPlainObject(payload.hero)) {
    if (!isNonEmptyString(payload.hero.name)) errors.push("hero.name is required");
    if (!isNonEmptyString(payload.hero.tagline)) errors.push("hero.tagline is required");
    validateStringArray(payload.hero.roles, "hero.roles", errors, { allowEmpty: false });
  } else {
    errors.push("hero must be an object");
  }

  if (isPlainObject(payload.basics)) {
    if (!isNonEmptyString(payload.basics.role)) errors.push("basics.role is required");
    if (!isNonEmptyString(payload.basics.email)) errors.push("basics.email is required");
    if (!Array.isArray(payload.basics.social)) {
      errors.push("basics.social must be an array");
    }
  } else {
    errors.push("basics must be an object");
  }

  if (isPlainObject(payload.about)) {
    if (!isNonEmptyString(payload.about.summary)) errors.push("about.summary is required");
    validateStringArray(payload.about.highlights, "about.highlights", errors);
  } else {
    errors.push("about must be an object");
  }

  if (!Array.isArray(payload.skills)) {
    errors.push("skills must be an array");
  } else {
    payload.skills.forEach((skill, index) => {
      if (!isPlainObject(skill)) {
        errors.push(`skills[${index}] must be an object`);
        return;
      }
      if (!isNonEmptyString(skill.name)) errors.push(`skills[${index}].name is required`);
      if (typeof skill.level !== "number" || skill.level < 0 || skill.level > 100) {
        errors.push(`skills[${index}].level must be a number from 0 to 100`);
      }
    });
  }

  validateStringArray(payload.techStack, "techStack", errors);

  if (!Array.isArray(payload.projects)) {
    errors.push("projects must be an array");
  } else {
    const slugs = new Set();
    payload.projects.forEach((project, index) => {
      if (!isPlainObject(project)) {
        errors.push(`projects[${index}] must be an object`);
        return;
      }
      if (!isNonEmptyString(project.name)) errors.push(`projects[${index}].name is required`);
      validateSlug(project.slug, `projects[${index}].slug`, errors);
      if (slugs.has(project.slug)) errors.push(`projects[${index}].slug must be unique`);
      slugs.add(project.slug);
      if (!isNonEmptyString(project.description)) {
        errors.push(`projects[${index}].description is required`);
      }
      validateStringArray(project.highlights || [], `projects[${index}].highlights`, errors);
      validateStringArray(project.tech, `projects[${index}].tech`, errors);
      validateLinkObject(project.links || {}, `projects[${index}].links`, errors);
    });
  }

  if (!Array.isArray(payload.achievements)) {
    errors.push("achievements must be an array");
  } else {
    const slugs = new Set();
    payload.achievements.forEach((achievement, index) => {
      if (!isPlainObject(achievement)) {
        errors.push(`achievements[${index}] must be an object`);
        return;
      }
      if (!isNonEmptyString(achievement.title)) {
        errors.push(`achievements[${index}].title is required`);
      }
      validateSlug(achievement.slug, `achievements[${index}].slug`, errors);
      if (slugs.has(achievement.slug)) {
        errors.push(`achievements[${index}].slug must be unique`);
      }
      slugs.add(achievement.slug);
      validateStringArray(achievement.photos || [], `achievements[${index}].photos`, errors);
    });
  }

  if (!Array.isArray(payload.experience)) errors.push("experience must be an array");
  if (!Array.isArray(payload.education)) errors.push("education must be an array");
  if (!isPlainObject(payload.contact)) errors.push("contact must be an object");

  if (errors.length) {
    logger.warn("portfolio validation failed", {
      errors
    });
    throw new HttpError(400, "Portfolio validation failed", errors);
  }

  return normalizePortfolioData(payload);
}
