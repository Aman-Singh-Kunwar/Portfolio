import React, { useState, useEffect } from "react";
import { FaTimes, FaDownload, FaCopy, FaCheck, FaFilePdf, FaRobot } from "react-icons/fa";

const plainTextResume = `# Aman Singh Kunwar — Full Stack Developer
Dehradun, Uttarakhand, India | +91 7983932346 | amansinghkunwar07@gmail.com
Portfolio: https://aman-singh-kunwar-portfolio1.onrender.com/
GitHub: https://github.com/Aman-Singh-Kunwar
LinkedIn: https://www.linkedin.com/in/aman-singh-kunwar-b99b62322/

---

## 🎯 SUMMARY
Computer Science student focused on building modern full stack web applications. Hands-on experience with React, Node.js, Express, PHP, MySQL, WordPress, and MongoDB. Proven track record in national hackathons and live production internships.

---

## 💻 TECHNICAL SKILLS
- Frontend: React (18), JavaScript (ES6+), Tailwind CSS, Vite, HTML5, CSS3
- Backend & APIs: Node.js (24), Express.js, PHP, REST APIs, GraphQL
- Databases & CMS: MongoDB, Mongoose, MySQL (phpMyAdmin), WordPress
- Tools & Cloud: GitHub, Git, Docker, Redis, Kafka, Render, Postman

---

## 💼 WORK & INTERNSHIP EXPERIENCE

### Web Development Intern — Evon Technologies (June 2026 - August 2026)
- Contributed to full-stack development for live government and client web platforms, including USAME (https://usame.uk.gov.in/).
- Built responsive UI components, customized WordPress themes/plugins, and integrated the ICICI Bank Payment Gateway.
- Performed end-to-end UI testing, quality assurance, bug fixing, and deployment updates with senior developers.

### Social Internship — Aasraa Trust (July 2025)
- Volunteer educator and mentor teaching Chemistry to Class 11 and 12 underprivileged students under BANNU Aasraa Project.

---

## 🎓 EDUCATION
- Bachelor of Technology (CSE) — Dev Bhoomi Uttarakhand University, Dehradun (2024 - 2028) | CGPA: 9.29
- Higher Secondary School (12th Board) — Shree Goverdhan Saraswati Vidya Mandir Inter College (2022 - 2023) | Percentage: 93.6% (18th Rank in State Board)
- High School (10th Board) — Shree Goverdhan Saraswati Vidya Mandir Inter College (2020 - 2021) | Percentage: 96.2%

---

## 🏆 HACKATHONS & ACHIEVEMENTS
- Rank 47 / 403 Teams — HacktheWinter National Level Hackathon 2026 (GEHU Bhimtal X WeCode)
- 1st Position Winner — Developathon Surge x DBUU 24-Hour National Hackathon
- 1st Winner — Debug Arena (TechBug Challenge) by Evi Sphere Tech
`;

export default function ResumeModal({ isOpen, onClose, resumeUrl = "/cv.pdf" }) {
  const [activeTab, setActiveTab] = useState("preview");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(plainTextResume);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-white/15 bg-slate-900 shadow-2xl text-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <FaFilePdf className="text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Resume — Aman Singh Kunwar</h3>
              <p className="text-xs text-slate-400">Full Stack Developer | B.Tech CSE (2024-2028)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl bg-slate-950 p-1 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === "preview"
                    ? "bg-amber-400 text-slate-950 font-semibold shadow"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <FaFilePdf /> PDF View
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("text")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === "text"
                    ? "bg-amber-400 text-slate-950 font-semibold shadow"
                    : "text-slate-300 hover:text-white"
                }`}
                title="AI & ATS screening friendly plain text resume"
              >
                <FaRobot /> Plain Text / AI
              </button>
            </div>

            <a
              href={resumeUrl}
              download="Aman_Singh_Kunwar_Resume.pdf"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3.5 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-400 hover:text-slate-950 transition"
            >
              <FaDownload /> Download PDF
            </a>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:text-amber-300 transition"
              title="Close modal (Esc)"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "preview" ? (
            <div className="h-[65vh] w-full rounded-xl overflow-hidden border border-white/10 bg-slate-950">
              <object
                data={resumeUrl}
                type="application/pdf"
                className="h-full w-full"
              >
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-6">
                  <FaFilePdf className="text-5xl text-amber-400" />
                  <p className="text-sm text-slate-300">
                    PDF preview is not supported directly in your browser.
                  </p>
                  <a
                    href={resumeUrl}
                    download="Aman_Singh_Kunwar_Resume.pdf"
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-amber-300"
                  >
                    <FaDownload /> Download Resume PDF
                  </a>
                </div>
              </object>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-amber-400/30 bg-amber-400/10 text-xs text-amber-200">
                <p className="flex items-center gap-2">
                  <FaRobot className="text-base shrink-0" />
                  <span>
                    <strong>AI & ATS Friendly Format:</strong> Optimized for ChatGPT, Claude, and HR applicant tracking systems.
                  </span>
                </p>
                <button
                  type="button"
                  onClick={handleCopyText}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition ${
                    copied
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-amber-400 text-slate-950 hover:bg-amber-300"
                  }`}
                >
                  {copied ? <FaCheck /> : <FaCopy />}
                  {copied ? "Copied!" : "Copy Text"}
                </button>
              </div>

              <pre className="p-4 rounded-xl border border-white/10 bg-slate-950 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[55vh] overflow-y-auto">
                {plainTextResume}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between gap-4 p-4 border-t border-white/10 bg-slate-950/60 text-xs text-slate-400">
          <span>Need custom format? Email: amansinghkunwar07@gmail.com</span>
          <a
            href={resumeUrl}
            download="Aman_Singh_Kunwar_Resume.pdf"
            className="sm:hidden inline-flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-400 hover:text-slate-950 transition"
          >
            <FaDownload /> Download PDF
          </a>
        </div>
      </div>
    </div>
  );
}
