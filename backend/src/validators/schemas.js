import { z } from "zod";

/**
 * Enterprise Runtime Validation Schemas via Zod
 * Ensures strict typing, payload sanitization, and descriptive API error responses
 */

export const LoginPayloadSchema = z.object({
  token: z.string().min(1, "Admin authentication token is required").trim()
});

export const ContactSubmissionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).trim(),
  email: z.string().email("A valid email address is required").trim().toLowerCase(),
  subject: z.string().min(2, "Subject must be at least 2 characters").max(200).trim(),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000).trim()
});

export const StatusUpdateSchema = z.object({
  status: z.enum(["new", "in_discussion", "interview_scheduled", "archived"], {
    errorMap: () => ({ message: "Invalid status value provided" })
  }),
  notes: z.string().max(1000).optional()
});

export const MetricItemSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1)
});

export const CaseStudySchema = z.object({
  slug: z.string().min(1),
  project: z.string().min(1),
  title: z.string().min(1),
  problem: z.string().min(1),
  solution: z.string().min(1),
  architecture: z.string().min(1),
  metrics: z.array(MetricItemSchema).default([]),
  security: z.array(z.string()).default([]),
  takeaways: z.array(z.string()).default([])
});

export const ProjectSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  tagline: z.string().min(1),
  description: z.string().min(1),
  category: z.string().default("Full Stack"),
  tags: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([]),
  metrics: z.array(MetricItemSchema).optional(),
  demoUrl: z.string().url().optional().or(z.literal("")),
  repoUrl: z.string().url().optional().or(z.literal("")),
  featured: z.boolean().default(false),
  caseStudySlug: z.string().optional()
});

export const PortfolioUpdateSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  tagline: z.string().min(1),
  bio: z.string().min(1),
  location: z.string().min(1),
  email: z.string().email(),
  github: z.string(),
  linkedin: z.string(),
  skills: z.array(z.any()).default([]),
  projects: z.array(ProjectSchema).default([]),
  caseStudies: z.array(CaseStudySchema).default([]),
  experience: z.array(z.any()).default([]),
  education: z.array(z.any()).default([]),
  achievements: z.array(z.any()).default([])
});
