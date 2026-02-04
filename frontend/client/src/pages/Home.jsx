import { Link, useNavigate } from "react-router-dom";
import { FaJava, FaGithub, FaLinkedin } from "react-icons/fa6";
import {
  SiC,
  SiJavascript,
  SiMongodb,
  SiNodedotjs,
  SiPython,
  SiReact,
  SiTailwindcss
} from "react-icons/si";

const getSlug = (project) =>
  project.slug || project.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

export default function Home({ portfolio, status }) {
  const { hero, basics, about, skills, techStack, experience, education, projects, achievements } =
    portfolio;
  const navigate = useNavigate();
  const availability = basics.availability || "Open to internships and junior full stack roles";
  const mailtoLink = basics.email ? `mailto:${basics.email}?subject=Work%20Opportunity` : "";
  const organizationLinks = {
    "aasraa trust": "https://aasraatrust.org/",
    "dev bhoomi uttarakhand university, dehradun": "https://www.dbuu.ac.in/",
    "shree goverdhan saraswati vidya mandir inter college dharampur, dehradun":
      "https://svmdharampur.com/"
  };
  const getOrganizationUrl = (name) => organizationLinks[name.toLowerCase().trim()];
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
        className="hover:text-amber-200 transition-colors"
        title={`Open ${name}`}
      >
        {name}
      </a>
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
    "tailwind css": "text-sky-300",
    tailwind: "text-sky-300",
    python: "text-blue-300",
    c: "text-indigo-300",
    java: "text-red-300"
  };
  const skillLinks = {
    javascript: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    react: "https://react.dev/",
    "node.js": "https://nodejs.org/",
    node: "https://nodejs.org/",
    mongodb: "https://www.mongodb.com/",
    "tailwind css": "https://tailwindcss.com/",
    tailwind: "https://tailwindcss.com/",
    python: "https://www.python.org/",
    java: "https://www.java.com/",
    c: "https://en.cppreference.com/w/c"
  };

  const handleCardNavigate = (slug) => {
    navigate(`/projects/${slug}`);
  };

  const stopPropagation = (event) => {
    event.stopPropagation();
  };

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
              <a href={basics.resumeUrl} className="btn-secondary">
                {hero.ctaSecondary}
              </a>
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
            {(hero.image || basics.avatarUrl) && (
              <div className="image-frame card-3d p-0">
                <img
                  src={hero.image || basics.avatarUrl}
                  alt={hero.name}
                  className="h-[420px] w-full object-cover object-top"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="about" className="section">
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
                <p>Education: Bachelor of Engineering (2024-2028)</p>
                <p>Language: English, Hindi</p>
                <p>Interest: Traveling, Coding</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="skills" className="section">
        <div className="mx-auto max-w-6xl px-6">
          <p className="section-subtitle">Skills</p>
          <h2 className="section-title">Technical proficiency</h2>
          <p className="mt-3 text-sm text-slate-300">
            A focused toolkit for building polished interfaces and reliable full stack systems.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {skills.map((skill) => {
              const normalizedName = skill.name.toLowerCase();
              const Icon = skillIcons[normalizedName];
              const accent = skillColors[normalizedName] || "text-amber-300";
              const skillUrl = skillLinks[normalizedName];
              return (
              <div
                key={skill.name}
                className="card card-3d p-6 transition duration-200 hover:-translate-y-0.5 hover:border-amber-300/60"
              >
                {skillUrl ? (
                  <a
                    href={skillUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4"
                    title={`Open ${skill.name} official site`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                      {Icon ? <Icon className={`text-2xl ${accent}`} /> : null}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-semibold">{skill.name}</p>
                        <span className="text-sm text-slate-400">{skill.level}%</span>
                      </div>
                      <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                        <div
                          className="h-2 rounded-full bg-amber-400"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                      {Icon ? <Icon className={`text-2xl ${accent}`} /> : null}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-semibold">{skill.name}</p>
                        <span className="text-sm text-slate-400">{skill.level}%</span>
                      </div>
                      <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                        <div
                          className="h-2 rounded-full bg-amber-400"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="experience" className="section">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-2">
          <div>
            <p className="section-subtitle">Experience</p>
            <h2 className="section-title">What I have done</h2>
            <div className="mt-8 space-y-4">
              {experience.map((item) => (
                <div key={`${item.title}-${item.company}`} className="card card-3d p-6">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>
                      {item.start} {item.end ? `- ${item.end}` : ""}
                    </span>
                    <span>{item.location}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-slate-300">{renderOrganization(item.company)}</p>
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
                    {item.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="section-subtitle">Education</p>
            <h2 className="section-title">Where I learned</h2>
            <div className="mt-8 space-y-4">
              {education.map((item) => (
                <div key={item.degree} className="card card-3d p-6">
                  <p className="text-sm text-slate-400">
                    {item.start} - {item.end}
                  </p>
                  <h3 className="mt-3 text-lg font-semibold">{item.degree}</h3>
                  <p className="text-sm text-slate-300">
                    {renderOrganization(item.institution)}
                  </p>
                  <p className="mt-3 text-sm text-amber-200">{item.grade}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="section">
        <div className="mx-auto max-w-6xl px-6">
          <p className="section-subtitle">Projects</p>
          <h2 className="section-title">Selected work</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {projects.map((project) => {
              const slug = getSlug(project);
              return (
                <div
                  key={project.name}
                  className="card card-3d overflow-hidden cursor-pointer transition hover:border-white/20"
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
                  {project.image && (
                    <img
                      src={project.image}
                      alt={project.name}
                      className="h-64 w-full object-cover transition-transform duration-500 ease-out hover:scale-[1.02]"
                    />
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

      <section id="achievements" className="section">
        <div className="mx-auto max-w-6xl px-6">
          <p className="section-subtitle">Achievements</p>
          <h2 className="section-title">Certifications & milestones</h2>
          <p className="mt-3 text-sm text-slate-300">
            A curated list of certifications, awards, and achievements.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {(achievements || []).length > 0 ? (
              achievements.map((item) => (
                <div key={item.title} className="card card-3d p-6">
                  {item.issuer && (
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      {item.issuer}
                    </p>
                  )}
                  <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                  {item.summary && (
                    <p className="mt-3 text-sm text-slate-300">{item.summary}</p>
                  )}
                  {item.coverImage && (
                    <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  )}
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      to={`/achievements/${item.slug || item.title.toLowerCase().replace(/\s+/g, "-")}`}
                      className="btn-primary"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))
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

      <section className="section">
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

      <section id="hire-me" className="section">
        <div className="mx-auto max-w-6xl px-6">
          <p className="section-subtitle">Hire Me</p>
          <div className="card card-3d p-8 md:p-10">
            <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
              <div>
                <h2 className="text-3xl font-semibold">Ready to join your team</h2>
                <p className="mt-3 text-sm text-slate-300">
                  I am looking for internship and entry-level full stack opportunities where I can
                  build scalable products, collaborate with strong teams, and keep learning fast.
                </p>
                <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
                  <span className="chip">{availability}</span>
                  <span className="chip">{basics.location}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="card card-3d p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Email</p>
                  <p className="mt-2 text-sm text-slate-200">{basics.email}</p>
                </div>
                <div className="card card-3d p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Phone</p>
                  <p className="mt-2 text-sm text-slate-200">{basics.phone}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {mailtoLink && (
                    <a href={mailtoLink} className="btn-primary">
                      Email Me
                    </a>
                  )}
                  <a href={basics.resumeUrl} className="btn-secondary">
                    Download Resume
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
