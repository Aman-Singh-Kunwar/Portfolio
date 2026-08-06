import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import { countVisitSession, fetchPortfolio, fetchVisitCount } from "./api";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import SeoManager from "./components/SeoManager.jsx";
import Home from "./pages/Home.jsx";

const ProjectDetail = lazy(() => import("./pages/ProjectDetail.jsx"));
const AchievementDetail = lazy(() => import("./pages/AchievementDetail.jsx"));
const PORTFOLIO_CACHE_KEY = "portfolio-cache-v1";
const VISIT_SESSION_KEY = "portfolio-visit-session-id";
const VISIT_COUNTED_SESSION_ID_KEY = "portfolio-visit-counted-session-id";
const VISIT_RETRY_DELAYS = [0, 5000, 15000, 30000, 60000];

const fallbackData = {
  "meta": {
    "title": "Aman Singh Kunwar | Full Stack Developer",
    "description": "Full stack portfolio built with React, Node.js, MongoDB, and Tailwind CSS."
  },
  "hero": {
    "greeting": "Hello!",
    "name": "Aman Singh Kunwar",
    "roles": [
      "Full Stack Developer",
      "MERN Stack Engineer",
      "Frontend and API Builder"
    ],
    "tagline": "I build reliable, scalable web products with clean UX and robust APIs.",
    "ctaPrimary": "View Projects",
    "ctaSecondary": "Download Resume",
    "image": "/images/me.jpg"
  },
  "basics": {
    "role": "Full Stack Developer",
    "location": "Dehradun, Uttarakhand, India",
    "email": "amansinghkunwar07@gmail.com",
    "phone": "+91 7983932346",
    "resumeUrl": "/cv.pdf",
    "social": [
      {
        "label": "LinkedIn",
        "url": "https://www.linkedin.com/in/aman-singh-kunwar-b99b62322/",
        "icon": "linkedin"
      },
      {
        "label": "GitHub",
        "url": "https://github.com/Aman-Singh-Kunwar",
        "icon": "github"
      }
    ],
    "availability": "Open to internships and junior full stack roles",
    "avatarUrl": "/images/me.jpg"
  },
  "about": {
    "summary": "Computer Science student focused on building modern full stack applications. I enjoy creating fast, accessible UIs backed by clean APIs and well structured data models.",
    "highlights": [
      "Hands-on experience with React, Node.js, PHP, MySQL, WordPress, and MongoDB",
      "Strong foundation in algorithms, data structures, and system design",
      "Interested in cloud certifications and scalable architecture"
    ]
  },
  "techStack": [
    "Node.js",
    "React",
    "MongoDB",
    "Express",
    "PHP",
    "MySQL",
    "WordPress",
    "Tailwind CSS",
    "Vite",
    "Mongoose",
    "GitHub"
  ],
  "skills": [
    {
      "name": "React",
      "level": 90,
      "category": "Frontend"
    },
    {
      "name": "Node.js",
      "level": 85,
      "category": "Backend & DB"
    },
    {
      "name": "MongoDB",
      "level": 80,
      "category": "Backend & DB"
    },
    {
      "name": "PHP",
      "level": 80,
      "category": "Backend & DB"
    },
    {
      "name": "MySQL",
      "level": 80,
      "category": "Backend & DB"
    },
    {
      "name": "WordPress",
      "level": 85,
      "category": "CMS & Core"
    },
    {
      "name": "JavaScript",
      "level": 75,
      "category": "Frontend"
    },
    {
      "name": "Tailwind CSS",
      "level": 85,
      "category": "Frontend"
    },
    {
      "name": "Python",
      "level": 80,
      "category": "CMS & Core"
    },
    {
      "name": "Java",
      "level": 75,
      "category": "CMS & Core"
    }
  ],
  "experience": [
    {
      "title": "Web Development Intern",
      "company": "Evon Technologies",
      "location": "Dehradun, Uttarakhand",
      "start": "June 2026",
      "end": "August 2026",
      "bullets": [
        "Contributed to full stack development for live government and client web platforms, including USAME",
        "Built responsive UI components, customized WordPress themes, and integrated secure payment processing.",
        "Performed end-to-end UI testing, QA, bug fixing, and collaborated with senior developers on deployment updates."
      ],
      "tech": ["React", "PHP", "WordPress", "MySQL"]
    },
    {
      "title": "Social Internship",
      "company": "Aasraa Trust",
      "location": "Dehradun, Uttarakhand",
      "start": "July 2025",
      "end": "July 2025",
      "bullets": [
        "Volunteer educator and mentor for Class 11 and 12 students",
        "Collaborated with teachers to build a positive learning environment",
        "Provided one on one guidance for study plans and career goals"
      ],
      "tech": ["Teaching", "Mentorship", "Chemistry"]
    }
  ],
  "education": [
    {
      "degree": "Bachelor of Technology (CSE)",
      "institution": "Dev Bhoomi Uttarakhand University, Dehradun",
      "start": "2024",
      "end": "2028",
      "grade": "CGPA: 9.29"
    },
    {
      "degree": "Higher Secondary School (12th Board)",
      "institution": "Shree Goverdhan Saraswati Vidya Mandir Inter College Dharampur, Dehradun",
      "start": "2022",
      "end": "2023",
      "grade": "Percentage: 93.6 (18th Rank in State Board)"
    },
    {
      "degree": "High School (10th Board)",
      "institution": "Shree Goverdhan Saraswati Vidya Mandir Inter College Dharampur, Dehradun",
      "start": "2020",
      "end": "2021",
      "grade": "Percentage: 96.2"
    }
  ],
  "projects": [
    {
      "name": "ADHYAN.AI",
      "slug": "adhyan-ai",
      "description": "AI-powered smart classroom platform.",
      "highlights": [
        "Dedicated student and teacher frontends",
        "Backend service and supporting documentation included",
        "Live demo hosted online"
      ],
      "tech": [
        "React.js (18)",
        "Tailwind CSS",
        "Vite",
        "Node.js (24)",
        "Express.js",
        "MongoDB Atlas",
        "Gemini-2.5-flash APIs"
      ],
      "image": "/images/adhyanai.jpg",
      "links": {
        "demo": "https://adhyan-ai.onrender.com/",
        "repo": "https://github.com/HacktheWinter/ADHYAN.AI"
      }
    },
    {
      "name": "Portfolio",
      "slug": "portfolio",
      "description": "Personal portfolio website to showcase projects, skills, and resume.",
      "highlights": [
        "Full stack portfolio with editable admin panel and live data sync",
        "Responsive UI with dedicated project detail pages",
        "Reusable data-driven sections for skills, experience, and projects"
      ],
      "tech": [
        "React",
        "Vite",
        "Tailwind CSS",
        "Node.js",
        "Express",
        "MongoDB"
      ],
      "image": "/images/portfolio.jpg",
      "links": {
        "demo": "https://aman-singh-kunwar-portfolio1.onrender.com/",
        "repo": "https://github.com/Aman-Singh-Kunwar/Portfolio"
      }
    },
    {
      "name": "EcoCommute",
      "slug": "ecocommute",
      "description": "AI-enabled sustainable transport planner that helps users find eco-friendly and time-efficient routes.",
      "highlights": [
        "Integrates weather, emissions, and live traffic data to recommend optimized routes",
        "Eco-route optimization with carbon emission tracking",
        "Interactive map experience for route visualization"
      ],
      "tech": [
        "React",
        "Tailwind CSS",
        "Node.js",
        "MongoDB",
        "Flask",
        "Leaflet"
      ],
      "image": "/images/ecocommute.jpg",
      "links": {
        "demo": "https://ecocommute-frontend.onrender.com/",
        "repo": "https://github.com/Aman-Singh-Kunwar/EcoCommute"
      }
    },
    {
      "name": "Eventory",
      "slug": "eventory",
      "description": "High-concurrency event ticketing platform built to handle flash-sale traffic without double booking.",
      "highlights": [
        "Redis-based distributed locking with Lua scripts for seat guarantees",
        "Event-driven architecture with Kafka and real-time updates via Socket.IO",
        "React frontend with a responsive, mobile-first UI"
      ],
      "tech": [
        "Node.js",
        "React",
        "Redis",
        "MongoDB",
        "Kafka",
        "Socket.IO",
        "Tailwind CSS",
        "Docker"
      ],
      "image": "/images/eventory.jpg",
      "links": {
        "demo": "",
        "repo": "https://github.com/Aman-Singh-Kunwar/Eventory"
      }
    },
    {
      "name": "Simon Say Game",
      "slug": "simon-say-game",
      "description": "Interactive Simon Says memory game with enhanced gameplay features.",
      "highlights": [
        "Difficulty increases as the game progresses",
        "Sound effects for each button",
        "Score tracking for best performance"
      ],
      "tech": [
        "HTML",
        "CSS",
        "JavaScript"
      ],
      "image": "/images/simonsaygame.jpg",
      "links": {
        "demo": "https://aman-singh-kunwar.github.io/Simon-say-game/",
        "repo": "https://github.com/Aman-Singh-Kunwar/Simon-say-game"
      }
    }
  ],
  "stats": {
    "achievements": 5,
    "projects": 5
  },
  "achievements": [
    {
      "title": "HacktheWinter National Level Hackathon",
      "slug": "hackthewinter-national-level-hackathon",
      "issuer": "GEHU Bhimtal X WeCode",
      "date": "23-01-2026",
      "summary": "Rank 47 out of 403 teams and shortlisted for the final round.",
      "description": [
        "Participated in the National Level Hack The Winter 2026 (GEHU Bhimtal + WeCode) with 3 rounds: Online Round 1 (25-30 Dec 2025), Online Round 2 (9-11 Jan 2026), and a 24-hour offline final on 22-23 Jan 2026.",
        "Qualified from 403 teams and secured Rank 47 with team The Code Blooded.",
        "Built ADHYAN.AI for online rounds and Flash Sale Concurrency Guard for the final round, strengthening teamwork and problem-solving skills."
      ],
      "link": "https://www.linkedin.com/posts/amansinghkunwar_hackthewinter-nationallevelhackathon-studentdeveloper-activity-7423680424150814720-Pn83",
      "coverImage": "/images/hackthewinter.jpg",
      "photos": [
        "/images/hackthewinter.jpg",
        "/images/participation.jpg",
        "/images/shortlisting.jpg",
        "/images/swags.jpg"
      ]
    },
    {
      "title": "Developathon Surge x DBUU",
      "slug": "developathon-surge-dbuu",
      "issuer": "DBUU X DEV TO DSA",
      "date": "15-10-2025",
      "summary": "Secured 1st position in the National Level Hackathon.",
      "description": [
        "Secured First Position in the National Level development-based hackathon \"Developathon Surge x DBUU.\"",
        "Competed against 50+ teams in a 24-hour hackathon and reached the final round.",
        "Built the EcoCommute project focused on sustainable, optimized commuting, and collaborated with Team Code Blooded."
      ],
      "link": "https://www.linkedin.com/posts/amansinghkunwar_hackathon-innovation-teamwork-activity-7386762121180508164-HEcx",
      "coverImage": "/images/developathon.jpg",
      "photos": [
        "/images/developathon.jpg",
        "/images/presentation.jpg",
        "/images/prizedestribution.jpg",
        "/images/moments.jpg"
      ]
    },
    {
      "title": "Debug Arena",
      "slug": "debug-arena",
      "issuer": "EVISPHERE TECH",
      "date": "12-10-2025",
      "summary": "Won the bug-finding challenge.",
      "description": [
        "Won the Debug Arena (TechBug Challenge) by Evi Sphere Tech - a no-code UI/UX bug-spotting event.",
        "Online challenge held on 12 Oct 2025 (7-8 PM) with free entry and certificates.",
        "Spotted 48 bugs across 4 pages in Round 1 and 20+ design issues on a meme site in Round 2, earning a 3-month Spotify Premium prize."
      ],
      "link": "https://www.linkedin.com/posts/amansinghkunwar_techbugchallenge-evispheretech-debugging-activity-7385557813349031936-HAGF",
      "coverImage": "/images/debuging.jpg",
      "photos": [
        "/images/debuging.jpg"
      ]
    },
    {
      "title": "Web Development Internship - Evon Technologies",
      "slug": "evon-technologies-web-development-internship",
      "issuer": "EVON TECHNOLOGIES",
      "date": "August 2026",
      "summary": "Web Development Internship completion certificate at Evon Technologies.",
      "description": [
        "Contributed to front-end and back-end development for live government and client web platforms.",
        "Developed responsive UI components and implemented feature enhancements across both client-facing site and admin panel.",
        "Customized WordPress themes and plugins to meet project requirements.",
        "Integrated the ICICI Bank Payment Gateway for secure online payment processing.",
        "Performed UI testing, bug fixing, quality assurance, and cross-browser compatibility testing.",
        "Collaborated with senior developers to implement new features, resolve issues, and deploy project updates.",
        "Contributed to the development and maintenance of the Uttarakhand State Authority for Minority Education (USAME) website: https://usame.uk.gov.in/"
      ],
      "link": "https://usame.uk.gov.in/",
      "coverImage": "/images/web development internship certificate.jpeg",
      "photos": [
        "/images/web development internship certificate.jpeg"
      ]
    },
    {
      "title": "Aasraa Trust Social Internship",
      "slug": "aasraa-trust-social-internship",
      "issuer": "AASRAA TRUST",
      "date": "31-07-2025",
      "summary": "Social internship experience at Aasraa Trust.",
      "description": [
        "Completed a 1-month social internship (1-31 July 2025) at Aasraa Trust, Dehradun.",
        "Taught Chemistry to Class 11 & 12 students under the BANNU Aasraa Project, guided learners in Hindi and English, and resolved doubts using relatable examples.",
        "Built communication, teaching, and time-management skills while contributing to education for underprivileged students."
      ],
      "link": "https://www.linkedin.com/posts/amansinghkunwar_aasraatrust-socialinternship-volunteering-activity-7358737577656348672-vMKo",
      "coverImage": "/images/socialInternship.jpg",
      "photos": [
        "/images/socialInternship.jpg",
        "/images/aasraatrust.jpg",
        "/images/class12.jpg",
        "/images/class11.jpg"
      ]
    }
  ],
  "contact": {
    "address": "Police Family Quarters, Raipur Road, Dehradun",
    "email": "amansinghkunwar07@gmail.com",
    "phone": "+91 7983932346"
  }
};

function getCachedPortfolio() {
  try {
    const raw = localStorage.getItem(PORTFOLIO_CACHE_KEY);
    return raw ? normalizePortfolio(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function asObject(value, fallback = {}) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizePortfolio(data) {
  const source = asObject(data, fallbackData);
  const hero = { ...fallbackData.hero, ...asObject(source.hero) };
  const basics = { ...fallbackData.basics, ...asObject(source.basics) };
  const about = { ...fallbackData.about, ...asObject(source.about) };
  const projects = asArray(source.projects).map((project) => ({
    ...asObject(project),
    highlights: asArray(project?.highlights),
    tech: asArray(project?.tech),
    links: asObject(project?.links)
  }));
  const achievements = asArray(source.achievements).map((achievement) => ({
    ...asObject(achievement),
    photos: asArray(achievement?.photos)
  }));

  return {
    ...fallbackData,
    ...source,
    meta: { ...fallbackData.meta, ...asObject(source.meta) },
    hero: {
      ...hero,
      roles: asArray(hero.roles)
    },
    basics: {
      ...basics,
      social: asArray(basics.social)
    },
    about: {
      ...about,
      highlights: asArray(about.highlights)
    },
    skills: asArray(source.skills),
    techStack: asArray(source.techStack),
    experience: asArray(source.experience).map((item) => ({
      ...asObject(item),
      bullets: asArray(item?.bullets)
    })),
    education: asArray(source.education),
    projects,
    achievements,
    stats: {
      ...asObject(source.stats),
      projects: projects.length,
      achievements: achievements.length
    },
    contact: { ...fallbackData.contact, ...asObject(source.contact) }
  };
}

const VISIT_SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

function getVisitSessionId() {
  const now = Date.now();
  try {
    const raw = localStorage.getItem(VISIT_SESSION_KEY);
    if (raw) {
      const { id, expiresAt } = JSON.parse(raw);
      if (expiresAt > now) {
        localStorage.setItem(VISIT_SESSION_KEY, JSON.stringify({
          id,
          expiresAt: now + VISIT_SESSION_TIMEOUT_MS
        }));
        return id;
      }
    }
  } catch {
    // Proceed to create a new session
  }

  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${now}-${Math.random().toString(36).slice(2)}`;

  try {
    localStorage.setItem(VISIT_SESSION_KEY, JSON.stringify({
      id,
      expiresAt: now + VISIT_SESSION_TIMEOUT_MS
    }));
  } catch {
    // Ignore localStorage failures
  }

  return id;
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export default function App() {
  const [portfolio, setPortfolio] = useState(() => getCachedPortfolio() || normalizePortfolio(fallbackData));
  const [status, setStatus] = useState(() => (getCachedPortfolio() ? "ready" : "loading"));
  const [visitCount, setVisitCount] = useState(null);

  useEffect(() => {
    let active = true;

    fetchPortfolio()
      .then((data) => {
        if (active) {
          const normalized = normalizePortfolio(data);
          setPortfolio(normalized);
          setStatus("ready");
          try {
            localStorage.setItem(PORTFOLIO_CACHE_KEY, JSON.stringify(normalized));
          } catch {
            // Ignore storage failures and continue with in-memory data.
          }
        }
      })
      .catch(() => {
        if (active) {
          setStatus("offline");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function syncVisitCount() {
      const sessionId = getVisitSessionId();
      const alreadyCounted = localStorage.getItem(VISIT_COUNTED_SESSION_ID_KEY) === sessionId;

      for (const delay of VISIT_RETRY_DELAYS) {
        if (!active) return;

        if (delay > 0) {
          await wait(delay);
          if (!active) return;
        }

        try {
          if (alreadyCounted) {
            const data = await fetchVisitCount({ timeoutMs: 6000 });
            if (active) setVisitCount(data.count);
            return;
          }

          const data = await countVisitSession(sessionId, { timeoutMs: 6000 });
          localStorage.setItem(VISIT_COUNTED_SESSION_ID_KEY, sessionId);
          if (active) setVisitCount(data.count);
          return;
        } catch {
          // Retry quietly. This protects visitor counting from free-host cold starts.
        }
      }
    }

    syncVisitCount();

    return () => {
      active = false;
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <SeoManager portfolio={portfolio} />
        <Header hero={portfolio.hero} basics={portfolio.basics} />
        <main>
          <Suspense
            fallback={
              <section className="section">
                <div className="mx-auto max-w-4xl px-6">
                  <div className="card p-8 text-center text-sm text-slate-300">
                    Loading details...
                  </div>
                </div>
              </section>
            }
          >
            <Routes>
              <Route path="/" element={<Home portfolio={portfolio} status={status} />} />
              <Route path="/projects/:slug" element={<ProjectDetail portfolio={portfolio} />} />
              <Route
                path="/achievements/:slug"
                element={<AchievementDetail portfolio={portfolio} />}
              />
            </Routes>
          </Suspense>
        </main>
        <Footer visitCount={visitCount} />
      </div>
    </BrowserRouter>
  );
}
