import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import { countVisitSession, fetchPortfolio, fetchVisitCount } from "./api";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import SeoManager from "./components/SeoManager.jsx";
import ResumeModal from "./components/ResumeModal.jsx";
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
        "MongoDB",
        "Gemini flash APIs"
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
      "name": "Curriculum Management System",
      "slug": "curriculum-management-system",
      "description": "Institutional academic workflow & curriculum management platform with 4-tier scoped RBAC, multi-stage syllabus approvals, and NBA/NAAC PO-PSO compliance tracking.",
      "highlights": [
        "Production deployment across 12+ Schools, 30+ Departments, and 6,500+ Subjects at DBUU",
        "4-tier scoped authorization tree: SuperAdmin -> Dean (School) -> HOD (Dept/Year) -> Faculty (Subject)",
        "Multi-stage approval state machine: Draft -> Submitted -> HOD Review -> Dean Approval -> Published",
        "Automated PO/PSO document mapping, revision history logs, and role-based analytical dashboards"
      ],
      "tech": [
        "React 19",
        "TypeScript",
        "Node.js",
        "Express 5",
        "MongoDB",
        "Cloudinary",
        "JWT",
        "Tailwind CSS",
        "Vite"
      ],
      "image": "/images/cms_dbuu.png",
      "links": {
        "demo": "https://cms.dbuu.ac.in/",
        "repo": "https://github.com/Syllabus2-0/schoolsofdbuu"
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
        "demo": "",
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
  "caseStudies": [
    {
      "slug": "eventory-concurrency",
      "project": "Eventory",
      "title": "Zero-Overbooking Concurrency: Distributed Mutexes with Redis Lua & Kafka",
      "tagline": "Handling 100,000+ requests/sec on single seats without database race conditions or deadlocks.",
      "metrics": ["100k req/s Scale", "Zero Overbooking Guarantee", "500 Concurrent Test Burst", "5-Min TTL Mutex"],
      "tags": ["Redis", "Lua Scripts", "Kafka", "Socket.IO", "Node.js", "Docker"],
      "problem": "When popular events go on sale, thousands of users attempt to purchase the exact same seat at the exact same millisecond. Traditional check-then-update SQL/MongoDB queries create race conditions where multiple requests pass the availability check before any write is committed, leading to catastrophic double bookings.",
      "architecture": [
        "Atomic Single-Threaded Locking: Custom Lua script executes in Redis memory atomically, checking existence and setting user-bound key in one operation without CPU context switching.",
        "Automatic Deadlock Prevention: Each lock is issued with a 5-minute TTL. If a user abandons payment or drops connection, the seat automatically returns to available status without manual cleanup.",
        "Decoupled Async Message Queue: Confirmed bookings emit a Kafka 'booking.created' event for background payment consumer workers, preventing HTTP request timeout bottlenecks.",
        "Real-Time WebSocket Grid Sync: Socket.IO rooms broadcast 'seat_locked', 'seat_processing', and 'seat_booked' events immediately to all connected browsers."
      ],
      "security": "Distributed locking prevents cross-server race conditions across multiple Node.js instances behind load balancers. Idempotent payment webhooks ensure transactions are processed safely.",
      "takeaway": "Demonstrates production distributed systems engineering: combining fast in-memory locking (Redis), event streaming (Kafka), and persistent storage (MongoDB)."
    },
    {
      "slug": "adhyan-ai-architecture",
      "project": "ADHYAN.AI",
      "title": "Smart Classroom AI: Source-Grounded OCR Grading, Device Binding & Rotating HMAC Tokens",
      "tagline": "End-to-end AI assessment engine automating assessment generation, subjective grading, and anti-proxy attendance.",
      "metrics": ["Gemini 2.5 Flash Pipeline", "70% Legibility OCR Guard", "Slot-Based Device UUIDs", "WebSocket Rotating HMAC QR"],
      "tags": ["Gemini 2.5 Flash", "RAG", "GridFS", "WebSockets", "HMAC-SHA256", "React 18"],
      "problem": "Digital education platforms struggle with three massive bottlenecks: teacher burnout from manual grading, unreliable hallucinating AI evaluators lacking source grounding, and rampant cheating (credential sharing & QR screenshot attendance proxies).",
      "architecture": [
        "RAG-Grounded Assessment Engine: Extracts structured content from uploaded PDF lecture notes via Gemini 2.5 Flash, generating tiered MCQs and subjective test papers strictly constrained to source material.",
        "Physical Exam OCR & Legibility Guard: Evaluates scanned multi-page handwritten student answer sheets against rubric schemes. Calculates handwriting clarity (0-100%); scores below 70% automatically trigger human review flags.",
        "Semantic Question Intent Mapping: Pairs unnumbered student answers to rubric questions by intent analysis and keyword depth, awarding partial credit fairly.",
        "Multi-Key Resilient Failover: Automatically rotates across active Gemini API keys with backoff strategies to prevent rate limit interruptions during heavy batch grading."
      ],
      "security": "Anti-Proxy Device Binding restricts each student to 1 mobile and 1 desktop UUID token. Live attendance uses rotating HMAC-SHA256 tokens refreshed over WebSockets every few seconds to eliminate QR screenshot sharing.",
      "takeaway": "Shows advanced applied AI system design: source grounding to prevent hallucinations, OCR quality controls, and multi-layered hardware/cryptographic anti-cheat mechanisms."
    },
    {
      "slug": "curriculum-management-system",
      "project": "Curriculum Management System (CMS)",
      "title": "Enterprise Academic Workflow: 4-Tier Scoped RBAC & Multi-Stage State Machines",
      "tagline": "Institutional academic workflow platform managing curriculum creation, NBA/NAAC PO-PSO compliance, and multi-tier approval queues.",
      "metrics": ["12+ Schools Live", "30+ Departments", "6,500+ Subjects Managed", "4-Tier Scoped RBAC"],
      "tags": ["React 19", "TypeScript", "Node.js", "Express 5", "MongoDB", "Cloudinary", "JWT"],
      "problem": "Universities with multiple schools and departments struggle with fragmented syllabus drafting, decentralized approval bottlenecks, and data leakage across unauthorized faculty or department scopes during accreditation audits (NBA/NAAC).",
      "architecture": [
        "Hierarchical Academic Domain Model: Enforces strict encapsulation across School -> Department -> Program -> Subject.",
        "4-Tier Database-Enforced RBAC: SuperAdmin (global), Dean (school-scoped), HOD (department & assigned year-scoped), and Faculty (assigned subject-scoped). Role checks are enforced at controller and query levels.",
        "Multi-Stage Approval State Machine: Governs the syllabus lifecycle: Draft -> Submitted -> HOD Review (Approve/Reject) -> Dean Final Stage (Approve/Publish or Reject) with revision history.",
        "PO/PSO Outcome Mapping & Cloudinary Storage: Centralized outcome-based education document repository with versioned PDF storage."
      ],
      "security": "Scope isolation prevents cross-department privilege escalation. Immutable comment logs and timestamped digital approval records satisfy institutional audit requirements.",
      "takeaway": "Proves capability to architect and deploy real-world enterprise SaaS: multi-tenant access control, strict compliance modeling, and production university adoption."
    },
    {
      "slug": "ecocommute-ml-routing",
      "project": "EcoCommute",
      "title": "Multimodal Routing: Predicting Carbon Footprint & Traffic Delays with Flask ML",
      "tagline": "AI-enabled sustainable transport planner optimizing for low-emission and time-efficient multimodal routes.",
      "metrics": ["1st Place Hackathon Winner", "Multimodal Optimization", "Real-Time Carbon API", "Flask ML Microservice"],
      "tags": ["Python", "Flask", "scikit-learn", "React", "Leaflet", "OpenRouteService", "MongoDB"],
      "problem": "Standard navigation engines optimize exclusively for time or distance, ignoring vehicle emission intensity, atmospheric weather hazards, and environmental impact.",
      "architecture": [
        "Composite Geospatial Routing Engine: Integrates OpenRouteService heuristics with live OpenWeather data to calculate multimodal travel alternatives (transit, carpooling, cycling).",
        "Carbon Footprint & Eco-Score Engine: Connects to Carbon Interface APIs to estimate gram-per-kilometer emissions saved per route.",
        "Predictive Traffic ML Microservice: Python Flask service with scikit-learn models predicting traffic congestion delays based on historical and temporal patterns.",
        "Interactive Leaflet Visualizer: Real-time map rendering with custom color-coded eco-efficiency polylines."
      ],
      "security": "Containerized microservice architecture isolating Python ML workloads from the Node.js API gateway using Docker.",
      "takeaway": "Demonstrates full-stack polyglot development: combining Node.js backend services with Python machine learning microservices and interactive mapping."
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
    caseStudies: asArray(source.caseStudies || fallbackData.caseStudies).map((cs) => ({
      ...asObject(cs),
      metrics: asArray(cs?.metrics),
      tags: asArray(cs?.tags),
      architecture: asArray(cs?.architecture)
    })),
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
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

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
        <Header
          hero={portfolio.hero}
          basics={portfolio.basics}
          onOpenResume={() => setIsResumeModalOpen(true)}
        />
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
        <ResumeModal
          isOpen={isResumeModalOpen}
          onClose={() => setIsResumeModalOpen(false)}
          resumeUrl={portfolio.basics?.resumeUrl}
        />
      </div>
    </BrowserRouter>
  );
}
