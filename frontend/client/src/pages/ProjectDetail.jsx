import { Link, useParams } from "react-router-dom";
import { useEffect } from "react";

const getSlug = (project) =>
  project.slug || project.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

export default function ProjectDetail({ portfolio }) {
  const { slug } = useParams();
  const projects = portfolio.projects || [];
  const project = projects.find((item) => getSlug(item) === slug);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);
  const techLinks = {
    javascript: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    react: "https://react.dev/",
    "react.js (18)": "https://react.dev/",
    "node.js": "https://nodejs.org/",
    "node.js (24)": "https://nodejs.org/",
    node: "https://nodejs.org/",
    mongodb: "https://www.mongodb.com/",
    "mongodb atlas": "https://www.mongodb.com/atlas",
    "tailwind css": "https://tailwindcss.com/",
    tailwind: "https://tailwindcss.com/",
    python: "https://www.python.org/",
    java: "https://www.java.com/",
    c: "https://en.cppreference.com/w/c",
    vite: "https://vitejs.dev/",
    express: "https://expressjs.com/",
    "express.js": "https://expressjs.com/",
    mongoose: "https://mongoosejs.com/",
    redis: "https://redis.io/",
    kafka: "https://kafka.apache.org/",
    "socket.io": "https://socket.io/",
    docker: "https://www.docker.com/",
    flask: "https://flask.palletsprojects.com/",
    leaflet: "https://leafletjs.com/",
    html: "https://developer.mozilla.org/en-US/docs/Web/HTML",
    css: "https://developer.mozilla.org/en-US/docs/Web/CSS",
    git: "https://git-scm.com/",
    github: "https://github.com/",
    "gemini-2.5-flash apis": "https://ai.google.dev/"
  };
  const getTechUrl = (tech) => techLinks[tech.toLowerCase().trim()];
  const renderTechChip = (tech) => {
    const url = getTechUrl(tech);
    const className =
      "chip transition duration-200 hover:-translate-y-0.5 hover:border-amber-300/60 hover:text-amber-100 hover:bg-white/10";
    if (!url) {
      return (
        <span key={tech} className="chip">
          {tech}
        </span>
      );
    }
    return (
      <a
        key={tech}
        href={url}
        target="_blank"
        rel="noreferrer"
        className={className}
        title={`Open ${tech} official site`}
      >
        {tech}
      </a>
    );
  };

  if (!project) {
    return (
      <section className="section">
        <div className="mx-auto max-w-4xl px-6">
          <div className="card p-8 text-center">
            <h1 className="text-2xl font-semibold">Project not found</h1>
            <p className="mt-3 text-sm text-slate-300">
              This project link might be outdated. Return to the main portfolio.
            </p>
            <Link to="/" className="btn-primary mt-6 inline-flex">
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-6 flex items-center gap-3 text-sm text-slate-400">
          <Link to="/" className="hover:text-white">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-200">{project.name}</span>
        </div>

        <div className="card card-3d overflow-hidden">
          {project.image && (
            <a href={project.image} target="_blank" rel="noreferrer" className="block image-frame">
              <img
                src={project.image}
                alt={project.name}
                className="max-h-[70vh] w-full bg-slate-950/40 object-contain"
              />
            </a>
          )}
          <div className="p-8">
            <h1 className="text-3xl font-semibold">{project.name}</h1>
            <p className="mt-4 text-slate-300">{project.description}</p>

            {project.highlights && project.highlights.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold">Highlights</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
                  {project.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              {project.tech.map((tech) => renderTechChip(tech))}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              {project.links?.demo && (
                <a
                  href={project.links.demo}
                  className="btn-primary"
                  target="_blank"
                  rel="noreferrer"
                >
                  Live Demo
                </a>
              )}
              {project.links?.repo && (
                <a
                  href={project.links.repo}
                  className="btn-secondary"
                  target="_blank"
                  rel="noreferrer"
                >
                  Source Code
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
