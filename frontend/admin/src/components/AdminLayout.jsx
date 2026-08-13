import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  DashboardIcon, 
  ProjectsIcon, 
  AwardIcon, 
  FormIcon,
  JsonIcon, 
  InboxIcon, 
  LogoutIcon 
} from "./Icons";

const navItems = [
  { to: "/dashboard", label: "Dashboard", Icon: DashboardIcon },
  { to: "/editor/json", label: "JSON Editor", Icon: JsonIcon },
  { to: "/editor/projects", label: "Projects Manager", Icon: ProjectsIcon },
  { to: "/editor/achievements", label: "Achievements Manager", Icon: AwardIcon },
  { to: "/editor/experience", label: "Experience & Edu", Icon: FormIcon },
  { to: "/editor/skills", label: "Skills Manager", Icon: FormIcon },
  { to: "/messages", label: "Recruiter Inbox", Icon: InboxIcon },
];

const ACCENT_COLORS = [
  { name: "amber", bg: "bg-amber-400", label: "Amber Gold" },
  { name: "emerald", bg: "bg-emerald-400", label: "Emerald Teal" },
  { name: "violet", bg: "bg-violet-400", label: "Cyber Violet" },
  { name: "sky", bg: "bg-sky-400", label: "Sky Blue" },
  { name: "rose", bg: "bg-rose-400", label: "Rose Pink" },
];

export default function AdminLayout() {
  const { logout, accentColor, setAccentColor } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentPage = navItems.find((item) => location.pathname.startsWith(item.to));
  const CurrentIcon = currentPage?.Icon || DashboardIcon;

  return (
    <div className="flex h-screen overflow-hidden text-slate-100 bg-slate-950/40">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/80 backdrop-blur-md lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 bg-slate-950/70 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 font-bold shadow-lg">
            A
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Portfolio Admin</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-medium">Control Center</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer Logout */}
        <div className="border-t border-white/10 px-3 py-4">
          <button
            type="button"
            onClick={logout}
            className="sidebar-link w-full text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
          >
            <LogoutIcon className="h-4 w-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex items-center justify-between gap-4 border-b border-white/10 bg-slate-950/60 backdrop-blur-md px-4 py-3.5 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 lg:hidden"
              aria-label="Open sidebar"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <CurrentIcon className="h-4 w-4 text-amber-400" />
              <h1 className="text-sm font-semibold text-white">
                {currentPage?.label || "Admin"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Color Theme Selector */}
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-900/80 px-2.5 py-1">
              <span className="text-[11px] text-slate-400 hidden sm:inline">Theme:</span>
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setAccentColor(color.name)}
                  title={color.label}
                  className={`h-3.5 w-3.5 rounded-full ${color.bg} transition-transform ${
                    accentColor === color.name ? "ring-2 ring-white scale-125" : "opacity-60 hover:opacity-100"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={logout}
              className="hidden lg:inline-flex btn-secondary text-xs items-center gap-2"
            >
              <LogoutIcon className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
