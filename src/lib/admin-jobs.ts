// lib/admin-jobs.ts
import { api } from "./api";

export interface Job {
  id: string;
  userId: string;
  status: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED";
  processors: string[];
  options: any;
  weightUsed: number;
  progressPct: number;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  sourceAsset?: any;
  targetAsset?: any;
  outputAsset?: any;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  authSub: string;
  role: string;
  createdAt: string;
}

export interface UserJobsResponse {
  user: User;
  jobs: Job[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ProcessorAnalytics {
  name: string;
  count: number;
  totalWeight: number;
  successCount: number;
  failedCount: number;
  successRate: string;
  uniqueUsers: number;
  avgWeight: string;
}

export interface ProcessorAnalyticsResponse {
  processors: ProcessorAnalytics[];
  summary: {
    totalJobs: number;
    dateRange: {
      from: string;
      to: string;
      days: number;
    };
    mostPopular: string;
    totalProcessorUsage: number;
  };
}

export interface UserStats {
  user: {
    id: string;
    email: string;
    displayName: string;
    role: string;
    memberSince: string;
  };
  stats: {
    totalJobs: number;
    totalWeight: number;
    succeededJobs: number;
    failedJobs: number;
    queuedJobs: number;
    runningJobs: number;
    successRate: string;
    avgWeight: string;
  };
}

export interface UserAnalyticsResponse {
  users: UserStats[];
  summary: {
    totalUsers: number;
    dateRange: {
      from: string;
      to: string;
      days: number;
    };
    totalJobs: number;
    totalWeight: number;
  };
}

export interface SummaryAnalyticsResponse {
  overview: {
    totalJobsAllTime: number;
    recentJobs: number;
    uniqueActiveUsers: number;
    successRate: string;
  };
  statusDistribution: {
    queued: number;
    running: number;
    succeeded: number;
    failed: number;
  };
  dailyActivity: Array<{
    date: string;
    count: number;
    total_weight: number;
  }>;
  dateRange: {
    from: string;
    to: string;
    days: number;
  };
}

// API Functions
export const fetchUserJobs = async (
  userId: string,
  page = 1,
  limit = 20,
  status?: string
): Promise<UserJobsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (status) params.append('status', status);

  const res = await api.get(`/jobs/admin/users/${userId}/jobs?${params}`);
  return res.data;
};

export const fetchProcessorAnalytics = async (
  days = 30,
  userId?: string
): Promise<ProcessorAnalyticsResponse> => {
  const params = new URLSearchParams({ days: days.toString() });
  if (userId) params.append('userId', userId);

  const res = await api.get(`/jobs/admin/analytics/processors?${params}`);
  return res.data;
};

export const fetchUserAnalytics = async (
  days = 30,
  limit = 50
): Promise<UserAnalyticsResponse> => {
  const params = new URLSearchParams({
    days: days.toString(),
    limit: limit.toString(),
  });

  const res = await api.get(`/jobs/admin/analytics/users?${params}`);
  return res.data;
};

export const fetchSummaryAnalytics = async (
  days = 30
): Promise<SummaryAnalyticsResponse> => {
  const params = new URLSearchParams({ days: days.toString() });

  const res = await api.get(`/jobs/admin/analytics/summary?${params}`);
  return res.data;
};