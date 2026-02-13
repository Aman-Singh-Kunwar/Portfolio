export function getApiUrl() {
  const defaultApiUrl = import.meta.env.PROD
    ? "https://aman-singh-kunwar-portfolio.onrender.com"
    : "http://localhost:4000";
  return import.meta.env.VITE_API_URL || defaultApiUrl;
}

export async function fetchPortfolio(apiUrl) {
  const response = await fetch(`${apiUrl}/api/portfolio`);

  if (!response.ok) {
    throw new Error("Failed to fetch portfolio");
  }

  return response.json();
}

export async function updatePortfolio(apiUrl, token, payload) {
  const response = await fetch(`${apiUrl}/api/portfolio`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const message = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(message.error || "Failed to update portfolio");
  }

  return response.json();
}
