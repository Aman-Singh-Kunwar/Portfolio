import { useState, useEffect } from "react";
import { FaTimes, FaLayerGroup, FaShieldAlt, FaChartLine, FaLightbulb, FaCheckCircle } from "react-icons/fa";

export default function CaseStudyModal({ isOpen, onClose, caseStudy }) {
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      setActiveTab("overview");
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose, caseStudy?.slug]);

  if (!isOpen || !caseStudy) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-white/15 bg-slate-900 shadow-2xl text-slate-100 overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-white/10 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 font-bold shadow-lg">
              <FaLayerGroup className="text-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="badge border-amber-400/30 bg-amber-400/10 text-amber-300 text-[10px] font-semibold uppercase tracking-wider">
                  {caseStudy.project}
                </span>
                <span className="text-[11px] text-slate-400">Technical Case Study</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-snug mt-0.5">
                {caseStudy.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:text-amber-300 transition"
            title="Close modal (Esc)"
          >
            <FaTimes />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 px-5 py-2.5 border-b border-white/10 bg-slate-950/40 text-xs overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
              activeTab === "overview"
                ? "bg-amber-400 text-slate-950 font-semibold shadow"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <FaLightbulb /> 1. Problem & Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("architecture")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
              activeTab === "architecture"
                ? "bg-amber-400 text-slate-950 font-semibold shadow"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <FaLayerGroup /> 2. System Architecture
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
              activeTab === "security"
                ? "bg-amber-400 text-slate-950 font-semibold shadow"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <FaShieldAlt /> 3. Integrity & Security
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("takeaways")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
              activeTab === "takeaways"
                ? "bg-amber-400 text-slate-950 font-semibold shadow"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <FaChartLine /> 4. Metrics & Takeaways
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* Key Metrics Banner */}
          {caseStudy.metrics && caseStudy.metrics.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {caseStudy.metrics.map((metric) => (
                <div
                  key={metric}
                  className="p-3 rounded-xl border border-amber-400/20 bg-amber-400/5 text-center"
                >
                  <p className="text-xs font-bold text-amber-300">{metric}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 1: Overview & Problem */}
          {activeTab === "overview" && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  The Core Engineering Problem
                </h4>
                <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-sm text-slate-200 leading-relaxed">
                  {caseStudy.problem}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Technologies Used
                </h4>
                <div className="flex flex-wrap gap-2">
                  {caseStudy.tags?.map((t) => (
                    <span key={t} className="chip bg-white/5 border-white/10 text-slate-200 text-xs">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Mission Statement
                </h4>
                <p className="text-sm text-slate-300 font-medium">
                  {caseStudy.tagline}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: System Architecture */}
          {activeTab === "architecture" && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Architectural Breakdown & Strategy
              </h4>

              <div className="space-y-3">
                {caseStudy.architecture?.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-slate-950/60"
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold text-xs">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Security & Edge Cases */}
          {activeTab === "security" && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Security Safeguards & Edge Case Protection
              </h4>
              <div className="p-5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 text-sm text-slate-200 leading-relaxed flex items-start gap-3">
                <FaShieldAlt className="text-emerald-400 text-xl shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-300 mb-1">Defense in Depth:</p>
                  <p>{caseStudy.security}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Takeaways for Hiring Managers */}
          {activeTab === "takeaways" && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Key Takeaway for Tech Leads & Recruiters
                </h4>
                <div className="p-5 rounded-xl border border-amber-400/30 bg-amber-400/10 text-sm text-amber-100 leading-relaxed flex items-start gap-3 shadow-lg">
                  <FaCheckCircle className="text-amber-400 text-xl shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-300 mb-1">Core Engineering Takeaway:</p>
                    <p>{caseStudy.takeaway}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between gap-4 p-4 border-t border-white/10 bg-slate-950/80 text-xs text-slate-400 shrink-0">
          <span>Project: <strong className="text-slate-200">{caseStudy.project}</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs py-1.5 px-4"
          >
            Close Breakdown
          </button>
        </div>

      </div>
    </div>
  );
}
