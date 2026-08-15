import { config } from "../config.js";

export function getSwaggerSpec() {
  const serverUrl = config.env === "production"
    ? "https://aman-singh-kunwar-portfolio1.onrender.com"
    : `http://localhost:${config.port}`;

  return {
    openapi: "3.0.3",
    info: {
      title: "Aman Singh Kunwar — Portfolio & Admin RESTful API",
      version: "2.5.0",
      description: `
## Architecture & Overview

RESTful API service powering the portfolio client, admin control center, and recruiter CRM pipeline.

---

### Core Specifications
1. **HMAC-SHA256 Authentication**: Authenticated endpoints (\`PUT /api/portfolio\`, \`GET /api/contact\`, etc.) require a signed session token in the \`Authorization: Bearer <token>\` header.
2. **Conditional Caching & ETags**: \`GET /api/portfolio\` supports MD5 content hashing. If unchanged, the server returns \`304 Not Modified\` with zero payload.
3. **Rate Limiting**: Sliding-window limiter allows up to 120 requests/minute per IP with strict limits on contact inquiries.
4. **Request Correlation**: Each request is assigned a unique UUID \`X-Request-Id\` in response headers for distributed logging.
5. **Compression & Security**: Gzip/Deflate compression enabled alongside CORS origin validation and security headers.

---

### Authentication Guide
1. Send a \`POST /api/auth/login\` request with your admin token.
2. Copy the returned \`sessionToken\`.
3. Click **Authorize** in the top right corner.
4. Paste the token and confirm. Protected endpoints will execute authenticated.
      `,
      contact: {
        name: "Aman Singh Kunwar",
        email: "amansinghkunwar07@gmail.com",
        url: "https://aman-singh-kunwar-portfolio1.onrender.com"
      },
      license: {
        name: "MIT License",
        url: "https://opensource.org/licenses/MIT"
      }
    },
    servers: [
      {
        url: serverUrl,
        description: config.env === "production" ? "Production API Gateway (Render Cloud)" : "Local Development Server"
      },
      {
        url: "https://aman-singh-kunwar-portfolio1.onrender.com",
        description: "Live Production Cloud Gateway"
      }
    ],
    tags: [
      {
        name: "System & Health",
        description: "Health checks, uptime monitoring, process telemetry, and web crawler directives"
      },
      {
        name: "Authentication",
        description: "Admin credential verification and 24-hour HMAC session token issuance"
      },
      {
        name: "Portfolio Content",
        description: "Core portfolio data engine: Projects, Technical Case Studies, Skills, and Timeline"
      },
      {
        name: "Recruiter CRM & Leads",
        description: "Inbound hiring inquiry intake, spam validation, and hiring pipeline status management"
      },
      {
        name: "Visitor Analytics",
        description: "Live traffic counter and 7-day daily visitor trend aggregation"
      }
    ],
    paths: {
      "/api/health": {
        get: {
          tags: ["System & Health"],
          summary: "Service Health & Telemetry",
          description: "Returns operational health status, active environment, process uptime, and service identification. Used by uptime monitors and container liveness probes.",
          responses: {
            200: {
              description: "Service is fully operational",
              headers: {
                "Cache-Control": { schema: { type: "string", example: "no-store" } },
                "X-Request-Id": { schema: { type: "string", example: "c4b3a1d2-9876-4abc-9ef0-1234567890ab" } }
              },
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/HealthResponse" },
                  example: {
                    status: "ok",
                    env: "production",
                    uptime: 86420,
                    service: "portfolio-backend"
                  }
                }
              }
            }
          }
        }
      },
      "/api/auth/login": {
        post: {
          tags: ["Authentication"],
          summary: "Authenticate Admin & Issue HMAC Session",
          description: "Verifies the administrative master token and generates a cryptographically signed 3-part HMAC-SHA256 session token valid for 24 hours.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" },
                example: {
                  token: "admin-secret-token"
                }
              }
            }
          },
          responses: {
            200: {
              description: "Authentication successful — session token issued",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/LoginResponse" },
                  example: {
                    success: true,
                    token: "1786854660454.1786941060454.d3a8e9f2b1c4...",
                    expiresAt: 1786941060454
                  }
                }
              }
            },
            400: {
              description: "Invalid request body or missing token",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { error: "Token is required" }
                }
              }
            },
            401: {
              description: "Unauthorized — invalid admin credentials",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { error: "Invalid admin token" }
                }
              }
            }
          }
        }
      },
      "/api/portfolio": {
        get: {
          tags: ["Portfolio Content"],
          summary: "Retrieve Full Portfolio Dataset",
          description: "Returns the complete portfolio schema including candidate details, projects, technical case studies, work experience, achievements, and skills. Supports HTTP ETag conditional caching (\`If-None-Match\`).",
          responses: {
            200: {
              description: "Full portfolio JSON document",
              headers: {
                ETag: { schema: { type: "string", example: '"a1b2c3d4e5f6"' }, description: "Content MD5 hash for browser caching" },
                "Cache-Control": { schema: { type: "string", example: "public, max-age=60, stale-while-revalidate=300" } },
                "X-Request-Id": { schema: { type: "string", example: "7e8f9a0b-1234-4567-89ab-cdef01234567" } }
              },
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/PortfolioData" }
                }
              }
            },
            304: {
              description: "Not Modified — cached client data is fresh and up-to-date"
            },
            500: {
              description: "Internal server error fetching portfolio storage",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        },
        put: {
          tags: ["Portfolio Content"],
          summary: "Overwrite Portfolio Dataset (Admin Only)",
          description: "Validates and atomically replaces the full portfolio database document. Requires HMAC Bearer session token authentication.",
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PortfolioData" }
              }
            }
          },
          responses: {
            200: {
              description: "Portfolio updated and persisted successfully in MongoDB",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/PortfolioData" }
                }
              }
            },
            400: {
              description: "Schema validation failure",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ValidationErrorResponse" },
                  example: {
                    error: "Portfolio validation failed",
                    details: ["projects[0].slug must be unique", "skills[2].level must be between 0 and 100"]
                  }
                }
              }
            },
            401: {
              description: "Unauthorized — missing or invalid Bearer token",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { error: "Admin authorization required" }
                }
              }
            }
          }
        }
      },
      "/api/contact": {
        post: {
          tags: ["Recruiter CRM & Leads"],
          summary: "Submit Inbound Recruiter Inquiry",
          description: "Saves a new recruiter message into the lead pipeline with initial status 'new' and timestamps. Protected by rate limiting.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ContactSubmission" },
                example: {
                  name: "Sarah Jenkins",
                  email: "sarah.jenkins@techcorp.io",
                  subject: "Senior Full Stack Opportunity — TechCorp",
                  message: "Hi Aman, we were thoroughly impressed with your Curriculum Management System and distributed Redis concurrency work. We'd love to schedule an introductory call."
                }
              }
            }
          },
          responses: {
            201: {
              description: "Inquiry received and queued in CRM",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "Message delivered successfully" }
                    }
                  }
                }
              }
            },
            400: {
              description: "Missing required fields or invalid email format",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ValidationErrorResponse" }
                }
              }
            },
            429: {
              description: "Rate limit exceeded — too many submissions from this IP",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { error: "Too many requests. Please try again later." }
                }
              }
            }
          }
        },
        get: {
          tags: ["Recruiter CRM & Leads"],
          summary: "List All Hiring Inquiries (Admin Only)",
          description: "Fetches all recruiter leads sorted by most recent, with status pipeline tags and sender details.",
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: "Array of recruiter messages",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/ContactMessage" }
                  }
                }
              }
            },
            401: {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        }
      },
      "/api/contact/{id}/status": {
        patch: {
          tags: ["Recruiter CRM & Leads"],
          summary: "Update Recruiter Lead Status (Admin Only)",
          description: "Updates the pipeline stage of an inquiry: \`new\` ➔ \`in_discussion\` ➔ \`interview_scheduled\` ➔ \`archived\`.",
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Unique MongoDB ID or identifier of the lead"
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status"],
                  properties: {
                    status: {
                      type: "string",
                      enum: ["new", "in_discussion", "interview_scheduled", "archived"],
                      example: "interview_scheduled"
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: "Lead status updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ContactMessage" }
                }
              }
            },
            400: { description: "Invalid status value" },
            401: { description: "Unauthorized" },
            404: { description: "Lead record not found" }
          }
        }
      },
      "/api/visits": {
        get: {
          tags: ["Visitor Analytics"],
          summary: "Get Visitor Metrics & 7-Day Trend",
          description: "Returns the all-time unique visitor counter and an aggregated array of daily visitor counts over the past 7 days for admin charting.",
          responses: {
            200: {
              description: "Visitor telemetry dataset",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/VisitAnalytics" },
                  example: {
                    count: 1842,
                    trends: [
                      { date: "2026-08-09", count: 124 },
                      { date: "2026-08-10", count: 189 },
                      { date: "2026-08-11", count: 215 },
                      { date: "2026-08-12", count: 178 },
                      { date: "2026-08-13", count: 240 },
                      { date: "2026-08-14", count: 298 },
                      { date: "2026-08-15", count: 142 }
                    ]
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ["Visitor Analytics"],
          summary: "Register Unique Visitor Session",
          description: "Increments the global visitor counter and records daily session attendance. Debounced on client side.",
          responses: {
            200: {
              description: "Session counted successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      count: { type: "integer", example: 1843 }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/sitemap.xml": {
        get: {
          tags: ["System & SEO"],
          summary: "Dynamic XML Sitemap",
          description: "Generates an XML sitemap dynamically on the fly containing all projects, case studies, and achievements for search engine indexing.",
          responses: {
            200: {
              description: "Valid XML sitemap with <urlset>",
              content: {
                "application/xml": {
                  schema: { type: "string" }
                }
              }
            }
          }
        }
      },
      "/robots.txt": {
        get: {
          tags: ["System & SEO"],
          summary: "Web Crawler Directives (robots.txt)",
          description: "Directs web indexing bots to canonical sitemap location and allows crawling of all public routes.",
          responses: {
            200: {
              description: "Robots directive text file",
              content: {
                "text/plain": {
                  schema: { type: "string" }
                }
              }
            }
          }
        }
      }
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          description: "HMAC-SHA256 signed session token from `POST /api/auth/login`"
        }
      },
      schemas: {
        HealthResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "ok" },
            env: { type: "string", example: "production" },
            uptime: { type: "integer", example: 86400 },
            service: { type: "string", example: "portfolio-backend" }
          }
        },
        LoginRequest: {
          type: "object",
          required: ["token"],
          properties: {
            token: { type: "string", description: "Admin master password token" }
          }
        },
        LoginResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            token: { type: "string", description: "HMAC signed token (issuedAt.expiresAt.signature)" },
            expiresAt: { type: "integer", description: "Unix timestamp in milliseconds" }
          }
        },
        ErrorResponse: {
          type: "object",
          properties: {
            error: { type: "string", example: "Invalid credentials or missing resource" }
          }
        },
        ValidationErrorResponse: {
          type: "object",
          properties: {
            error: { type: "string", example: "Validation failed" },
            details: { type: "array", items: { type: "string" } }
          }
        },
        ContactSubmission: {
          type: "object",
          required: ["name", "email", "message"],
          properties: {
            name: { type: "string", example: "Sarah Jenkins" },
            email: { type: "string", format: "email", example: "sarah.jenkins@techcorp.io" },
            subject: { type: "string", example: "Full Stack Developer Opportunity" },
            message: { type: "string", example: "We'd love to connect regarding our open role." }
          }
        },
        ContactMessage: {
          type: "object",
          properties: {
            id: { type: "string", example: "msg_66bf538a1a" },
            name: { type: "string", example: "Sarah Jenkins" },
            email: { type: "string", example: "sarah.jenkins@techcorp.io" },
            subject: { type: "string", example: "Full Stack Developer Opportunity" },
            message: { type: "string", example: "We'd love to connect..." },
            status: {
              type: "string",
              enum: ["new", "in_discussion", "interview_scheduled", "archived"],
              example: "new"
            },
            createdAt: { type: "string", format: "date-time", example: "2026-08-15T04:30:00.000Z" }
          }
        },
        VisitAnalytics: {
          type: "object",
          properties: {
            count: { type: "integer", example: 1842 },
            trends: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string", format: "date", example: "2026-08-15" },
                  count: { type: "integer", example: 142 }
                }
              }
            }
          }
        },
        PortfolioData: {
          type: "object",
          properties: {
            meta: {
              type: "object",
              properties: {
                title: { type: "string", example: "Aman Singh Kunwar | Full Stack Developer" },
                description: { type: "string" }
              }
            },
            hero: {
              type: "object",
              properties: {
                name: { type: "string", example: "Aman Singh Kunwar" },
                roles: { type: "array", items: { type: "string" }, example: ["Full Stack Developer", "Backend & Systems Engineer"] },
                tagline: { type: "string" }
              }
            },
            projects: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Curriculum Management System (CMS)" },
                  slug: { type: "string", example: "curriculum-management-system" },
                  description: { type: "string", example: "Institutional academic syllabus management system live across 12+ schools." },
                  tech: { type: "array", items: { type: "string" }, example: ["React 19", "Node.js", "Express 5", "MongoDB", "Cloudinary"] },
                  highlights: { type: "array", items: { type: "string" } },
                  links: {
                    type: "object",
                    properties: {
                      demo: { type: "string", example: "https://cms.dbuu.ac.in/" },
                      repo: { type: "string", example: "https://github.com/Syllabus2-0/schoolsofdbuu" }
                    }
                  }
                }
              }
            },
            caseStudies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  slug: { type: "string", example: "eventory-concurrency" },
                  project: { type: "string", example: "Eventory" },
                  title: { type: "string", example: "Zero-Overbooking Concurrency: Distributed Mutexes with Redis Lua & Kafka" },
                  problem: { type: "string", example: "Thousands of users attempting to purchase the same seat simultaneously." },
                  architecture: { type: "array", items: { type: "string" } },
                  metrics: { type: "array", items: { type: "string" }, example: ["100k req/s", "Zero Overbooking"] },
                  security: { type: "string" },
                  takeaway: { type: "string" }
                }
              }
            },
            achievements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string", example: "1st Place Winner — HacktheWinter National Hackathon" },
                  slug: { type: "string", example: "hackthewinter-national-level-hackathon" },
                  issuer: { type: "string", example: "National Level Hackathon" },
                  coverImage: { type: "string", example: "/images/hackthewinter.jpg" }
                }
              }
            },
            skills: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", example: "React.js" },
                  category: { type: "string", example: "Frontend" },
                  level: { type: "integer", example: 92 }
                }
              }
            },
            contact: {
              type: "object",
              properties: {
                email: { type: "string", example: "amansinghkunwar07@gmail.com" },
                phone: { type: "string", example: "+91 7983932346" },
                address: { type: "string", example: "Dehradun, Uttarakhand, India" }
              }
            }
          }
        }
      }
    }
  };
}
