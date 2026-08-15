# Security Policy & Defensive Engineering Measures

This document outlines the security architecture and defensive controls implemented across this repository.

---

### 1. Timing-Attack Protection (`crypto.timingSafeEqual`)
Standard string equality comparisons (such as `a === b`) evaluate characters sequentially and return `false` at the first mismatched byte. This introduces minute execution time variations that allow attackers to infer secrets byte-by-byte through statistical timing analysis. To prevent this, all token and password validations in this application use Node.js's native `crypto.timingSafeEqual` over fixed-length buffer representations, guaranteeing constant-time comparison regardless of how many characters match.

### 2. CORS Policy & Origin Allowlists
Cross-Origin Resource Sharing (CORS) is configured via Express middleware to allow incoming requests exclusively from explicitly trusted origins specified in the `CORS_ORIGINS` environment variable (e.g., the production client portfolio domain and local development ports `5173`/`5174`). Wildcard access (`*`) is disabled for mutating endpoints, preventing unauthorized third-party websites from executing administrative actions or scraping protected resources via cross-origin browser requests.

### 3. Rate Limiting
To mitigate brute-force authentication attacks and denial-of-service spamming, sensitive endpoints are guarded with IP-based rate limiting via `express-rate-limit`:
- **Contact Form (`POST /api/contact`)**: Limited to 5 submissions per 15-minute window per IP to prevent spam.
- **Admin Login & Protected APIs**: Rate-limited globally to prevent password guessing and resource exhaustion.
- When thresholds are exceeded, the API returns a standard `429 Too Many Requests` status with standard `RateLimit-*` response headers.

### 4. Session Lifecycle & Server-Side Revocation
Authentication uses signed HMAC-SHA256 session tokens with an embedded 24-hour expiration timestamp. Unlike purely stateless JWT architectures where tokens cannot be revoked before their natural expiration, active sessions in this application are stored in the Redis/cache tier (`session:<token>`). When an administrator logs out via `POST /api/auth/logout`, the session key is immediately deleted from the cache, instantly invalidating the token for all subsequent requests.

---

### 📬 Reporting a Vulnerability

If you discover a security vulnerability in this project, please open a private GitHub Security Advisory or reach out directly to the repository maintainer.
