export interface MetricItem {
  label: string;
  value: string;
}

export interface CaseStudy {
  slug: string;
  project: string;
  title: string;
  problem: string;
  solution: string;
  architecture: string;
  metrics: MetricItem[];
  security: string[];
  takeaways: string[];
}

export interface Project {
  name: string;
  slug?: string;
  tagline: string;
  description: string;
  category: "Full Stack" | "Frontend" | "Backend" | "Mobile" | "DevOps" | "AI/ML";
  tags: string[];
  highlights: string[];
  metrics?: MetricItem[];
  demoUrl?: string;
  repoUrl?: string;
  docsUrl?: string;
  featured?: boolean;
  order?: number;
  caseStudySlug?: string;
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface Experience {
  role: string;
  company: string;
  period: string;
  location?: string;
  achievements: string[];
  technologies: string[];
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  grade?: string;
  details?: string[];
}

export interface Achievement {
  title: string;
  organization: string;
  date: string;
  description: string;
  badge?: string;
}

export interface Portfolio {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  location: string;
  email: string;
  github: string;
  linkedin: string;
  leetcode?: string;
  skills: SkillCategory[];
  projects: Project[];
  caseStudies: CaseStudy[];
  experience: Experience[];
  education: Education[];
  achievements: Achievement[];
}
