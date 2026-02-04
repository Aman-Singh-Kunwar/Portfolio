export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function fetchPortfolio() {
  const response = await fetch(`${API_URL}/api/portfolio`);

  if (!response.ok) {
    throw new Error("Failed to fetch portfolio");
  }

  return response.json();
}