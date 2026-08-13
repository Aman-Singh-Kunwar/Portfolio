import React, { useState, useEffect } from "react";
import { FaTimes, FaWhatsapp, FaLinkedin, FaTwitter, FaEnvelope, FaCopy, FaCheck, FaShareAlt } from "react-icons/fa";

export default function ShareModal({ isOpen, onClose, name = "Aman Singh Kunwar", role = "Full Stack Developer", url }) {
  const [copied, setCopied] = useState(false);
  const siteUrl = url || (typeof window !== "undefined" ? window.location.origin : "https://aman-singh-kunwar-portfolio1.onrender.com");
  
  const shareText = `Hi! Check out ${name} — ${role} (React, Node.js, PHP, MySQL). Portfolio: ${siteUrl}`;

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

  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name} | Portfolio`,
          text: `Check out ${name}'s Full Stack Portfolio`,
          url: siteUrl
        });
      } catch {
        // Share cancelled
      }
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(siteUrl)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(`Candidate Recommendation: ${name}`)}&body=${encodeURIComponent(shareText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-slate-900 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <FaShareAlt className="text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Share Candidate Profile</h3>
              <p className="text-xs text-slate-400">Forward {name}'s portfolio to your hiring team</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:text-amber-300 transition"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Quick Platform Buttons Grid */}
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3">
              Share directly via platform
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition group"
              >
                <FaWhatsapp className="text-2xl group-hover:scale-110 transition" />
                <span className="text-xs font-semibold">WhatsApp</span>
              </a>

              <a
                href={linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 transition group"
              >
                <FaLinkedin className="text-2xl group-hover:scale-110 transition" />
                <span className="text-xs font-semibold">LinkedIn</span>
              </a>

              <a
                href={twitterUrl}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-blue-400/30 bg-blue-400/10 text-blue-300 hover:bg-blue-400/20 transition group"
              >
                <FaTwitter className="text-2xl group-hover:scale-110 transition" />
                <span className="text-xs font-semibold">Twitter / X</span>
              </a>

              <a
                href={mailtoUrl}
                className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 transition group"
              >
                <FaEnvelope className="text-2xl group-hover:scale-110 transition" />
                <span className="text-xs font-semibold">Email</span>
              </a>
            </div>
          </div>

          {/* Native Web Share Button (if supported) */}
          {typeof navigator !== "undefined" && navigator.share && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full btn-primary flex items-center justify-center gap-2 py-2.5"
            >
              <FaShareAlt /> Open Device Share Sheet (Apps)
            </button>
          )}

          {/* Candidate Card Snippet Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Pre-formatted Candidate Card
              </p>
              <button
                type="button"
                onClick={handleCopySnippet}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  copied
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-amber-400 text-slate-950 hover:bg-amber-300"
                }`}
              >
                {copied ? <FaCheck /> : <FaCopy />}
                {copied ? "Copied!" : "Copy Snippet"}
              </button>
            </div>
            <div className="p-4 rounded-xl border border-white/10 bg-slate-950 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
              {shareText}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/60 text-center text-xs text-slate-400">
          Clicking platform icons opens a pre-filled share card window.
        </div>
      </div>
    </div>
  );
}
