import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchPortfolio, getApiUrl, updatePortfolio, fetchMessages, deleteMessage } from "./api";

const template = {
  meta: {
    title: "Your Name | Full Stack Developer",
    description: "Full stack portfolio built with React, Node.js, MongoDB, and Tailwind CSS."
  },
  hero: {
    greeting: "Hello!",
    name: "Your Name",
    roles: ["Full Stack Developer"],
    tagline: "Short professional tagline.",
    ctaPrimary: "View Projects",
    ctaSecondary: "Download Resume",
    image: "/images/me.jpg"
  },
  basics: {
    role: "Full Stack Developer",
    location: "Your City",
    email: "you@example.com",
    phone: "+00 0000000000",
    resumeUrl: "/cv.pdf",
    social: []
  },
  projects: []
};

const statusTone = {
  idle: "text-slate-300",
  loading: "text-sky-200",
  ready: "text-emerald-200",
  saving: "text-amber-200",
  saved: "text-emerald-200",
  error: "text-rose-200"
};

const formatTime = () => new Date().toLocaleString();

export default function App() {
  const [apiUrl, setApiUrl] = useState(getApiUrl());
  const [token, setToken] = useState(() => sessionStorage.getItem("admin_token") || "");
  const [clientUrl, setClientUrl] = useState(
    () => localStorage.getItem("client_url") || "http://localhost:5173"
  );
  const [jsonText, setJsonText] = useState(() => JSON.stringify(template, null, 2));
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [messageDetails, setMessageDetails] = useState([]);
  const [showToken, setShowToken] = useState(false);
  const [lastSnapshot, setLastSnapshot] = useState("");
  const [lastLoadedAt, setLastLoadedAt] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState("offline");
  const [previewStatus, setPreviewStatus] = useState("idle");

  const [adminTab, setAdminTab] = useState("json"); // "json" | "form" | "messages"
  const [messagesList, setMessagesList] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (token) {
      sessionStorage.setItem("admin_token", token);
    } else {
      sessionStorage.removeItem("admin_token");
    }
  }, [token]);

  useEffect(() => {
    localStorage.setItem("client_url", clientUrl);
  }, [clientUrl]);

  const parsedJson = useMemo(() => {
    try {
      return { data: JSON.parse(jsonText), valid: true };
    } catch (error) {
      return { data: null, valid: false };
    }
  }, [jsonText]);

  const isValidJson = parsedJson.valid;
  const previewData = parsedJson.data;
  const fallbackPreview = previewData || template;

  const updateFormField = (section, field, value) => {
    if (!isValidJson || !previewData) return;
    const updated = structuredClone(previewData);
    if (!updated[section]) updated[section] = {};
    updated[section][field] = value;
    setJsonText(JSON.stringify(updated, null, 2));
  };

  const loadRecruiterMessages = useCallback(async () => {
    if (!token.trim()) {
      setMessage("Admin token is required to view recruiter messages.");
      return;
    }
    setLoadingMessages(true);
    try {
      const data = await fetchMessages(apiUrl, token);
      setMessagesList(data);
      setMessage(`Loaded ${data.length} recruiter message(s).`);
    } catch (err) {
      setMessage(err.message || "Failed to load messages.");
    } finally {
      setLoadingMessages(false);
    }
  }, [apiUrl, token]);

  const handleDeleteRecruiterMessage = async (id) => {
    if (!window.confirm("Delete this recruiter message permanently?")) return;
    try {
      await deleteMessage(apiUrl, token, id);
      setMessagesList((prev) => prev.filter((m) => m._id !== id));
      setMessage("Message deleted.");
    } catch (err) {
      setMessage(err.message || "Failed to delete message.");
    }
  };

  const checkClientStatus = useCallback(async () => {
    if (!clientUrl) {
      setPreviewMode("offline");
      setPreviewStatus("offline");
      return;
    }

    setPreviewStatus("checking");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    try {
      const response = await fetch(clientUrl, {
        method: "GET",
        mode: "no-cors",
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (response) {
        setPreviewMode("live");
        setPreviewStatus("live");
      }
    } catch (error) {
      clearTimeout(timeoutId);
      setPreviewMode("offline");
      setPreviewStatus("offline");
    }
  }, [clientUrl]);

  const handleLoad = async () => {
    setStatus("loading");
    setMessage("");
    setMessageDetails([]);

    try {
      const data = await fetchPortfolio(apiUrl);
      const formatted = JSON.stringify(data, null, 2);
      setJsonText(formatted);
      setLastSnapshot(formatted);
      setLastLoadedAt(formatTime());
      setStatus("ready");
      setMessage("Loaded portfolio data from API.");
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
      setMessageDetails(error.details || []);
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setMessage("Formatted JSON.");
      setMessageDetails([]);
    } catch (error) {
      setMessage("Invalid JSON. Fix errors before formatting.");
      setMessageDetails([]);
    }
  };

  const handleSave = async () => {
    if (!token.trim()) {
      setStatus("error");
      setMessage("Admin token is required before saving.");
      setMessageDetails([]);
      return;
    }

    if (!window.confirm("Publish these portfolio changes now?")) {
      setMessage("Save cancelled.");
      setMessageDetails([]);
      return;
    }

    setStatus("saving");
    setMessage("");
    setMessageDetails([]);

    try {
      const parsed = JSON.parse(jsonText);
      await updatePortfolio(apiUrl, token, parsed);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      setLastSnapshot(formatted);
      setLastLoadedAt(formatTime());
      setStatus("saved");
      setMessage("Portfolio updated successfully.");
      setMessageDetails([]);
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
      setMessageDetails(error.details || []);
    }
  };

  const handleReset = () => {
    if (!lastSnapshot) {
      setMessage("No previous snapshot to restore.");
      return;
    }
    setJsonText(lastSnapshot);
    setMessage("Restored last loaded snapshot.");
    setMessageDetails([]);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      setMessage("JSON copied to clipboard.");
      setMessageDetails([]);
    } catch (error) {
      setMessage("Failed to copy. Try selecting the text manually.");
      setMessageDetails([]);
    }
  };

  const handleValidate = () => {
    try {
      JSON.parse(jsonText);
      setMessage("JSON syntax is valid.");
      setMessageDetails([]);
    } catch (error) {
      setMessage("Invalid JSON. Fix syntax errors before saving.");
      setMessageDetails([error.message]);
    }
  };

  const handleClearToken = () => {
    setToken("");
    setMessage("Admin token cleared for this browser tab.");
    setMessageDetails([]);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "portfolio.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      JSON.parse(text);
      setJsonText(text);
      setMessage("Loaded JSON from file.");
      setMessageDetails([]);
    } catch (error) {
      setMessage("Invalid JSON file. Please check the file content.");
      setMessageDetails([]);
    } finally {
      event.target.value = "";
    }
  };

  const handleOpenPreview = () => {
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };

  useEffect(() => {
    if (!isPreviewOpen) {
      setPreviewStatus("idle");
      return;
    }

    checkClientStatus();
    const interval = setInterval(checkClientStatus, 5000);

    return () => clearInterval(interval);
  }, [isPreviewOpen, checkClientStatus]);

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Admin</p>
              <h1 className="mt-2 text-3xl font-semibold">Portfolio Control Center</h1>
              <p className="mt-3 text-sm text-slate-300">
                Load live data, edit visually or via JSON, view recruiter messages, and publish updates.
              </p>
            </div>
            <div className="badge">
              <span className="text-slate-400">Status</span>
              <span className={statusTone[status] || "text-slate-200"}>{status}</span>
            </div>
          </div>
        </header>

        <main>
          <section className="grid gap-6 lg:grid-cols-[1fr_1.8fr]">
            <div className="flex flex-col gap-6">
              <div className="card p-6 space-y-4">
                <div>
                  <label htmlFor="api-url-input" className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    API URL
                  </label>
                  <input
                    id="api-url-input"
                    className="input mt-2"
                    value={apiUrl}
                    onChange={(event) => setApiUrl(event.target.value)}
                    placeholder="http://localhost:4000"
                  />
                </div>
                <div>
                  <label htmlFor="client-url-input" className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Client Preview URL
                  </label>
                  <input
                    id="client-url-input"
                    className="input mt-2"
                    value={clientUrl}
                    onChange={(event) => setClientUrl(event.target.value)}
                    placeholder="http://localhost:5173"
                  />
                </div>
                <div>
                  <label htmlFor="admin-token-input" className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Admin Token
                  </label>
                  <div className="relative mt-2">
                    <input
                      id="admin-token-input"
                      type={showToken ? "text" : "password"}
                      className="input pr-12"
                      value={token}
                      onChange={(event) => setToken(event.target.value)}
                      placeholder="change-me"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white"
                      onClick={() => setShowToken((visible) => !visible)}
                      aria-label={showToken ? "Hide admin token" : "Show admin token"}
                      title={showToken ? "Hide admin token" : "Show admin token"}
                    >
                      {showToken ? (
                        <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m2 2 20 20" />
                          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                          <path d="M9.9 4.2A10.5 10.5 0 0 1 12 4c5 0 8.5 4 10 8a13.5 13.5 0 0 1-3 4.5" />
                          <path d="M6.4 6.4A13.5 13.5 0 0 0 2 12c1.5 4 5 8 10 8a10.5 10.5 0 0 0 4.1-.8" />
                        </svg>
                      ) : (
                        <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="button" className="btn-primary" onClick={handleLoad}>
                    Load Data
                  </button>
                  <button
                    type="button"
                    className={`btn-secondary ${!isValidJson ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={handleSave}
                    disabled={!isValidJson}
                  >
                    Save Updates
                  </button>
                  <button type="button" className="btn-secondary" onClick={handleValidate}>
                    Validate JSON
                  </button>
                  <button type="button" className="btn-secondary" onClick={handleClearToken}>
                    Clear Token
                  </button>
                  <button type="button" className="btn-secondary" onClick={handleDownload}>
                    Download JSON
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload JSON
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={handleUpload}
                  />
                </div>
                <div className="text-xs text-slate-400">
                  Last sync: <span className="text-slate-200">{lastLoadedAt || "Not yet"}</span>
                </div>
                {message && <p className="text-xs text-amber-200">{message}</p>}
                {messageDetails.length > 0 && (
                  <ul className="list-disc space-y-1 pl-5 text-xs text-rose-200">
                    {messageDetails.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="card p-6 space-y-4">
                <div className="flex flex-wrap gap-3">
                  <button type="button" className="btn-secondary" onClick={handleCopy}>
                    Copy JSON
                  </button>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Tips</p>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
                    <li>Switch between JSON Mode, Form Editor, and Recruiter Messages above.</li>
                    <li>Keep unique project `slug` values for clean URLs.</li>
                    <li>Save updates after editing to sync with live MongoDB database.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setAdminTab("json")}
                    className={`rounded-lg px-3 py-1.5 transition ${adminTab === "json" ? "bg-amber-400 text-slate-950 font-semibold" : "text-slate-300 hover:text-white"}`}
                  >
                    JSON Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminTab("form")}
                    className={`rounded-lg px-3 py-1.5 transition ${adminTab === "form" ? "bg-amber-400 text-slate-950 font-semibold" : "text-slate-300 hover:text-white"}`}
                  >
                    Form Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminTab("messages");
                      loadRecruiterMessages();
                    }}
                    className={`rounded-lg px-3 py-1.5 transition ${adminTab === "messages" ? "bg-amber-400 text-slate-950 font-semibold" : "text-slate-300 hover:text-white"}`}
                  >
                    Recruiter Messages {messagesList.length > 0 && `(${messagesList.length})`}
                  </button>
                </div>

                <div className="badge">
                  <span className="text-slate-400">JSON Status</span>
                  <span className={isValidJson ? "text-emerald-200" : "text-rose-200"}>
                    {isValidJson ? "Valid" : "Invalid"}
                  </span>
                </div>
              </div>

              {adminTab === "json" && (
                <div className="mt-4">
                  <textarea
                    id="portfolio-json-editor"
                    className="h-[520px] w-full rounded-xl border border-white/10 bg-slate-950/70 p-4 font-mono text-xs text-slate-200 focus:border-amber-300 focus:outline-none"
                    value={jsonText}
                    onChange={(event) => setJsonText(event.target.value)}
                  />
                  {!isValidJson && (
                    <p className="mt-4 text-xs text-rose-200">
                      JSON is invalid. Fix errors before saving or switching to Form mode.
                    </p>
                  )}
                </div>
              )}

              {adminTab === "form" && (
                <div className="mt-4 h-[520px] overflow-y-auto space-y-6 pr-2">
                  {!isValidJson ? (
                    <p className="text-xs text-rose-200">
                      Form Editor requires valid JSON. Please fix JSON syntax errors first.
                    </p>
                  ) : (
                    <>
                      <div className="card p-4 space-y-3 bg-slate-950/40">
                        <p className="text-xs uppercase tracking-wider text-amber-300">Hero Section</p>
                        <div className="grid gap-3 sm:grid-cols-2 text-xs">
                          <div>
                            <label className="text-slate-400">Greeting</label>
                            <input
                              className="input mt-1 w-full"
                              value={previewData.hero?.greeting || ""}
                              onChange={(e) => updateFormField("hero", "greeting", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-slate-400">Name</label>
                            <input
                              className="input mt-1 w-full"
                              value={previewData.hero?.name || ""}
                              onChange={(e) => updateFormField("hero", "name", e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-slate-400">Tagline</label>
                          <input
                            className="input mt-1 w-full text-xs"
                            value={previewData.hero?.tagline || ""}
                            onChange={(e) => updateFormField("hero", "tagline", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="card p-4 space-y-3 bg-slate-950/40">
                        <p className="text-xs uppercase tracking-wider text-amber-300">Basics & Contact</p>
                        <div className="grid gap-3 sm:grid-cols-2 text-xs">
                          <div>
                            <label className="text-slate-400">Role</label>
                            <input
                              className="input mt-1 w-full"
                              value={previewData.basics?.role || ""}
                              onChange={(e) => updateFormField("basics", "role", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-slate-400">Location</label>
                            <input
                              className="input mt-1 w-full"
                              value={previewData.basics?.location || ""}
                              onChange={(e) => updateFormField("basics", "location", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-slate-400">Email</label>
                            <input
                              className="input mt-1 w-full"
                              value={previewData.basics?.email || ""}
                              onChange={(e) => updateFormField("basics", "email", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-slate-400">Phone</label>
                            <input
                              className="input mt-1 w-full"
                              value={previewData.basics?.phone || ""}
                              onChange={(e) => updateFormField("basics", "phone", e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-slate-400">Availability</label>
                          <input
                            className="input mt-1 w-full text-xs"
                            value={previewData.basics?.availability || ""}
                            onChange={(e) => updateFormField("basics", "availability", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="card p-4 space-y-3 bg-slate-950/40">
                        <p className="text-xs uppercase tracking-wider text-amber-300">About Summary</p>
                        <textarea
                          className="input w-full text-xs h-24 font-sans"
                          value={previewData.about?.summary || ""}
                          onChange={(e) => updateFormField("about", "summary", e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {adminTab === "messages" && (
                <div className="mt-4 h-[520px] overflow-y-auto space-y-4 pr-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wider text-slate-400">
                      Recruiter Contact Submissions
                    </p>
                    <button
                      type="button"
                      className="btn-secondary text-xs px-3 py-1"
                      onClick={loadRecruiterMessages}
                      disabled={loadingMessages}
                    >
                      {loadingMessages ? "Refreshing..." : "Refresh Messages"}
                    </button>
                  </div>

                  {messagesList.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 p-10 text-center text-xs text-slate-400">
                      No recruiter messages received yet. Messages sent via the `#hire-me` contact form will display here.
                    </div>
                  ) : (
                    messagesList.map((m) => (
                      <div key={m._id} className="card p-4 space-y-2 border border-white/10 bg-slate-950/50">
                        <div className="flex items-start justify-between gap-2 text-xs">
                          <div>
                            <span className="font-semibold text-slate-100">{m.name}</span>
                            <span className="text-slate-400 ml-2">&lt;{m.email}&gt;</span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {new Date(m.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-amber-300">{m.subject}</p>
                        <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {m.message}
                        </p>
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleDeleteRecruiterMessage(m._id)}
                            className="text-xs text-rose-300 hover:text-rose-200 underline"
                          >
                            Delete Message
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  Preview the live client using the URL above.
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="button" className="btn-secondary" onClick={handleOpenPreview}>
                    Preview Client
                  </button>
                  <a href={clientUrl} target="_blank" rel="noreferrer" className="btn-secondary">
                    Open in New Tab
                  </a>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {isPreviewOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-panel">
            <div className="modal-header">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Client Preview
                </p>
                <p className="text-sm text-slate-200">{clientUrl}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="badge">
                  Status: {previewStatus === "checking" ? "Checking..." : previewStatus}
                </span>
                <button type="button" className="btn-secondary" onClick={checkClientStatus}>
                  Retry
                </button>
                <a href={clientUrl} target="_blank" rel="noreferrer" className="btn-secondary">
                  Open in New Tab
                </a>
                <button type="button" className="btn-secondary" onClick={handleClosePreview}>
                  Close
                </button>
              </div>
            </div>
            <div className="modal-body">
              {previewMode === "live" ? (
                <iframe title="Client preview" src={clientUrl} className="modal-iframe" />
              ) : (
                <div className="h-full overflow-y-auto p-6">
                  <div className="card p-6">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Hero</p>
                    <h2 className="mt-3 text-2xl font-semibold">
                      {fallbackPreview.hero?.name || "Your Name"}
                    </h2>
                    <p className="mt-2 text-sm text-slate-300">
                      {fallbackPreview.hero?.tagline || "Add a short tagline in hero.tagline"}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                      {(fallbackPreview.hero?.roles || []).map((role) => (
                        <span key={role} className="badge">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
