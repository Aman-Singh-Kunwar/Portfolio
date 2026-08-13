import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const getSlug = (item) =>
  item?.slug || (item?.name || item?.title || "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

export default function ProjectDetail({ portfolio = {} }) {
  const { slug } = useParams();
  const projects = portfolio?.projects || [];
  const project = projects.find((item) => getSlug(item) === slug);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isIframeModalOpen, setIsIframeModalOpen] = useState(false);
  const [deviceMode, setDeviceMode] = useState("desktop");

  const setProjectFallbackImage = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = "/images/portfolio.jpg";
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
        setIsIframeModalOpen(false);
      }
    };
    if (isLightboxOpen || isIframeModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isLightboxOpen, isIframeModalOpen]);

  const techLinks = {
    javascript: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    react: "https://react.dev/",
    "react.js (18)": "https://react.dev/",
    "node.js": "https://nodejs.org/",
    "node.js (24)": "https://nodejs.org/",
    node: "https://nodejs.org/",
    mongodb: "https://www.mongodb.com/",
    "mongodb atlas": "https://www.mongodb.com/atlas",
    php: "https://www.php.net/",
    mysql: "https://www.mysql.com/",
    "mysql (phpmyadmin)": "https://www.mysql.com/",
    wordpress: "https://wordpress.org/",
    bootstrap: "https://getbootstrap.com/",
    "apache / xampp": "https://httpd.apache.org/",
    apache: "https://httpd.apache.org/",
    xampp: "https://www.apachefriends.org/",
    "icici payment gateway": "https://www.icicibank.com/",
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
    html5: "https://developer.mozilla.org/en-US/docs/Web/HTML",
    "html5 & css3": "https://developer.mozilla.org/en-US/docs/Web/HTML",
    css: "https://developer.mozilla.org/en-US/docs/Web/CSS",
    css3: "https://developer.mozilla.org/en-US/docs/Web/CSS",
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

  const projectImageRaw = typeof project.image === "string" ? project.image.trim() : "";
  const projectImage = projectImageRaw || "/images/portfolio.jpg";

  return (
    <section className="section py-12">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-6 flex items-center gap-3 text-sm text-slate-400">
          <Link to="/" className="hover:text-white">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-200">{project.name}</span>
        </div>

        <div className="card card-3d overflow-hidden">
          {projectImage && (
            <div
              className="relative cursor-pointer group"
              onClick={() => setIsLightboxOpen(true)}
              title="Click to view full image"
            >
              <img
                src={projectImage}
                alt={project.name}
                width="1400"
                height="788"
                loading="eager"
                decoding="async"
                onError={setProjectFallbackImage}
                className="max-h-[70vh] w-full bg-slate-950/40 object-contain transition group-hover:scale-[1.01]"
              />
              <span className="absolute bottom-4 right-4 rounded-full bg-slate-950/80 border border-white/10 px-3 py-1 text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition">
                🔍 Click to Expand
              </span>
            </div>
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
                <>
                  <button
                    type="button"
                    onClick={() => setIsIframeModalOpen(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    ⚡ Test Live Demo (iFrame)
                  </button>
                  <a
                    href={project.links.demo}
                    className="btn-secondary"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open External Tab ↗
                  </a>
                </>
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

      {isIframeModalOpen && project.links?.demo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="relative flex flex-col w-full h-full sm:h-[88vh] sm:max-w-5xl sm:rounded-2xl border-0 sm:border sm:border-white/20 bg-slate-900 shadow-2xl overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-2 p-3 border-b border-white/10 bg-slate-950/90 shrink-0">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="flex gap-1.5 shrink-0">
                  <span className="h-3 w-3 rounded-full bg-rose-500" />
                  <span className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />
                </div>
                <span className="text-xs font-mono text-slate-300 truncate max-w-[120px] sm:max-w-xs">
                  {project.links.demo}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden sm:flex items-center gap-1 rounded-xl bg-slate-950 p-1 border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setDeviceMode("desktop")}
                    className={`px-2.5 py-1 rounded-lg font-medium transition ${
                      deviceMode === "desktop" ? "bg-amber-400 text-slate-950 font-semibold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    🖥️ Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceMode("mobile")}
                    className={`px-2.5 py-1 rounded-lg font-medium transition ${
                      deviceMode === "mobile" ? "bg-amber-400 text-slate-950 font-semibold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    📱 Mobile
                  </button>
                </div>
                <a
                  href={project.links.demo}
                  target="_blank"
                  rel="noreferrer"
                  className="sm:hidden btn-secondary text-[11px] px-2.5 py-1"
                >
                  Open Tab ↗
                </a>
                <button
                  type="button"
                  onClick={() => setIsIframeModalOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/20 text-white transition text-sm font-bold"
                  title="Close Live Preview"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* iFrame Viewport Stage */}
            <div className="flex-1 bg-slate-950 flex items-center justify-center p-0 sm:p-4 overflow-hidden relative">
              <div
                className={`transition-all duration-300 w-full h-full bg-white relative overflow-hidden ${
                  deviceMode === "mobile"
                    ? "sm:max-w-[375px] sm:max-h-[720px] sm:rounded-[32px] sm:border-[8px] sm:border-slate-800 sm:shadow-2xl"
                    : "sm:rounded-xl"
                }`}
              >
                <iframe
                  src={project.links.demo}
                  title={`${project.name} Live Demo`}
                  className="w-full h-full border-0 bg-white block"
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "0",
                    overflow: "hidden",
                    touchAction: "pan-x pan-y",
                    WebkitOverflowScrolling: "touch"
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setIsLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl border border-white/20 bg-slate-900 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-slate-950/80 border border-white/20 text-white hover:bg-white/20 transition"
              aria-label="Close image lightbox"
            >
              ✕
            </button>
            <img
              src={projectImage}
              alt={project.name}
              className="max-h-[85vh] max-w-[85vw] object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
}
