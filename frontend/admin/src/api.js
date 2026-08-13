export function getApiUrl() {
  const defaultApiUrl = import.meta.env.PROD
    ? "https://aman-singh-kunwar-portfolio.onrender.com"
    : "http://localhost:4000";
  return import.meta.env.VITE_API_URL || defaultApiUrl;
}

export async function validateToken(apiUrl, token) {
  try {
    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });

    if (response.ok) {
      const data = await response.json();
      return data.token;
    }
  } catch {
    // Fallback if login endpoint unreachable
  }

  const fallbackRes = await fetch(`${apiUrl}/api/contact`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!fallbackRes.ok) {
    const body = await fallbackRes.json().catch(() => ({ error: "Invalid token or session expired" }));
    throw new Error(body.error || "Authentication failed");
  }

  return token;
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
    const error = new Error(message.error || "Failed to update portfolio");
    error.details = message.details;
    throw error;
  }

  return response.json();
}

export async function fetchMessages(apiUrl, token) {
  const response = await fetch(`${apiUrl}/api/contact`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const message = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(message.error || "Failed to fetch recruiter messages");
  }

  return response.json();
}

export async function deleteMessage(apiUrl, token, id) {
  const response = await fetch(`${apiUrl}/api/contact/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const message = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(message.error || "Failed to delete message");
  }

  return response.json();
}

export async function updateMessageStatus(apiUrl, token, id, status) {
  const response = await fetch(`${apiUrl}/api/contact/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });

  if (!response.ok) {
    const message = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(message.error || "Failed to update lead status");
  }

  return response.json();
}

export async function fetchVisits(apiUrl) {
  try {
    const response = await fetch(`${apiUrl}/api/visits`);
    if (!response.ok) return { count: 0 };
    return response.json();
  } catch {
    return { count: 0 };
  }
}
