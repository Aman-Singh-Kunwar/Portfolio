import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchPortfolio, fetchMessages, fetchVisits } from "../api";
import { 
  InboxIcon, 
  ProjectsIcon, 
  AwardIcon, 
  FormIcon,
  JsonIcon, 
  ChartIcon, 
  RefreshIcon 
} from "../components/Icons";

export default function DashboardPage() {
  const { apiUrl, token } = useAuth();
  const [portfolioData, setPortfolioData] = useState(null);
  const [messagesData, setMessagesData] = useState([]);
  const [visitCount, setVisitCount] = useState(0);
  const [visitTrends, setVisitTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [portfolio, messages, visits] = await Promise.all([
        fetchPortfolio(apiUrl),
        fetchMessages(apiUrl, token).catch(() => []),
        fetchVisits(apiUrl).catch(() => ({ count: 0, trends: [] }))
      ]);
      setPortfolioData(portfolio);
      setMessagesData(messages);
      setVisitCount(visits?.count || 0);
      setVisitTrends(visits?.trends || []);
      setLastSync(new Date().toLocaleString());
    } catch {
      // Portfolio may fail if not initialized
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const newCount = messagesData.filter((m) => (m.status || "new") === "new").length;
  const discussionCount = messagesData.filter((m) => m.status === "in_discussion").length;
  const projectCount = portfolioData?.projects?.length || 0;
  const achievementCount = portfolioData?.achievements?.length || 0;
  const maxTrend = Math.max(1, ...visitTrends.map((t) => t.count));

  const statCards = [
    { label: "Total Site Visits", value: visitCount, Icon: ChartIcon, color: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300" },
    { label: "Recruiter Leads", value: messagesData.length, Icon: InboxIcon, color: "border-sky-400/30 bg-sky-500/10 text-sky-300" },
    { label: "New Messages", value: newCount, Icon: InboxIcon, color: "border-amber-400/30 bg-amber-500/10 text-amber-300" },
    { label: "In Discussion", value: discussionCount, Icon: InboxIcon, color: "border-purple-400/30 bg-purple-500/10 text-purple-300" },
  ];

  const quickActions = [
    { to: "/editor/json", label: "JSON Editor", Icon: JsonIcon, desc: "Raw schema editor & split preview" },
    { to: "/editor/projects", label: "Manage Projects", Icon: ProjectsIcon, desc: "Add, edit, or feature projects" },
    { to: "/editor/achievements", label: "Achievements & Certs", Icon: AwardIcon, desc: "Add certificates & milestones" },
    { to: "/editor/skills", label: "Skills Manager", Icon: FormIcon, desc: "Manage tech progress bars" },
    { to: "/messages", label: "Recruiter Inbox", Icon: InboxIcon, desc: "Manage hiring inquiries" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-amber-400/30 border-t-amber-400" />
          <p className="text-xs text-slate-400">Loading dashboard overview…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Welcome card */}
      <div className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-400 font-semibold">Overview</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">
              {portfolioData?.hero?.name || "Aman Singh Kunwar"}
            </h2>
            <p className="mt-1 text-xs text-slate-300">
              {portfolioData?.basics?.role || "Full Stack Developer"} — {portfolioData?.basics?.location || "Dehradun, Uttarakhand"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 text-xs text-slate-400">
            <span>API Server: <span className="text-slate-300 font-mono">{apiUrl}</span></span>
            <span>Last sync: <span className="text-slate-300">{lastSync || "—"}</span></span>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, Icon, color }) => (
          <div key={label} className={`card p-5 border ${color}`}>
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider opacity-80">{label}</p>
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-3xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* 7-Day Traffic Trend Bar Chart */}
      {visitTrends.length > 0 && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">7-Day Visitor Traffic Trend</h3>
              <p className="text-xs text-slate-400 mt-0.5">Daily unique visitors over the past week</p>
            </div>
            <span className="badge border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
              Live Analytics
            </span>
          </div>

          <div className="flex items-end justify-between gap-2 h-36 pt-4 border-b border-white/10 px-2">
            {visitTrends.map((t) => {
              const heightPercent = Math.max(12, Math.round((t.count / maxTrend) * 100));
              return (
                <div key={t.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {t.count}
                  </span>
                  <div
                    className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-amber-500/40 to-amber-400 group-hover:from-amber-400 group-hover:to-amber-300 transition-all duration-300 shadow-lg"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[10px] text-slate-400 truncate w-full text-center">{t.date}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-3 font-medium">Quick Actions</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {quickActions.map(({ to, label, Icon, desc }) => (
            <Link
              key={to}
              to={to}
              className="card p-4 group hover:border-amber-400/40 transition-all duration-200 hover:-translate-y-0.5"
            >
              <Icon className="h-5 w-5 text-amber-400 group-hover:scale-110 transition-transform" />
              <p className="mt-3 text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                {label}
              </p>
              <p className="mt-1 text-[11px] text-slate-400 line-clamp-2">{desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Portfolio summary */}
      {portfolioData && (
        <div className="card p-6 space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-medium">Live Portfolio Overview</p>
          <div className="grid gap-4 sm:grid-cols-5 text-xs">
            <div className="p-3 rounded-xl border border-white/5 bg-slate-900/40">
              <p className="text-slate-400">Total Projects</p>
              <p className="text-white font-semibold text-base mt-1">{projectCount}</p>
            </div>
            <div className="p-3 rounded-xl border border-white/5 bg-slate-900/40">
              <p className="text-slate-400">Case Studies</p>
              <p className="text-white font-semibold text-base mt-1">{portfolioData?.caseStudies?.length || 0}</p>
            </div>
            <div className="p-3 rounded-xl border border-white/5 bg-slate-900/40">
              <p className="text-slate-400">Achievements & Certs</p>
              <p className="text-white font-semibold text-base mt-1">{achievementCount}</p>
            </div>
            <div className="p-3 rounded-xl border border-white/5 bg-slate-900/40">
              <p className="text-slate-400">Skills Tracked</p>
              <p className="text-white font-semibold text-base mt-1">
                {portfolioData?.skills?.length || 0}
              </p>
            </div>
            <div className="p-3 rounded-xl border border-white/5 bg-slate-900/40">
              <p className="text-slate-400">Contact Email</p>
              <p className="text-white font-mono text-xs mt-1 truncate">
                {portfolioData?.basics?.email || "amansinghkunwar07@gmail.com"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Refresh */}
      <div className="flex justify-center pt-2">
        <button type="button" onClick={loadDashboard} className="btn-secondary text-xs flex items-center gap-2">
          <RefreshIcon className="h-3.5 w-3.5" />
          Refresh Overview
        </button>
      </div>
    </div>
  );
}
