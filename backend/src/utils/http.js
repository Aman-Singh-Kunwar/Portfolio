export class HttpError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function sendError(res, error, includeDetails = false) {
  const statusCode = error.statusCode || 500;
  const payload = {
    error: statusCode >= 500 ? "Internal server error" : error.message
  };

  if (includeDetails && error.details) {
    payload.details = error.details;
  }

  return res.status(statusCode).json(payload);
}
