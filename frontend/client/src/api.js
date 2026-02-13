const DEFAULT_API_URL = import.meta.env.PROD
  ? "https://aman-singh-kunwar-portfolio.onrender.com"
  : "http://localhost:4000";

export const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

export async function fetchPortfolio({ timeoutMs = 4500 } = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  let response;

  try {
    response = await fetch(`${API_URL}/api/portfolio`, {
      signal: controller.signal
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Portfolio API timeout");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error("Failed to fetch portfolio");
  }

  return response.json();
}
