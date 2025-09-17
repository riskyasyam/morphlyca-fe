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

export async function createUploadedProcess(formData: FormData): Promise<{ id: string }> {
  try {
    console.log("Submitting form data to /jobs/uploaded-process endpoint...");
    
    // Log form data for debugging (without file contents)
    const debugData: Record<string, any> = {};
    formData.forEach((value, key) => {
      if (value instanceof File) {
        debugData[key] = `File: ${value.name} (${value.size} bytes, ${value.type})`;
      } else {
        debugData[key] = typeof value === 'string' && value.length > 100 
          ? `${value.substring(0, 100)}...` 
          : value;
      }
    });
    console.log("Form data contents:", debugData);
    
    const { data } = await api.post("/jobs/uploaded-process", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    console.log("Job creation successful:", data);
    return data;
  } catch (error: any) {
    console.error("Job creation failed:", error);
    
    // Enhanced error handling with more specific error messages
    if (error?.response?.status === 400) {
      const errorData = error.response.data;
      console.error("400 Bad request details:", errorData);
      
      let errorMessage = "Bad request";
      if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.errors) {
        errorMessage = `Validation errors: ${errorData.errors.join(', ')}`;
      }
      
      throw new Error(errorMessage);
    } else if (error?.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    } else if (error?.response?.status === 403) {
      const errorData = error.response.data;
      console.error("403 Forbidden details:", errorData);
      
      // Check for specific quota-related errors
      if (errorData?.message?.includes('quota') || errorData?.message?.includes('limit')) {
        throw new Error(`Quota exceeded: ${errorData.message}`);
      } else if (errorData?.message?.includes('permission')) {
        throw new Error(`Permission denied: ${errorData.message}`);
      } else {
        throw new Error(`Access denied. ${errorData?.message || 'You may have insufficient quota or permissions.'}`);
      }
    } else if (error?.response?.status === 413) {
      throw new Error("File too large. Please use smaller files.");
    } else if (error?.response?.status === 422) {
      const errorData = error.response.data;
      throw new Error(`Validation failed: ${errorData?.message || 'Invalid input data'}`);
    } else if (error?.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error?.message) {
      throw new Error(error.message);
    }
    
    throw new Error("Failed to create job. Please try again.");
  }
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