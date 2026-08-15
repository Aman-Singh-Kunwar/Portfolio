export interface AdminAuth {
  token: string;
  expiresAt: number;
}

export interface RecruiterLead {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  ip?: string;
  read: boolean;
  status: "new" | "in_discussion" | "interview_scheduled" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface VisitStats {
  totalVisits: number;
  uniqueVisitors: number;
  recentVisits: Array<{
    date: string;
    count: number;
  }>;
}
