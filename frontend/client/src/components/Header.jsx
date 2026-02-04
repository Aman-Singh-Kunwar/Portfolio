import { Link } from "react-router-dom";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Achievements", href: "#achievements" },
  { label: "Hire Me", href: "#hire-me" }
];

export default function Header({ hero, basics }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          {basics?.avatarUrl ? (
            <img
              src={basics.avatarUrl}
              alt={hero?.name || "Profile"}
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
        <div className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={`/${link.href}`} className="hover:text-white">
              {link.label}
            </a>
          ))}
        </div>
        <a href={basics?.resumeUrl || "/cv.pdf"} className="btn-secondary">
          Resume
        </a>
      </nav>
    </header>
  );
}
