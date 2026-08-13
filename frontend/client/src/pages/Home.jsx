import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaJava, FaGithub, FaLinkedin, FaCopy, FaCheck } from "react-icons/fa6";
import {
  SiC,
  SiJavascript,
  SiMongodb,
  SiNodedotjs,
  SiPython,
  SiReact,
  SiTailwindcss,
  SiPhp,
  SiWordpress,
  SiMysql,
  SiBootstrap,
  SiApache,
  SiHtml5,
  SiCss
} from "react-icons/si";
import { sendContactMessage } from "../api";
import ResumeModal from "../components/ResumeModal";
import ShareModal from "../components/ShareModal";

const getSlug = (project) =>
  project.slug || project.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

export default function Home({ portfolio, status }) {
  const { hero, basics, about, skills, techStack, experience, education, projects, achievements } =
    portfolio;
  const navigate = useNavigate();
  const location = useLocation();
  const [showDesktopPhoto, setShowDesktopPhoto] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(min-width: 768px)").matches;
  });
  const [copyToast, setCopyToast] = useState("");
  const [copiedField, setCopiedField] = useState("");
  const [activeSkillCategory, setActiveSkillCategory] = useState("All");
  const [activeProjectTech, setActiveProjectTech] = useState("All");
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [contactStatus, setContactStatus] = useState("idle");
  const [contactError, setContactError] = useState("");

  const handleCopyText = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(label);
      setCopyToast(`${label} copied to clipboard!`);
      setTimeout(() => {
        setCopyToast("");
        setCopiedField("");
      }, 3000);
    }).catch(() => {});
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus("sending");
    setContactError("");

    try {
      await sendContactMessage(contactForm);
      setContactStatus("success");
      setContactForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setContactStatus("error");
      setContactError(err.message || "Failed to send message.");
    }
  };
  const availability = basics.availability || "Open to internships and junior full stack roles";
  const mailtoLink = basics.email ? `mailto:${basics.email}?subject=Work%20Opportunity` : "";
  const organizationLinks = {
    "aasraa trust": "https://aasraatrust.org/",
    "graphic era university": "https://geu.ac.in/",
    "graphic era (deemed to be university)": "https://geu.ac.in/",
    "st. jude's school": "https://stjudes.in/",
    "evon technologies": "https://www.evontech.com/",
    "uttarakhand state authority for minority education (usame)": "https://usame.uk.gov.in/",
    usame: "https://usame.uk.gov.in/",
    "dev bhoomi uttarakhand university, dehradun": "https://dbuu.ac.in/",
    "dev bhoomi uttarakhand university": "https://dbuu.ac.in/",
    dbuu: "https://dbuu.ac.in/",
    "shree goverdhan saraswati vidya mandir inter college dharampur, dehradun": "https://svmdharampur.com",
    "shree goverdhan saraswati vidya mandir inter college": "https://svmdharampur.com",
    svmdharampur: "https://svmdharampur.com"
  };

  const getOrganizationUrl = (name) =>
    organizationLinks[(typeof name === "string" ? name : "").toLowerCase().trim()];

  const renderOrganization = (name) => {
    const url = getOrganizationUrl(name);
    if (!url) {
      return name;
    }
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="hover:text-amber-200 transition-colors underline"
        title={`Open ${name}`}
      >
        {name}
      </a>
    );
  };

  const renderBulletWithLinks = (bulletText, itemKey = "bullet") => {
    if (!bulletText || typeof bulletText !== "string") return bulletText || "";
    const rawUrlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = bulletText.split(rawUrlRegex);

    return (
      <span key={itemKey}>
        {parts.map((part, pIdx) => {
          if (/^https?:\/\//i.test(part)) {
            const cleanUrl = part.replace(/[.,;)]+$/, "");
            const trailing = part.slice(cleanUrl.length);
            return (
              <span key={`${itemKey}-url-${pIdx}`}>
                <a
                  href={cleanUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-300 underline transition hover:text-amber-200"
                >
                  {cleanUrl}
                </a>
                {trailing}
              </span>
            );
          }

          let segmentMap = [{ text: part, url: null }];
          Object.entries(organizationLinks).forEach(([orgName, orgUrl]) => {
            const nextSegments = [];
            segmentMap.forEach((seg) => {
              if (seg.url) {
                nextSegments.push(seg);
                return;
              }
              const esc = orgName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              const orgRegex = new RegExp(`(${esc})`, "gi");
              const subParts = seg.text.split(orgRegex);
              subParts.forEach((sp) => {
                if (sp.toLowerCase() === orgName) {
                  nextSegments.push({ text: sp, url: orgUrl });
                } else if (sp) {
                  nextSegments.push({ text: sp, url: null });
                }
              });
            });
            segmentMap = nextSegments;
          });

          return segmentMap.map((seg, sIdx) => {
            if (seg.url) {
              return (
                <a
                  key={`${itemKey}-org-${pIdx}-${sIdx}`}
                  href={seg.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-300 underline transition hover:text-amber-200"
                >
                  {seg.text}
                </a>
              );
            }
            return <span key={`${itemKey}-txt-${pIdx}-${sIdx}`}>{seg.text}</span>;
          });
        })}
      </span>
    );
  };
  const socialIcons = {
    linkedin: FaLinkedin,
    github: FaGithub
  };
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
  const renderTechChip = (tech, extraClass = "") => {
    const url = getTechUrl(tech);
    const className = `chip transition duration-200 hover:-translate-y-0.5 hover:border-amber-300/60 hover:text-amber-100 hover:bg-white/10 ${extraClass}`.trim();
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
  const skillIcons = {
    javascript: SiJavascript,
    react: SiReact,
    "node.js": SiNodedotjs,
    node: SiNodedotjs,
    mongodb: SiMongodb,
    php: SiPhp,
    mysql: SiMysql,
    wordpress: SiWordpress,
    bootstrap: SiBootstrap,
    "apache / xampp": SiApache,
    "html5 & css3": SiHtml5,
    html: SiHtml5,
    css: SiCss,
    "tailwind css": SiTailwindcss,
    tailwind: SiTailwindcss,
    python: SiPython,
    c: SiC,
    java: FaJava
  };
  const skillColors = {
    javascript: "text-amber-300",
    react: "text-cyan-300",
    "node.js": "text-emerald-300",
    node: "text-emerald-300",
    mongodb: "text-green-300",
    php: "text-indigo-300",
    mysql: "text-sky-300",
    wordpress: "text-blue-400",
    bootstrap: "text-purple-400",
    "apache / xampp": "text-rose-400",
    "html5 & css3": "text-orange-400",
    "tailwind css": "text-sky-300",
    tailwind: "text-sky-300",
    python: "text-blue-300",
    c: "text-indigo-300",
    java: "text-red-300"
  };
  const skillGradients = {
    react: "from-cyan-400 to-sky-500",
    "node.js": "from-emerald-400 to-green-500",
    node: "from-emerald-400 to-green-500",
    mongodb: "from-green-400 to-emerald-600",
    php: "from-indigo-400 to-purple-600",
    mysql: "from-sky-400 to-blue-600",
    wordpress: "from-blue-400 to-indigo-500",
    javascript: "from-amber-400 to-yellow-500",
    "tailwind css": "from-cyan-400 to-teal-400",
    tailwind: "from-cyan-400 to-teal-400",
    python: "from-blue-400 to-indigo-600",
    java: "from-red-400 to-rose-600"
  };

  const skillLinks = {
    javascript: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    react: "https://react.dev/",
    "node.js": "https://nodejs.org/",
    node: "https://nodejs.org/",
    mongodb: "https://www.mongodb.com/",
    php: "https://www.php.net/",
    mysql: "https://www.mysql.com/",
    wordpress: "https://wordpress.org/",
    "tailwind css": "https://tailwindcss.com/",
    tailwind: "https://tailwindcss.com/",
    python: "https://www.python.org/",
    c: "https://en.cppreference.com/w/c",
    java: "https://www.java.com/"
  };

  const handleCardNavigate = (slug) => {
    navigate(`/projects/${slug}`);
  };
  const profileImage = (hero.image || basics.avatarUrl || "").trim();

  const stopPropagation = (event) => {
    event.stopPropagation();
  };
  const setProjectFallbackImage = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = "/images/portfolio.jpg";
  };
  const setAchievementFallbackImage = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = "/images/hackthewinter.jpg";
  };
  const setProfileFallbackImage = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = "/images/me.jpg";
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const update = () => setShowDesktopPhoto(mediaQuery.matches);
    update();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", update);
      return () => mediaQuery.removeEventListener("change", update);
    }

    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, []);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        const timeoutId = setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 150);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [location]);

  return (
    <>
      <section id="home" className="section">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <span className="chip">{hero.greeting}</span>
            <h1 className="text-4xl md:text-6xl font-semibold leading-tight">{hero.name}</h1>
            <p className="text-lg text-slate-300">{hero.tagline}</p>
            <p className="text-sm text-slate-400">
              {basics.role} based in {basics.location}. {availability}.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
              {hero.roles.map((role) => (
                <span key={role} className="rounded-full border border-white/10 px-3 py-1">
                  {role}
                </span>
              ))}
            </div>
            <div className="card card-3d glow-ring p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Core Stack</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {techStack.slice(0, 5).map((tech) => renderTechChip(tech))}
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <a href="#projects" className="btn-primary">
                {hero.ctaPrimary}
              </a>
              <a href="#hire-me" className="btn-secondary">
                Hire Me
              </a>
              <button
                type="button"
                onClick={() => setIsResumeModalOpen(true)}
                className="btn-secondary"
              >
                {hero.ctaSecondary}
              </button>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="btn-secondary flex items-center gap-2"
                title="Share candidate profile via WhatsApp, LinkedIn, Twitter, Email, or OS Share Sheet"
              >
                <FaCopy className="text-amber-400" /> Share Profile
              </button>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-300">
              {basics.social.map((item) => (
                (() => {
                  const key = (item.icon || item.label || "").toLowerCase();
                  const Icon = socialIcons[key];
                  if (Icon) {
                    return (
                        <a
                          key={item.label}
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={item.label}
                          title={item.label}
                          className="btn-primary inline-flex items-center justify-center px-4 py-2"
                        >
                          <Icon className="text-2xl" />
                        </a>
                    );
                  }
                  return (
                <a
                  key={item.label}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/10 px-4 py-2 hover:border-white/30"
                >
                  {item.label}
                </a>
                  );
                })()
              ))}
            </div>
            {status === "offline" && (
              <p className="text-xs text-amber-200">Offline preview mode: API not reachable.</p>
            )}
          </div>
          <div className="space-y-6">
            {showDesktopPhoto && profileImage && (
              <div className="image-frame card-3d p-0 hidden md:block">
                <img
                  src={profileImage}
                  alt={hero.name}
                  width="800"
                  height="420"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  onError={setProfileFallbackImage}
                  className="h-[420px] w-full object-cover object-top"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="about" className="section section-deferred">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="section-subtitle">About</p>
            <h2 className="section-title">Building reliable, user-first products</h2>
            <p className="mt-4 text-slate-300">{about.summary}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="card card-3d p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Core Focus</p>
                <p className="mt-3 text-sm text-slate-300">
                  Clean UI, scalable APIs, and data-driven features that solve real problems.
                </p>
              </div>
              <div className="card card-3d p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">What I bring</p>
                <p className="mt-3 text-sm text-slate-300">
                  Strong fundamentals, hands-on project delivery, and a growth mindset.
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-3 text-sm text-slate-300">
              {about.highlights.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-300" />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            <div className="card card-3d p-6">
              <p className="section-subtitle">Tech Stack</p>
              <h3 className="mt-2 text-xl font-semibold">Tools I use daily</h3>
              <div className="mt-6 flex flex-wrap gap-2">
                {techStack.map((tech) => renderTechChip(tech))}
              </div>
            </div>
            <div className="card card-3d p-6">
              <p className="section-subtitle">Profile</p>
              <h3 className="mt-2 text-xl font-semibold">Background summary</h3>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <p>Domain: Web Development, Software Engineering, MERN Projects</p>
                <p>Education: Bachelor of Technology (CSE) (2024-2028)</p>
                <p>Language: English, Hindi</p>
                <p>Interest: Traveling, Coding</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="skills" className="section section-deferred">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-subtitle">Skills</p>
              <h2 className="section-title">Technical proficiency</h2>
              <p className="mt-3 text-sm text-slate-300">
                A focused toolkit for building polished interfaces and reliable full stack systems.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-slate-950/60 p-1.5 text-xs">
              {["All", "Frontend", "Backend & DB", "CMS & Core"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveSkillCategory(cat)}
                  className={`rounded-lg px-3 py-1.5 font-medium transition ${
                    activeSkillCategory === cat
                      ? "bg-amber-400 text-slate-950 font-semibold shadow"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {skills
              .filter((s) => activeSkillCategory === "All" || s.category === activeSkillCategory)
              .map((skill) => {
                const normalizedName = skill.name.toLowerCase();
                const Icon = skillIcons[normalizedName];
                const accent = skillColors[normalizedName] || "text-amber-300";
                const gradient = skillGradients[normalizedName] || "from-amber-400 to-amber-500";
                const skillUrl = skillLinks[normalizedName];
                const content = (
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition group-hover:scale-110">
                      {Icon ? <Icon className={`text-2xl ${accent}`} /> : null}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-semibold">{skill.name}</p>
                          {skill.category && (
                            <span className="text-[10px] text-slate-400 border border-white/10 rounded-full px-2 py-0.5">
                              {skill.category}
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-mono text-slate-300">{skill.level}%</span>
                      </div>
                      <div className="mt-3 h-2 w-full rounded-full bg-slate-900/80 overflow-hidden">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );

                return (
                  <div
                    key={skill.name}
                    className="card card-3d p-6 group transition duration-300 hover:-translate-y-1 hover:border-white/30"
                  >
                    {skillUrl ? (
                      <a
                        href={skillUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block"
                        title={`Open ${skill.name} official site`}
                      >
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      <section id="experience" className="section section-deferred">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-2">
          <div>
            <p className="section-subtitle">Experience</p>
            <h2 className="section-title">What I have done</h2>
            <div className="mt-8 relative border-l-2 border-amber-400/30 pl-6 space-y-6 ml-2">
              {experience.map((item) => (
                <div key={`${item.title}-${item.company}`} className="card card-3d p-6 relative group">
                  <div className="absolute -left-[31px] top-6 h-3.5 w-3.5 rounded-full border-2 border-amber-400 bg-slate-950 glow-ring group-hover:scale-125 transition" />
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-amber-300">
                      {item.start} {item.end ? `- ${item.end}` : ""}
                    </span>
                    <span>{item.location}</span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                  <p className="text-xs text-slate-300 font-medium">{renderOrganization(item.company)}</p>
                  <ul className="mt-3 list-disc space-y-1.5 pl-4 text-xs text-slate-300 leading-relaxed">
                    {item.bullets.map((bullet) => (
                      <li key={bullet}>{renderBulletWithLinks(bullet)}</li>
                    ))}
                  </ul>
                  {item.tech && item.tech.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5 pt-3 border-t border-white/10">
                      {item.tech.map((t) => renderTechChip(t, "text-[10px] px-2 py-0.5"))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="section-subtitle">Education</p>
            <h2 className="section-title">Where I learned</h2>
            <div className="mt-8 relative border-l-2 border-amber-400/30 pl-6 space-y-6 ml-2">
              {education.map((item) => (
                <div key={item.degree} className="card card-3d p-6 relative group">
                  <div className="absolute -left-[31px] top-6 h-3.5 w-3.5 rounded-full border-2 border-amber-400 bg-slate-950 glow-ring group-hover:scale-125 transition" />
                  <p className="text-xs font-mono text-amber-300">
                    {item.start} - {item.end}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold">{item.degree}</h3>
                  <p className="text-xs text-slate-300 font-medium">
                    {renderOrganization(item.institution)}
                  </p>
                  {item.grade && (
                    <div className="mt-3">
                      <span className="chip text-[11px] font-semibold text-amber-300 border-amber-400/30 bg-amber-400/10">
                        {item.grade}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="section section-deferred">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-subtitle">Projects</p>
              <h2 className="section-title">Selected work</h2>
            </div>
            <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-slate-950/60 p-1.5 text-xs">
              {["All", "React", "Node.js", "PHP", "MongoDB", "Python", "JavaScript"].map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => setActiveProjectTech(tech)}
                  className={`rounded-lg px-3 py-1.5 font-medium transition ${
                    activeProjectTech === tech
                      ? "bg-amber-400 text-slate-950 font-semibold shadow"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {projects
              .filter((project) => {
                if (activeProjectTech === "All") return true;
                const pTechs = (project.tech || []).map((t) => t.toLowerCase());
                return pTechs.some((t) => t.includes(activeProjectTech.toLowerCase()));
              })
              .map((project) => {
              const slug = getSlug(project);
              const projectImage = typeof project.image === "string" ? project.image.trim() : "";
              return (
                <div
                  key={project.name}
                  className="card card-3d cv-auto overflow-hidden cursor-pointer transition hover:border-white/20"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleCardNavigate(slug)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleCardNavigate(slug);
                    }
                  }}
                >
                  {projectImage && (
                    <div className="m-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                      <img
                        src={projectImage}
                        alt={project.name}
                        width="1200"
                        height="675"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                        onError={setProjectFallbackImage}
                        className="w-full h-auto object-contain transition-transform duration-500 ease-out hover:scale-[1.02]"
                      />
                    </div>
                  )}
                  <div className="p-8">
                    <h3 className="text-xl font-semibold">{project.name}</h3>
                    <p className="mt-3 text-sm text-slate-300">{project.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.tech.map((tech) => renderTechChip(tech))}
                    </div>
                    <div className="mt-6 flex flex-wrap gap-4 text-sm">
                      <Link to={`/projects/${slug}`} className="btn-primary" onClick={stopPropagation}>
                        View Project
                      </Link>
                      {project.links?.demo && (
                        <a
                          href={project.links.demo}
                          className="btn-secondary"
                          target="_blank"
                          rel="noreferrer"
                          onClick={stopPropagation}
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
                          onClick={stopPropagation}
                        >
                          Source Code
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="achievements" className="section section-deferred">
        <div className="mx-auto max-w-6xl px-6">
          <p className="section-subtitle">Achievements</p>
          <h2 className="section-title">Certifications & milestones</h2>
          <p className="mt-3 text-sm text-slate-300">
            A curated list of certifications, awards, and achievements.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {(achievements || []).length > 0 ? (
              achievements.map((item) => {
                const coverImage = typeof item.coverImage === "string" ? item.coverImage.trim() : "";
                return (
                <div key={item.title} className="card card-3d cv-auto p-6">
                  {item.issuer && (
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      {item.issuer}
                    </p>
                  )}
                  <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                  {item.summary && (
                    <p className="mt-3 text-sm text-slate-300">{item.summary}</p>
                  )}
                  {coverImage && (
                    <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                      <img
                        src={coverImage}
                        alt={item.title}
                        width="1200"
                        height="675"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                        onError={setAchievementFallbackImage}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  )}
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      to={`/achievements/${getSlug(item)}`}
                      className="btn-primary"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
                );
              })
            ) : (
              <>
                <div className="card card-3d p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Certification
                  </p>
                  <h3 className="mt-3 text-lg font-semibold">Add your first certificate</h3>
                  <p className="mt-3 text-sm text-slate-300">
                    Update `data/portfolio.json` with your certifications to show them here.
                  </p>
                </div>
                <div className="card card-3d p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Achievement
                  </p>
                  <h3 className="mt-3 text-lg font-semibold">Highlight a milestone</h3>
                  <p className="mt-3 text-sm text-slate-300">
                    Add awards, hackathon wins, or notable accomplishments.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="section section-deferred">
        <div className="mx-auto max-w-6xl px-6">
          <p className="section-subtitle">Find Me</p>
          <h2 className="section-title">Find me on GitHub and LinkedIn</h2>
          <p className="mt-3 text-sm text-slate-300">
            Follow my work, projects, and updates on these platforms.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {basics.social.map((item) => {
              const key = (item.icon || item.label || "").toLowerCase();
              const Icon = socialIcons[key];
              if (!Icon) {
                return null;
              }
              return (
                <a
                  key={`find-${item.label}`}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  title={item.label}
                  className="btn-primary inline-flex items-center justify-center px-4 py-2"
                >
                  <Icon className="text-2xl" />
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section id="hire-me" className="section section-deferred">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="section-subtitle">Hire Me</p>
          <div className="card card-3d p-5 sm:p-8 md:p-10 relative overflow-hidden">
            {copyToast && (
              <div className="absolute top-4 right-4 z-20 rounded-full border border-amber-300/40 bg-amber-400/20 px-4 py-1.5 text-xs font-semibold text-amber-200 backdrop-blur shadow-lg animate-fade-in">
                {copyToast}
              </div>
            )}
            <div className="grid gap-8 md:grid-cols-[1.05fr_0.95fr] items-start">
              <div className="space-y-5">
                <div>
                  <h2 className="text-3xl font-semibold">Ready to join your team</h2>
                  <p className="mt-3 text-sm text-slate-300">
                    I am looking for internship and entry-level full stack opportunities where I can
                    build scalable products, collaborate with strong teams, and keep learning fast.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-[10px] sm:text-xs text-slate-300">
                    <span className="chip !tracking-[0.1em] sm:!tracking-[0.2em]">{availability}</span>
                    <span className="chip !tracking-[0.1em] sm:!tracking-[0.2em]">{basics.location}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="card card-3d p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Email</p>
                      <p className="mt-1 text-xs sm:text-sm text-slate-200 font-mono break-all">{basics.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText(basics.email, "Email")}
                      className={`grid h-9 w-9 place-items-center rounded-xl border transition ${
                        copiedField === "Email"
                          ? "border-emerald-400/50 bg-emerald-400/20 text-emerald-300"
                          : "border-white/10 bg-white/5 text-slate-300 hover:border-amber-400/60 hover:bg-amber-400/10 hover:text-amber-200"
                      }`}
                      aria-label="Copy email to clipboard"
                      title="Copy email to clipboard"
                    >
                      {copiedField === "Email" ? <FaCheck className="text-sm" /> : <FaCopy className="text-sm" />}
                    </button>
                  </div>
                  <div className="card card-3d p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Phone</p>
                      <p className="mt-1 text-xs sm:text-sm text-slate-200 font-mono break-all">{basics.phone}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText(basics.phone, "Phone")}
                      className={`grid h-9 w-9 place-items-center rounded-xl border transition ${
                        copiedField === "Phone"
                          ? "border-emerald-400/50 bg-emerald-400/20 text-emerald-300"
                          : "border-white/10 bg-white/5 text-slate-300 hover:border-amber-400/60 hover:bg-amber-400/10 hover:text-amber-200"
                      }`}
                      aria-label="Copy phone to clipboard"
                      title="Copy phone to clipboard"
                    >
                      {copiedField === "Phone" ? <FaCheck className="text-sm" /> : <FaCopy className="text-sm" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-1">
                  {mailtoLink && (
                    <a href={mailtoLink} className="btn-secondary">
                      Open Mail Client
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsResumeModalOpen(true)}
                    className="btn-secondary"
                  >
                    Download Resume
                  </button>
                </div>
              </div>

              <div className="card card-3d p-6 bg-slate-950/40 border border-white/10 rounded-2xl space-y-3">
                <div>
                  <h3 className="text-xl font-semibold">Send a Direct Message</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Have a project or job role? Send a message directly to my recruiter inbox.
                  </p>
                </div>

                {contactStatus === "success" ? (
                  <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-5 text-emerald-200 text-sm space-y-3 animate-fade-in shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-xl font-bold">
                        🎉
                      </div>
                      <div>
                        <p className="font-bold text-base text-emerald-100">Message Received!</p>
                        <p className="text-xs text-emerald-300">Thank you for reaching out.</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border border-emerald-400/20 bg-emerald-950/40 text-xs text-emerald-200 leading-relaxed font-medium">
                      ⚡ <strong>Response Guarantee:</strong> Aman typically responds to recruiter inquiries within <strong>2–4 hours</strong>.
                    </div>
                    <button
                      type="button"
                      onClick={() => setContactStatus("idle")}
                      className="btn-secondary text-xs mt-1 border-emerald-400/30 text-emerald-200 hover:bg-emerald-400 hover:text-slate-950"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-3 text-sm">
                    <div>
                      <label htmlFor="contact-name" className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                        Your Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        className="input w-full text-xs py-2"
                        placeholder="e.g. Jane Doe"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                        Email Address
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        className="input w-full text-xs py-2"
                        placeholder="name@company.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-subject" className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                        Subject
                      </label>
                      <input
                        id="contact-subject"
                        type="text"
                        required
                        className="input w-full text-xs py-2"
                        placeholder="Recruitment / Project Inquiry"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-message" className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                        Message
                      </label>
                      <textarea
                        id="contact-message"
                        required
                        rows="3"
                        className="input w-full font-sans text-xs resize-none py-2"
                        placeholder="Write your message here..."
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      />
                    </div>

                    {contactStatus === "error" && (
                      <p className="text-xs text-rose-300">{contactError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={contactStatus === "sending"}
                      className="btn-primary w-full justify-center text-xs py-2.5"
                    >
                      {contactStatus === "sending" ? "Sending Message..." : "Send Message"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <ResumeModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        resumeUrl={basics.resumeUrl}
      />
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        name={hero.name}
        role={basics.role}
      />
    </>
  );
}
