import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchPortfolio } from "./api";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import Home from "./pages/Home.jsx";
import ProjectDetail from "./pages/ProjectDetail.jsx";
import AchievementDetail from "./pages/AchievementDetail.jsx";

const fallbackData = {
  meta: {
    title: "Aman Singh Kunwar | Full Stack Developer",
    description: "Full stack portfolio built with React, Node.js, MongoDB, and Tailwind CSS."
  },
  hero: {
    greeting: "Hello!",
    name: "Aman Singh Kunwar",
    roles: ["Full Stack Developer", "MERN Stack Engineer", "Frontend and API Builder"],
    tagline: "I build reliable, scalable web products with clean UX and robust APIs.",
    image: "/images/me.jpg",
    ctaPrimary: "View Projects",
    ctaSecondary: "Download Resume"
  },
  basics: {
    role: "Full Stack Developer",
    location: "Dehradun, Uttarakhand, India",
    email: "amansinghkunwar07@gmail.com",
    phone: "+91 7983932346",
    resumeUrl: "/cv.pdf",
    availability: "Open to internships and junior full stack roles",
    avatarUrl: "/images/me.jpg",
    social: [
      {
        label: "LinkedIn",
        url: "https://www.linkedin.com/in/aman-singh-kunwar-b99b62322/",
        icon: "linkedin"
      },
      {
        label: "GitHub",
        url: "https://github.com/Aman-Singh-Kunwar",
        icon: "github"
      }
    ]
  },
  about: {
    summary:
      "Computer Science student focused on building modern full stack applications. I enjoy creating fast, accessible UIs backed by clean APIs and well structured data models.",
    highlights: [
      "Hands on experience with React, Node.js, Express, and MongoDB",
      "Strong foundation in algorithms, data structures, and system design",
      "Interested in cloud certifications and scalable architecture"
    ]
  },
  skills: [
    { name: "JavaScript", level: 90 },
    { name: "React", level: 90 },
    { name: "Node.js", level: 85 },
    { name: "MongoDB", level: 80 },
    { name: "Tailwind CSS", level: 85 },
    { name: "Python", level: 80 },
    { name: "C", level: 70 }
  ],
  techStack: [
    "Node.js",
    "React",
    "MongoDB",
    "Express",
    "Tailwind CSS",
    "Vite",
    "Mongoose",
    "GitHub"
  ],
  experience: [
    {
      title: "Social Internship",
      company: "Aasraa Trust",
      location: "Dehradun, Uttarakhand",
      start: "July 2025",
      end: "July 2025",
      bullets: [
        "Volunteer educator and mentor for Class 11 and 12 students",
        "Collaborated with teachers to build a positive learning environment",
        "Provided one on one guidance for study plans and career goals"
      ]
    },
    {
      title: "Looking for Internship",
      company: "Open to opportunities",
      location: "Remote or On site",
      start: "Present",
      end: "",
      bullets: [
        "Available for MERN stack development roles",
        "Interested in product teams focused on real world impact"
      ]
    }
  ],
  education: [
    {
      degree: "Bachelor of Technology (CSE)",
      institution: "Dev Bhoomi Uttarakhand University, Dehradun",
      start: "2024",
      end: "2028",
      grade: "CGPA: 9.4 (First class distinction)"
    },
    {
      degree: "Higher Secondary School",
      institution:
        "Shree Goverdhan Saraswati Vidya Mandir Inter College Dharampur, Dehradun",
      start: "2022",
      end: "2023",
      grade: "Percentage: 93.6 (18th Rank in Uttarakhand Board)"
    }
  ],
  projects: [
    {
      name: "EcoCommute",
      slug: "ecocommute",
      description:
        "AI-enabled sustainable transport planner that helps users find eco-friendly and time-efficient routes.",
      highlights: [
        "Integrates weather, emissions, and live traffic data to recommend optimized routes",
        "Eco-route optimization with carbon emission tracking",
        "Interactive map experience for route visualization"
      ],
      tech: ["React", "Tailwind CSS", "Node.js", "MongoDB", "Flask", "Leaflet"],
      image: "/images/project1.jpg",
      links: {
        demo: "https://ecocommute-frontend.onrender.com/",
        repo: "https://github.com/Aman-Singh-Kunwar/EcoCommute"
      }
    },
    {
      name: "Eventory",
      slug: "eventory",
      description:
        "High-concurrency event ticketing platform built to handle flash-sale traffic without double booking.",
      highlights: [
        "Redis-based distributed locking with Lua scripts for seat guarantees",
        "Event-driven architecture with Kafka and real-time updates via Socket.IO",
        "React frontend with a responsive, mobile-first UI"
      ],
      tech: ["Node.js", "React", "Redis", "MongoDB", "Kafka", "Socket.IO", "Tailwind CSS", "Docker"],
      image: "/images/project2.jpg",
      links: {
        demo: "",
        repo: "https://github.com/Aman-Singh-Kunwar/Eventory"
      }
    },
    {
      name: "Portfolio",
      slug: "portfolio",
      description: "Personal portfolio website to showcase projects, skills, and resume.",
      highlights: [
        "Clean, responsive layout",
        "Projects, skills, and contact sections",
        "Includes a downloadable resume"
      ],
      tech: ["HTML", "CSS", "JavaScript"],
      image: "",
      links: {
        demo: "https://aman-singh-kunwar.github.io/Portfolio/",
        repo: "https://github.com/Aman-Singh-Kunwar/Portfolio"
      }
    },
    {
      name: "Simon Say Game",
      slug: "simon-say-game",
      description: "Interactive Simon Says memory game with enhanced gameplay features.",
      highlights: [
        "Difficulty increases as the game progresses",
        "Sound effects for each button",
        "Score tracking for best performance"
      ],
      tech: ["HTML", "CSS", "JavaScript"],
      image: "",
      links: {
        demo: "https://aman-singh-kunwar.github.io/Simon-say-game/",
        repo: "https://github.com/Aman-Singh-Kunwar/Simon-say-game"
      }
    },
    {
      name: "ADHYAN.AI",
      slug: "adhyan-ai",
      description: "AI-powered smart classroom platform.",
      highlights: [
        "Dedicated student and teacher frontends",
        "Backend service and supporting documentation included",
        "Live demo hosted online"
      ],
      tech: ["JavaScript", "AI"],
      image: "",
      links: {
        demo: "https://adhyan-ai.onrender.com/",
        repo: "https://github.com/HacktheWinter/ADHYAN.AI"
      }
    }
  ],
  stats: {
    achievements: 5,
    projects: 5
  },
  achievements: [
    {
      title: "HacktheWinter National Level Hackathon",
      slug: "hackthewinter-national-level-hackathon",
      issuer: "",
      date: "",
      summary: "Hackathon participation and achievement highlight.",
      description: [
        "Participated in the National Level Hack The Winter 2026 (GEHU Bhimtal + WeCode) with 3 rounds: Online Round 1 (25-30 Dec 2025), Online Round 2 (9-11 Jan 2026), and a 24-hour offline final on 22-23 Jan 2026.",
        "Qualified from 403 teams and secured Rank 47 with team The Code Blooded.",
        "Built ADHYAN.AI for online rounds and Flash Sale Concurrency Guard for the final round, strengthening teamwork and problem-solving skills."
      ],
      link: "https://www.linkedin.com/posts/amansinghkunwar_hackthewinter-nationallevelhackathon-studentdeveloper-activity-7423680424150814720-Pn83",
      coverImage: "/images/hackthewinter.jpg",
      photos: ["/images/hackthewinter.jpg"]
    },
    {
      title: "Developathon Surge x DBUU",
      slug: "developathon-surge-dbuu",
      issuer: "",
      date: "",
      summary: "Hackathon achievement shared with the official event image.",
      description: [
        "Secured First Position in the National Level development-based hackathon \"Developathon Surge x DBUU.\"",
        "Competed against 50+ teams in a 24-hour hackathon and reached the final round.",
        "Built the EcoCommute project focused on sustainable, optimized commuting, and collaborated with Team Code Blodded."
      ],
      link: "https://www.linkedin.com/posts/amansinghkunwar_hackathon-innovation-teamwork-activity-7386762121180508164-HEcx",
      coverImage: "/images/developathon.jpg",
      photos: ["/images/developathon.jpg"]
    },
    {
      title: "TechBug Challenge",
      slug: "techbug-challenge",
      issuer: "",
      date: "",
      summary: "Participation in the TechBug challenge.",
      description: [
        "Won the Debug Arena (TechBug Challenge) by Evi Sphere Tech - a no-code UI/UX bug-spotting event.",
        "Online challenge held on 12 Oct 2025 (7-8 PM) with free entry and certificates.",
        "Spotted 48 bugs across 4 pages in Round 1 and 20+ design issues on a meme site in Round 2, earning a 3-month Spotify Premium prize."
      ],
      link: "https://www.linkedin.com/posts/amansinghkunwar_techbugchallenge-evispheretech-debugging-activity-7385557813349031936-HAGF",
      coverImage: "/images/debuging.jpg",
      photos: ["/images/debuging.jpg"]
    },
    {
      title: "Aasraa Trust Social Internship",
      slug: "aasraa-trust-social-internship",
      issuer: "",
      date: "",
      summary: "Social internship experience at Aasraa Trust.",
      description: [
        "Completed a 1-month social internship (1-31 July 2025) at Aasraa Trust, Dehradun.",
        "Taught Chemistry to Class 11 & 12 students under the BANNU Aasraa Project, guided learners in Hindi and English, and resolved doubts using relatable examples.",
        "Built communication, teaching, and time-management skills while contributing to education for underprivileged students."
      ],
      link: "https://www.linkedin.com/posts/amansinghkunwar_aasraatrust-socialinternship-volunteering-activity-7358737577656348672-vMKo",
      coverImage: "/images/socialInternship.jpg",
      photos: ["/images/socialInternship.jpg"]
    }
  ],
  contact: {
    address: "Police Family Quarters, Raipur Road, Dehradun",
    email: "amansinghkunwar07@gmail.com",
    phone: "+91 7983932346"
  }
};

export default function App() {
  const [portfolio, setPortfolio] = useState(fallbackData);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;

    fetchPortfolio()
      .then((data) => {
        if (active) {
          setPortfolio(data);
          setStatus("ready");
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

  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Header hero={portfolio.hero} basics={portfolio.basics} />
        <main>
          <Routes>
            <Route path="/" element={<Home portfolio={portfolio} status={status} />} />
            <Route path="/projects/:slug" element={<ProjectDetail portfolio={portfolio} />} />
            <Route
              path="/achievements/:slug"
              element={<AchievementDetail portfolio={portfolio} />}
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
