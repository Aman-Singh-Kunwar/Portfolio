import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchPortfolio, getApiUrl, updatePortfolio } from "./api";

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
    ctaSecondary: "Download Resume"
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
  const [token, setToken] = useState(() => localStorage.getItem("admin_token") || "");
  const [clientUrl, setClientUrl] = useState(
    () => localStorage.getItem("client_url") || "http://localhost:5173"
  );
  const [jsonText, setJsonText] = useState(() => JSON.stringify(template, null, 2));
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [lastSnapshot, setLastSnapshot] = useState("");
  const [lastLoadedAt, setLastLoadedAt] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState("offline");
  const [previewStatus, setPreviewStatus] = useState("idle");
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("admin_token", token);
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
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setMessage("Formatted JSON.");
    } catch (error) {
      setMessage("Invalid JSON. Fix errors before formatting.");
    }
  };

  const handleSave = async () => {
    setStatus("saving");
    setMessage("");

    try {
      const parsed = JSON.parse(jsonText);
      await updatePortfolio(apiUrl, token, parsed);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      setLastSnapshot(formatted);
      setLastLoadedAt(formatTime());
      setStatus("saved");
      setMessage("Portfolio updated successfully.");
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  };

  const handleReset = () => {
    if (!lastSnapshot) {
      setMessage("No previous snapshot to restore.");
      return;
    }
    setJsonText(lastSnapshot);
    setMessage("Restored last loaded snapshot.");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      setMessage("JSON copied to clipboard.");
    } catch (error) {
      setMessage("Failed to copy. Try selecting the text manually.");
    }
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
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      JSON.parse(text);
      setJsonText(text);
      setMessage("Loaded JSON from file.");
    } catch (error) {
      setMessage("Invalid JSON file. Please check the file content.");
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
                Load live data, edit it safely, and publish updates. This panel works with the
                schema from `data/portfolio.json`.
              </p>
            </div>
            <div className="badge">
              <span className="text-slate-400">Status</span>
              <span className={statusTone[status] || "text-slate-200"}>{status}</span>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.8fr]">
          <div className="flex flex-col gap-6">
            <div className="card p-6 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  API URL
                </label>
                <input
                  className="input mt-2"
                  value={apiUrl}
                  onChange={(event) => setApiUrl(event.target.value)}
                  placeholder="http://localhost:4000"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Client Preview URL
                </label>
                <input
                  className="input mt-2"
                  value={clientUrl}
                  onChange={(event) => setClientUrl(event.target.value)}
                  placeholder="http://localhost:5173"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Admin Token
                </label>
                <input
                  className="input mt-2"
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  placeholder="change-me"
                />
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
                  <li>Keep the JSON valid before saving.</li>
                  <li>Use unique project `slug` values for clean URLs.</li>
                  <li>Save updates after editing and refresh the client.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Portfolio JSON
                </label>
                <p className="text-xs text-slate-400">Edit with care and keep the structure intact.</p>
              </div>
              <div className="badge">
                <span className="text-slate-400">JSON</span>
                <span className={isValidJson ? "text-emerald-200" : "text-rose-200"}>
                  {isValidJson ? "Valid" : "Invalid"}
                </span>
              </div>
            </div>
            <textarea
              className="mt-4 h-[520px] w-full rounded-xl border border-white/10 bg-slate-950/70 p-4 font-mono text-xs text-slate-200 focus:border-amber-300 focus:outline-none"
              value={jsonText}
              onChange={(event) => setJsonText(event.target.value)}
            />

            {!isValidJson && (
              <p className="mt-4 text-xs text-rose-200">
                JSON is invalid. Fix errors before saving or previewing the client.
              </p>
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

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="card p-5">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Basics</p>
                      <div className="mt-3 space-y-2 text-sm text-slate-300">
                        <p>{fallbackPreview.basics?.role || "Role"}</p>
                        <p>{fallbackPreview.basics?.location || "Location"}</p>
                        <p>{fallbackPreview.basics?.email || "Email"}</p>
                      </div>
                    </div>
                    <div className="card p-5">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Stats</p>
                      <div className="mt-3 space-y-2 text-sm text-slate-300">
                        <p>
                          Projects:{" "}
                          {fallbackPreview.stats?.projects ??
                            (fallbackPreview.projects || []).length}
                        </p>
                        <p>Achievements: {fallbackPreview.stats?.achievements ?? 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 card p-6">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      Tech Stack
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(fallbackPreview.techStack || []).map((tech) => (
                        <span key={tech} className="badge">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                          Projects
                        </p>
                        <h3 className="mt-2 text-lg font-semibold">Project preview</h3>
                      </div>
                      <span className="badge">
                        {(fallbackPreview.projects || []).length} total
                      </span>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      {(fallbackPreview.projects || []).map((project) => (
                        <div
                          key={project.slug || project.name}
                          className="rounded-xl border border-white/10 bg-white/5 p-4"
                        >
                          <p className="text-sm font-semibold">{project.name}</p>
                          <p className="mt-2 text-xs text-slate-300">
                            {project.description || "Add a short description."}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-300">
                            {(project.tech || []).slice(0, 4).map((tech) => (
                              <span key={tech} className="badge">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
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
