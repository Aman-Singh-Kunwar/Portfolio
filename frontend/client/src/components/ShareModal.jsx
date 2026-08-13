import { useState, useEffect, useRef } from "react";
import { FaTimes, FaWhatsapp, FaLinkedin, FaTwitter, FaEnvelope, FaCopy, FaCheck, FaShareAlt, FaDownload } from "react-icons/fa";

export default function ShareModal({ isOpen, onClose, name = "Aman Singh Kunwar", role = "Full Stack Developer", url }) {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const canvasRef = useRef(null);

  const siteUrl = url || (typeof window !== "undefined" ? window.location.origin : "https://aman-singh-kunwar-portfolio1.onrender.com");

  // Clean text snippet with bullet points
  const cleanSnippet = `• Candidate Profile: ${name}
• Role: ${role} (React, Node.js, PHP, MongoDB)
• Highlights: 1st Rank National Hackathon Winner | B.Tech CSE (CGPA: 9.29)
• Location: Dehradun, Uttarakhand, India
• Portfolio URL: ${siteUrl}`;

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
      await navigator.clipboard.writeText(cleanSnippet);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(siteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Generate PNG image of Card with Avatar Image and Portfolio URL onto Canvas
  const handleDownloadCardImage = () => {
    setIsGeneratingImage(true);
    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      setIsGeneratingImage(false);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/images/me.jpg";

    let drawn = false;

    const drawCanvasContent = () => {
      if (drawn) return;
      drawn = true;

      // Draw Dark Ambient Background
      const bgGradient = ctx.createLinearGradient(0, 0, 1200, 630);
      bgGradient.addColorStop(0, "#0b1120");
      bgGradient.addColorStop(0.5, "#0f172a");
      bgGradient.addColorStop(1, "#090d16");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, 1200, 630);

      // Draw Ambient Glows
      const glow1 = ctx.createRadialGradient(200, 150, 10, 200, 150, 400);
      glow1.addColorStop(0, "rgba(245, 158, 11, 0.25)");
      glow1.addColorStop(1, "transparent");
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, 1200, 630);

      const glow2 = ctx.createRadialGradient(1000, 500, 10, 1000, 500, 400);
      glow2.addColorStop(0, "rgba(45, 212, 191, 0.2)");
      glow2.addColorStop(1, "transparent");
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, 1200, 630);

      // Border Card Outline
      ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(40, 40, 1120, 550, 24);
      ctx.stroke();

      let textStartX = 80;

      // Profile Avatar Image (if loaded successfully)
      if (img.complete && img.naturalWidth !== 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(130, 150, 50, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 80, 100, 100, 100);
        ctx.restore();

        // Avatar Border Ring
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(130, 150, 50, 0, Math.PI * 2);
        ctx.stroke();

        textStartX = 205;
      }

      // Name & Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 42px 'Segoe UI', sans-serif";
      ctx.fillText(name, textStartX, 130);

      ctx.fillStyle = "#f59e0b";
      ctx.font = "600 24px 'Segoe UI', sans-serif";
      ctx.fillText(`${role} — React | Node.js | PHP | MongoDB`, textStartX, 170);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "20px 'Segoe UI', sans-serif";
      ctx.fillText("Location: Dehradun, Uttarakhand, India", textStartX, 205);

      // Divider
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, 250);
      ctx.lineTo(1120, 250);
      ctx.stroke();

      // Highlights Section
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "600 24px 'Segoe UI', sans-serif";
      ctx.fillText("Key Highlights:", 80, 300);

      ctx.font = "22px 'Segoe UI', sans-serif";
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText("• 1st Rank National Hackathon Winner (Developathon Surge x DBUU)", 80, 345);
      ctx.fillText("• B.Tech Computer Science & Engineering (CGPA: 9.29)", 80, 385);
      ctx.fillText("• Web Development Intern at Evon Technologies", 80, 425);

      // Footer URL Box
      ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
      ctx.beginPath();
      ctx.roundRect(80, 510, 1040, 56, 12);
      ctx.fill();
      ctx.strokeStyle = "rgba(245, 158, 11, 0.3)";
      ctx.stroke();

      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 20px Consolas, monospace";
      ctx.fillText(`Portfolio URL: ${siteUrl}`, 100, 545);

      // Export Canvas to PNG Image Download
      try {
        const link = document.createElement("a");
        link.download = `${name.replace(/\s+/g, "_")}_Developer_Card.png`;
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch {
        // Fallback
      } finally {
        setIsGeneratingImage(false);
      }
    };

    img.onload = drawCanvasContent;
    img.onerror = drawCanvasContent;

    setTimeout(() => {
      drawCanvasContent();
    }, 400);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name} | Developer Portfolio`,
          text: cleanSnippet,
          url: siteUrl
        });
      } catch {
        // Share cancelled
      }
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(cleanSnippet)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(siteUrl)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(cleanSnippet)}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(`Candidate Profile: ${name}`)}&body=${encodeURIComponent(cleanSnippet)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-slate-900 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <FaShareAlt className="text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Share Developer Profile</h3>
              <p className="text-xs text-slate-400">Forward candidate card or download card image</p>
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
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* DIGITAL DEVELOPER CARD PREVIEW */}
          <div className="relative rounded-2xl border border-amber-400/30 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-5 shadow-xl space-y-4 overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl border-2 border-amber-400/40 overflow-hidden shrink-0">
                  <img src="/images/me.jpg" alt={name} className="h-full w-full object-cover" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white leading-snug">{name}</h4>
                  <p className="text-xs text-amber-300 font-medium">{role}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Dehradun, Uttarakhand, India</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadCardImage}
                disabled={isGeneratingImage}
                className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3 border-amber-400/30 text-amber-300 hover:bg-amber-400 hover:text-slate-950 transition"
                title="Download Card Image with your Photo and Portfolio URL"
              >
                <FaDownload /> {isGeneratingImage ? "Generating..." : "Download Card Image"}
              </button>
            </div>

            {/* Clean Highlights List */}
            <div className="space-y-1 text-[11px] text-slate-300 border-t border-white/10 pt-3">
              <p className="font-semibold text-slate-200 mb-1">Highlights:</p>
              <p>• 1st Rank National Hackathon Winner (Developathon Surge)</p>
              <p>• B.Tech Computer Science (CGPA: 9.29)</p>
              <p>• Web Development Intern at Evon Technologies</p>
            </div>

            {/* Portfolio Link Box */}
            <div className="p-2.5 rounded-lg border border-amber-400/20 bg-slate-950/80 font-mono text-[11px] text-amber-300 truncate">
              Portfolio URL: {siteUrl}
            </div>
          </div>

          {/* Share Platform Buttons */}
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2.5">
              Share directly via platform
            </p>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition group"
              >
                <FaWhatsapp className="text-xl group-hover:scale-110 transition" />
                <span className="text-xs font-semibold">WhatsApp</span>
              </a>

              <a
                href={linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 transition group"
              >
                <FaLinkedin className="text-xl group-hover:scale-110 transition" />
                <span className="text-xs font-semibold">LinkedIn</span>
              </a>

              <a
                href={twitterUrl}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-blue-400/30 bg-blue-400/10 text-blue-300 hover:bg-blue-400/20 transition group"
              >
                <FaTwitter className="text-xl group-hover:scale-110 transition" />
                <span className="text-xs font-semibold">Twitter / X</span>
              </a>

              <a
                href={mailtoUrl}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 transition group"
              >
                <FaEnvelope className="text-xl group-hover:scale-110 transition" />
                <span className="text-xs font-semibold">Email</span>
              </a>
            </div>
          </div>

          {/* Native Web Share */}
          {typeof navigator !== "undefined" && navigator.share && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 text-xs font-semibold"
            >
              <FaShareAlt /> Open Mobile Share Sheet (Apps)
            </button>
          )}

          {/* Pre-formatted Text Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Pre-formatted Card Text
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${copiedLink ? "bg-emerald-500 text-slate-950" : "bg-white/10 text-slate-300 hover:bg-white/20"
                    }`}
                >
                  {copiedLink ? <FaCheck /> : <FaCopy />}
                  {copiedLink ? "Link Copied" : "Copy URL"}
                </button>

                <button
                  type="button"
                  onClick={handleCopySnippet}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${copiedText ? "bg-emerald-500 text-slate-950" : "bg-amber-400 text-slate-950 hover:bg-amber-300"
                    }`}
                >
                  {copiedText ? <FaCheck /> : <FaCopy />}
                  {copiedText ? "Text Copied" : "Copy Text"}
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-white/10 bg-slate-950 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
              {cleanSnippet}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
