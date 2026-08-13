import { useCallback, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchPortfolio, updatePortfolio } from "../api";
import { RefreshIcon, CheckIcon, EyeIcon, ExternalLinkIcon } from "../components/Icons";

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

export default function JsonEditorPage() {
  const { apiUrl, token } = useAuth();
  const [clientUrl] = useState(() => localStorage.getItem("client_url") || "http://localhost:5173");
  const [jsonText, setJsonText] = useState(() => JSON.stringify(template, null, 2));
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [messageDetails, setMessageDetails] = useState([]);
  const [lastSnapshot, setLastSnapshot] = useState("");
  const [lastLoadedAt, setLastLoadedAt] = useState("");
  
  // Live Preview states
  const [splitPreview, setSplitPreview] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const fileInputRef = useRef(null);

  const statusTone = {
    idle: "text-slate-300",
    loading: "text-sky-200",
    ready: "text-emerald-200",
    saving: "text-amber-200",
    saved: "text-emerald-200",
    error: "text-rose-200"
  };

  const parsedJson = useMemo(() => {
    try {
      return { data: JSON.parse(jsonText), valid: true };
    } catch {
      return { data: null, valid: false };
    }
  }, [jsonText]);

  const isValidJson = parsedJson.valid;

  const handleLoad = useCallback(async () => {
    setStatus("loading");
    setMessage("");
    setMessageDetails([]);

    try {
      const data = await fetchPortfolio(apiUrl);
      const formatted = JSON.stringify(data, null, 2);
      setJsonText(formatted);
      setLastSnapshot(formatted);
      setLastLoadedAt(new Date().toLocaleString());
      setStatus("ready");
      setMessage("Loaded portfolio data from API.");
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
      setMessageDetails(error.details || []);
    }
  }, [apiUrl]);

  const handleSave = useCallback(async () => {
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
      setLastLoadedAt(new Date().toLocaleString());
      setStatus("saved");
      setMessage("Portfolio updated successfully. Refresh preview to see changes.");
      setMessageDetails([]);
      // Refresh preview iframe
      setIframeKey((prev) => prev + 1);
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
      setMessageDetails(error.details || []);
    }
  }, [apiUrl, token, jsonText]);

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setMessage("Formatted JSON.");
      setMessageDetails([]);
    } catch {
      setMessage("Invalid JSON. Fix errors before formatting.");
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      setMessage("JSON copied to clipboard.");
      setMessageDetails([]);
    } catch {
      setMessage("Failed to copy. Try selecting the text manually.");
      setMessageDetails([]);
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
    } catch {
      setMessage("Invalid JSON file. Please check the file content.");
      setMessageDetails([]);
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      {/* Toolbar header */}
      <div className="card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">JSON Code Editor</h2>
            <span className={`badge ${isValidJson ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300" : "border-rose-400/30 bg-rose-500/10 text-rose-300"}`}>
              {isValidJson ? "Valid JSON" : "Invalid JSON"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSplitPreview((prev) => !prev)}
              className={`btn text-xs ${splitPreview ? "bg-amber-400 text-slate-950 font-semibold" : "border border-white/20 text-slate-300 hover:text-white"}`}
            >
              <EyeIcon className="h-3.5 w-3.5" />
              {splitPreview ? "Hide Split Preview" : "Split Live Preview"}
            </button>
            <button
              type="button"
              onClick={() => setIsPreviewModalOpen(true)}
              className="btn-secondary text-xs flex items-center gap-1"
            >
              <EyeIcon className="h-3.5 w-3.5" /> Modal Preview
            </button>
            <div className="badge">
              <span className="text-slate-400">Status</span>
              <span className={statusTone[status]}>{status}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-primary text-xs flex items-center gap-1" onClick={handleLoad}>
            <RefreshIcon className="h-3.5 w-3.5" /> Load Data
          </button>
          <button
            type="button"
            className={`btn-secondary text-xs flex items-center gap-1 ${!isValidJson ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handleSave}
            disabled={!isValidJson}
          >
            <CheckIcon className="h-3.5 w-3.5" /> Save & Publish
          </button>
          <button type="button" className="btn-secondary text-xs" onClick={handleFormat}>
            Format
          </button>
          <button type="button" className="btn-secondary text-xs" onClick={handleValidate}>
            Validate
          </button>
          <button type="button" className="btn-secondary text-xs" onClick={handleCopy}>
            Copy
          </button>
          <button type="button" className="btn-secondary text-xs" onClick={handleReset}>
            Reset
          </button>
          <button type="button" className="btn-secondary text-xs" onClick={handleDownload}>
            Download
          </button>
          <button
            type="button"
            className="btn-secondary text-xs"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleUpload}
          />
        </div>

        {/* Status messages */}
        <div className="mt-3 space-y-1">
          <p className="text-xs text-slate-400">
            Last sync: <span className="text-slate-200">{lastLoadedAt || "Not yet"}</span>
          </p>
          {message && <p className="text-xs text-amber-200">{message}</p>}
          {messageDetails.length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-xs text-rose-200">
              {messageDetails.map((detail, i) => (
                <li key={i}>{detail}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Main Workspace (Split Screen or Full Width) */}
      <div className={`grid gap-4 ${splitPreview ? "lg:grid-cols-2" : "grid-cols-1"}`}>
        {/* Editor */}
        <div className="card p-4">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
            <span className="text-xs font-mono text-slate-400">portfolio.json</span>
            <span className="text-[11px] text-slate-500 font-mono">Lines: {jsonText.split("\n").length}</span>
          </div>
          <textarea
            id="portfolio-json-editor"
            className="h-[calc(100vh-340px)] min-h-[450px] w-full rounded-xl border border-white/10 bg-slate-950/80 p-4 font-mono text-xs text-slate-200 focus:border-amber-300 focus:outline-none resize-none"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            spellCheck={false}
          />
          {!isValidJson && (
            <p className="mt-2 text-xs text-rose-200">
              JSON syntax error detected. Correct errors before publishing.
            </p>
          )}
        </div>

        {/* Split Live iFrame Preview (When enabled) */}
        {splitPreview && (
          <div className="card p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-white">Live Client Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIframeKey((prev) => prev + 1)}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                  title="Reload preview"
                >
                  <RefreshIcon className="h-3 w-3" /> Refresh
                </button>
                <a
                  href={clientUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-300 hover:text-amber-200 flex items-center gap-1 text-[11px]"
                >
                  Open Tab <ExternalLinkIcon className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="flex-1 bg-white rounded-xl overflow-hidden border border-white/10 relative min-h-[450px]">
              <iframe
                key={iframeKey}
                src={clientUrl}
                title="Direct Live Preview"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        )}
      </div>

      {/* Live Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="card w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-950/90">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Live Client Preview</h3>
                <span className="text-xs font-mono text-slate-400">{clientUrl}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIframeKey((prev) => prev + 1)}
                  className="btn-secondary text-xs flex items-center gap-1"
                >
                  <RefreshIcon className="h-3.5 w-3.5" /> Refresh
                </button>
                <a href={clientUrl} target="_blank" rel="noreferrer" className="btn-secondary text-xs flex items-center gap-1">
                  Open Tab <ExternalLinkIcon className="h-3 w-3" />
                </a>
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/20 text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 bg-white relative">
              <iframe
                key={iframeKey}
                src={clientUrl}
                title="Client Preview Modal"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
