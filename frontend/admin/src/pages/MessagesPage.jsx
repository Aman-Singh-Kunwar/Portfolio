import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchMessages, deleteMessage, updateMessageStatus } from "../api";
import { TrashIcon, RefreshIcon, ExternalLinkIcon } from "../components/Icons";

const statusBadges = {
  new: "bg-sky-500/20 text-sky-300 border-sky-400/30",
  in_discussion: "bg-amber-500/20 text-amber-300 border-amber-400/30",
  interview_scheduled: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
  archived: "bg-slate-800 text-slate-400 border-white/10"
};

export default function MessagesPage() {
  const { apiUrl, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMessages(apiUrl, token);
      setMessages(data);
    } catch (err) {
      setToastMsg(err.message || "Failed to fetch messages.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateMessageStatus(apiUrl, token, id, newStatus);
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, status: newStatus } : m))
      );
      setToastMsg("Lead status updated.");
    } catch (err) {
      setToastMsg(err.message || "Failed to update status.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this recruiter message permanently?")) return;
    try {
      await deleteMessage(apiUrl, token, id);
      setMessages((prev) => prev.filter((m) => m._id !== id));
      setToastMsg("Message deleted.");
    } catch (err) {
      setToastMsg(err.message || "Failed to delete message.");
    }
  };

  const handleExportCSV = () => {
    if (!messages.length) return;
    const headers = ["Name", "Email", "Subject", "Message", "Status", "Date", "IP"];
    const rows = messages.map((m) => [
      `"${(m.name || "").replace(/"/g, '""')}"`,
      `"${(m.email || "").replace(/"/g, '""')}"`,
      `"${(m.subject || "").replace(/"/g, '""')}"`,
      `"${(m.message || "").replace(/"/g, '""')}"`,
      `"${m.status || "new"}"`,
      `"${new Date(m.createdAt).toLocaleString()}"`,
      `"${m.ip || "unknown"}"`
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Recruiter_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = messages.filter((m) => {
    const matchStatus = filterStatus === "all" || (m.status || "new") === filterStatus;
    if (!matchStatus) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (m.name || "").toLowerCase().includes(q) ||
      (m.email || "").toLowerCase().includes(q) ||
      (m.subject || "").toLowerCase().includes(q) ||
      (m.message || "").toLowerCase().includes(q)
    );
  });

  const counts = {
    all: messages.length,
    new: messages.filter((m) => (m.status || "new") === "new").length,
    in_discussion: messages.filter((m) => m.status === "in_discussion").length,
    interview_scheduled: messages.filter((m) => m.status === "interview_scheduled").length,
    archived: messages.filter((m) => m.status === "archived").length,
  };

  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(""), 3000);
    return () => clearTimeout(t);
  }, [toastMsg]);

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 rounded-xl border border-amber-400/30 bg-amber-400/15 backdrop-blur-md px-4 py-2.5 text-xs font-medium text-amber-200 shadow-lg animate-fade-in">
          {toastMsg}
        </div>
      )}

      {/* Header toolbar */}
      <div className="card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Recruiter Leads Inbox</h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage incoming hiring requests and contact forms</p>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleExportCSV}
                className="btn-secondary text-xs text-amber-300 border-amber-400/30 hover:bg-amber-400 hover:text-slate-950"
              >
                Export CSV
              </button>
            )}
            <button
              type="button"
              onClick={loadMessages}
              disabled={loading}
              className="btn-secondary text-xs flex items-center gap-1"
            >
              <RefreshIcon className="h-3.5 w-3.5" />
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {[
            { key: "all", label: "All" },
            { key: "new", label: "New" },
            { key: "in_discussion", label: "In Discussion" },
            { key: "interview_scheduled", label: "Interview Scheduled" },
            { key: "archived", label: "Archived" }
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilterStatus(key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                filterStatus === key
                  ? "bg-amber-400 text-slate-950 font-semibold"
                  : "border border-white/10 text-slate-300 hover:border-white/30 hover:text-white"
              }`}
            >
              {label} ({counts[key]})
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, email, subject, message text…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input text-xs"
        />
      </div>

      {/* Messages list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-400/30 border-t-amber-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-xs text-slate-400">
            {messages.length === 0
              ? "No recruiter messages received yet. Inbound inquiries will appear here."
              : "No messages match the current search filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => {
            const st = m.status || "new";
            return (
              <div key={m._id} className="card p-4 sm:p-5 space-y-3 border border-white/10 bg-slate-950/50 hover:border-white/20 transition">
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-white truncate">{m.name}</span>
                    <span className="text-slate-400 truncate">&lt;{m.email}&gt;</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <select
                      value={st}
                      onChange={(e) => handleStatusChange(m._id, e.target.value)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border cursor-pointer bg-slate-900 transition ${statusBadges[st] || statusBadges.new}`}
                    >
                      <option value="new">New</option>
                      <option value="in_discussion">In Discussion</option>
                      <option value="interview_scheduled">Interview Scheduled</option>
                      <option value="archived">Archived</option>
                    </select>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(m.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Subject + body */}
                <p className="text-xs font-semibold text-amber-300">{m.subject}</p>
                <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {m.message}
                </p>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between border-t border-white/5">
                  <a
                    href={`mailto:${m.email}?subject=Re:%20${encodeURIComponent(m.subject)}`}
                    className="text-xs font-medium text-amber-300 hover:text-amber-200 underline flex items-center gap-1"
                  >
                    Reply via Mail Client <ExternalLinkIcon className="h-3 w-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(m._id)}
                    className="text-xs text-rose-300 hover:text-rose-200 flex items-center gap-1"
                  >
                    <TrashIcon className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
