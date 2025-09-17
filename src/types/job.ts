// types/job.ts
export type JobStatus = "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED";

export interface Job {
  id: string;
  status: JobStatus;
  processors?: string[];
  createdAt?: string;
  finishedAt?: string | null;
  error?: string | null;
  resultUrl?: string;
  // tambahkan field lain sesuai backend (output, logs, dll) bila perlu
}

export interface QuotaToday {
  date?: string;
  used: number;
  remaining: number;
  dailyLimit: number;
}
