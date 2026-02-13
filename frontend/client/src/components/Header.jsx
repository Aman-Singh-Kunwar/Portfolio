import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Achievements", href: "#achievements" },
  { label: "Hire Me", href: "#hire-me" }
];

export default function Header({ hero, basics }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const avatarSrc = basics?.avatarThumbUrl || "/images/me-avatar.jpg";
  const closeMobile = () => setMobileOpen(false);
  const headerRef = useRef(null);

  useEffect(() => {
    if (!mobileOpen) return;

    const handlePointerDown = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        closeMobile();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("wheel", closeMobile, { passive: true });
    window.addEventListener("touchmove", closeMobile, { passive: true });

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("wheel", closeMobile);
      window.removeEventListener("touchmove", closeMobile);
    };
  }, [mobileOpen]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur"
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-2 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          {basics?.avatarUrl ? (
            <img
              src={avatarSrc}
              alt={hero?.name || "Profile"}
              width="40"
              height="40"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = basics?.avatarUrl || "/images/me.jpg";
              }}
              className="h-10 w-10 rounded-full border border-white/10 object-cover"
            />
          ) : (
            <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-400/20 text-sm font-semibold text-amber-300">
              AS
            </div>
          )}
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Portfolio</p>
            <p className="text-lg font-semibold">{hero?.name || "Portfolio"}</p>
          </div>
        </Link>
        <div className="hidden items-center gap-6 text-sm text-slate-300 lg:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-white">
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <a href={basics?.resumeUrl || "/cv.pdf"} className="btn-secondary">
            Resume
          </a>
          <button
            type="button"
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/90 hover:border-white/30"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <span className="relative block h-4 w-5">
              <span
                className={`absolute left-0 top-0 h-0.5 w-5 bg-current transition ${
                  mobileOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-1/2 h-0.5 w-5 -translate-y-1/2 bg-current transition ${
                  mobileOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute left-0 bottom-0 h-0.5 w-5 bg-current transition ${
                  mobileOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </nav>
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/5 bg-slate-950/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-sm text-slate-300 sm:px-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 hover:bg-white/5 hover:text-white"
                onClick={closeMobile}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
