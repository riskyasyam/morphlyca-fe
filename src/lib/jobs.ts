// lib/jobs.ts
import { api } from "./api";
import type { Job, JobStatus, QuotaToday } from "@/types/job";

// Normalisasi fleksibel response quota-today
function normalizeQuota(raw: any): QuotaToday {
  const used =
    raw?.used ??
    raw?.usedWeight ??
    raw?.todayUsed ??
    0;

  const dailyLimit =
    raw?.dailyLimit ??
    raw?.limit ??
    raw?.planLimit ??
    raw?.planEntitlements?.daily_weight_quota ??
    0;

  // kalau backend sudah kasih remaining langsung, pakai itu
  const remainingDirect =
    raw?.remaining ??
    raw?.remainingWeight ??
    raw?.left ??
    undefined;

  const remaining = typeof remainingDirect === "number"
    ? remainingDirect
    : Math.max(dailyLimit - used, 0);

  return {
    date: raw?.date ?? raw?.forDate ?? undefined,
    used,
    remaining,
    dailyLimit,
  };
}

export async function fetchQuotaToday(): Promise<QuotaToday> {
  const { data } = await api.get("/jobs/quota-today");
  return normalizeQuota(data);
}

export async function createUploadedProcess(form: FormData): Promise<{ id: string }> {
  const { data } = await api.post("/jobs/uploaded-process", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  // banyak backend mengembalikan { id } / { jobId } / { job: { id } }
  const id = data?.id ?? data?.jobId ?? data?.job?.id;
  if (!id) throw new Error("Gagal membuat job (id tidak ditemukan di respons)");
  return { id };
}

export async function getJob(id: string): Promise<Job> {
  const { data } = await api.get(`/jobs/${id}`);
  return data;
}

export async function requeueJob(id: string): Promise<Job> {
  const { data } = await api.post(`/jobs/${id}/requeue`, {});
  return data;
}

export const fetchJobs = async (params: { take?: number; skip?: number } = {}): Promise<Job[]> => {
  const res = await api.get("/jobs", { params: { take: params.take ?? 5, skip: params.skip ?? 0 } });
  // backend bisa return {items, ...} atau array. Normalize saja:
  return Array.isArray(res.data) ? res.data as Job[] : (res.data?.items ?? []);
};