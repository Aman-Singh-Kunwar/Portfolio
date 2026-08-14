import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getApiUrl, validateToken } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => 
    localStorage.getItem("admin_token") || sessionStorage.getItem("admin_token") || ""
  );
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem("admin_api_url") || getApiUrl());
  const [accentColor, setAccentColorState] = useState(
    () => localStorage.getItem("admin_accent_color") || "amber"
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem("admin_api_url", apiUrl);
  }, [apiUrl]);

  useEffect(() => {
    document.documentElement.setAttribute("data-accent", accentColor);
    document.body.setAttribute("data-accent", accentColor);
    localStorage.setItem("admin_accent_color", accentColor);
  }, [accentColor]);

  const setAccentColor = useCallback((color) => {
    setAccentColorState(color);
  }, []);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        await validateToken(apiUrl, token);
        if (!cancelled) {
          setIsAuthenticated(true);
        }
      } catch {
        if (!cancelled) {
          setToken("");
          localStorage.removeItem("admin_token");
          sessionStorage.removeItem("admin_token");
          setIsAuthenticated(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (newToken, newApiUrl, rememberMe = false) => {
    const url = newApiUrl || apiUrl;
    const sessionToken = await validateToken(url, newToken);

    const tokenToSave = sessionToken || newToken;
    setToken(tokenToSave);
    setApiUrl(url);
    if (rememberMe) {
      localStorage.setItem("admin_token", tokenToSave);
      sessionStorage.removeItem("admin_token");
    } else {
      sessionStorage.setItem("admin_token", tokenToSave);
      localStorage.removeItem("admin_token");
    }
    localStorage.setItem("admin_api_url", url);
    setIsAuthenticated(true);
  }, [apiUrl]);

  const logout = useCallback(() => {
    setToken("");
    setIsAuthenticated(false);
    localStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_token");
  }, []);

  const value = useMemo(
    () => ({ token, apiUrl, setApiUrl, accentColor, setAccentColor, isAuthenticated, isLoading, login, logout }),
    [token, apiUrl, accentColor, setAccentColor, isAuthenticated, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
