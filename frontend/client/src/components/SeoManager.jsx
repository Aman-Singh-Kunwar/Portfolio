import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const DEFAULT_TITLE = "Aman Singh Kunwar | Full Stack Developer";
const DEFAULT_DESCRIPTION =
  "Full stack portfolio showcasing projects, skills, achievements, and experience with React, Node.js, and MongoDB.";
const DEFAULT_IMAGE = "/images/me.jpg";

const getProjectSlug = (project) =>
  project.slug || project.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

const getAchievementSlug = (item) =>
  item.slug || item.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

function setMeta(attr, key, content) {
  if (!content) return;
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setLink(rel, href) {
  if (!href) return;
  let tag = document.head.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

function setJsonLd(id, payload) {
  let script = document.getElementById(id);
  if (!payload) {
    if (script) script.remove();
    return;
  }
  if (!script) {
    script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(payload);
}

function toAbsoluteUrl(path, siteUrl) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return new URL(path.startsWith("/") ? path : `/${path}`, siteUrl).toString();
}

export default function SeoManager({ portfolio }) {
  const location = useLocation();

  useEffect(() => {
    const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
    const path = location.pathname || "/";
    const canonicalUrl = new URL(path, siteUrl).toString();
    const projects = portfolio.projects || [];
    const achievements = portfolio.achievements || [];
    const skills = (portfolio.skills || []).map((s) => s.name);
    const techStack = portfolio.techStack || [];
    const allSkills = Array.from(new Set([...skills, ...techStack]));

    const project = projects.find((item) => `/projects/${getProjectSlug(item)}` === path);
    const achievement = achievements.find((item) => `/achievements/${getAchievementSlug(item)}` === path);

    const title =
      project?.name
        ? `${project.name} | Aman Singh Kunwar`
        : achievement?.title
          ? `${achievement.title} | Aman Singh Kunwar`
          : portfolio.meta?.title || DEFAULT_TITLE;

    const description =
      project?.description ||
      achievement?.summary ||
      portfolio.meta?.description ||
      DEFAULT_DESCRIPTION;

    const socialImage = toAbsoluteUrl(
      project?.image || achievement?.coverImage || portfolio.hero?.image || DEFAULT_IMAGE,
      siteUrl
    );

    const keywords = [
      "Aman Singh Kunwar",
      "Aman Singh Kunwar portfolio",
      "Full Stack Developer Dehradun",
      "MERN Stack Engineer",
      "React Developer",
      "PHP Developer",
      "WordPress Developer",
      "MySQL Developer",
      "Node.js Developer",
      "Software Engineer Uttarakhand",
      "Evon Technologies intern",
      ...allSkills,
      ...projects.map((p) => p.name)
    ].join(", ");

    document.title = title;
    setLink("canonical", canonicalUrl);
    setMeta("name", "description", description);
    setMeta("name", "keywords", keywords);
    setMeta("name", "author", portfolio.hero?.name || "Aman Singh Kunwar");
    setMeta("name", "robots", "index,follow,max-image-preview:large");
    setMeta("property", "og:type", project || achievement ? "article" : "website");
    setMeta("property", "og:site_name", "Aman Singh Kunwar Portfolio");
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:image", socialImage);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", socialImage);

    const personJsonLd = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: portfolio.hero?.name || "Aman Singh Kunwar",
      jobTitle: portfolio.basics?.role || "Full Stack Developer",
      email: portfolio.basics?.email || undefined,
      telephone: portfolio.basics?.phone || undefined,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Dehradun",
        addressRegion: "Uttarakhand",
        addressCountry: "India"
      },
      image: toAbsoluteUrl(portfolio.hero?.image || DEFAULT_IMAGE, siteUrl),
      url: siteUrl,
      knowsAbout: allSkills,
      alumniOf: {
        "@type": "EducationalOrganization",
        name: "Dev Bhoomi Uttarakhand University, Dehradun"
      },
      hasOccupation: {
        "@type": "Occupation",
        name: "Web Development Intern",
        occupationLocation: {
          "@type": "City",
          name: "Dehradun, Uttarakhand"
        }
      },
      sameAs: (portfolio.basics?.social || []).map((item) => item.url).filter(Boolean)
    };

    const websiteJsonLd = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Aman Singh Kunwar Portfolio",
      url: siteUrl,
      author: {
        "@type": "Person",
        name: "Aman Singh Kunwar"
      }
    };

    setJsonLd("jsonld-person", personJsonLd);
    setJsonLd("jsonld-website", websiteJsonLd);

    if (project) {
      const projectJsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareSourceCode",
        name: project.name,
        description: project.description,
        programmingLanguage: project.tech || [],
        codeRepository: project.links?.repo || undefined,
        targetProduct: project.links?.demo
          ? {
              "@type": "SoftwareApplication",
              name: project.name,
              url: project.links.demo
            }
          : undefined,
        author: {
          "@type": "Person",
          name: "Aman Singh Kunwar"
        }
      };
      setJsonLd("jsonld-project", projectJsonLd);
    } else {
      setJsonLd("jsonld-project", null);
    }

    if (project || achievement) {
      const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl
          },
          {
            "@type": "ListItem",
            position: 2,
            name: project ? "Projects" : "Achievements",
            item: `${siteUrl}#${project ? "projects" : "achievements"}`
          },
          {
            "@type": "ListItem",
            position: 3,
            name: project ? project.name : achievement.title,
            item: canonicalUrl
          }
        ]
      };
      setJsonLd("jsonld-breadcrumb", breadcrumbJsonLd);
    } else {
      setJsonLd("jsonld-breadcrumb", null);
    }
  }, [location.pathname, portfolio]);

  return null;
}
