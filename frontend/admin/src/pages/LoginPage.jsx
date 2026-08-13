import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getApiUrl } from "../api";
import { LockIcon } from "../components/Icons";

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem("admin_api_url") || getApiUrl());
  const [tokenInput, setTokenInput] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setError("Admin token is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(tokenInput.trim(), apiUrl.trim(), rememberMe);
    } catch (err) {
      setError(err.message || "Authentication failed. Check your admin token and API URL.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 text-slate-100">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 shadow-xl">
            <LockIcon className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold text-white">Portfolio Admin Access</h1>
          <p className="mt-2 text-xs text-slate-400">
            Enter your security token to manage content, leads, and projects
          </p>
        </div>

        {/* Login card */}
        <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5">
          <div>
            <label htmlFor="login-api-url" className="text-xs uppercase tracking-[0.2em] text-slate-400">
              API Server URL
            </label>
            <input
              id="login-api-url"
              className="input mt-2 text-xs"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:4000"
            />
          </div>

          <div>
            <label htmlFor="login-token" className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Admin Access Token
            </label>
            <div className="relative mt-2">
              <input
                id="login-token"
                type={showToken ? "text" : "password"}
                className="input pr-12 text-xs"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Enter token"
                autoComplete="current-password"
                autoFocus
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white"
                onClick={() => setShowToken((v) => !v)}
                aria-label={showToken ? "Hide token" : "Show token"}
                tabIndex={-1}
              >
                {showToken ? (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m2 2 20 20" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.9 4.2A10.5 10.5 0 0 1 12 4c5 0 8.5 4 10 8a13.5 13.5 0 0 1-3 4.5" />
                    <path d="M6.4 6.4A13.5 13.5 0 0 0 2 12c1.5 4 5 8 10 8a10.5 10.5 0 0 0 4.1-.8" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-white/20 bg-slate-900 text-amber-400 focus:ring-amber-400"
            />
            <label htmlFor="remember-me" className="text-xs text-slate-300 cursor-pointer select-none">
              Remember login on this browser
            </label>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`btn-primary w-full justify-center ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/30 border-t-slate-900" />
                Authenticating…
              </>
            ) : (
              "Sign In to Admin"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
