import { api } from "./api";
import type { Entitlement } from "@/types/entitlement";

// Get all entitlements
export const fetchEntitlements = async (): Promise<Entitlement[]> => {
  const res = await api.get("/entitlements");
  return res.data;
};

// Get entitlement by ID
export const fetchEntitlementById = async (id: number): Promise<Entitlement> => {
  const res = await api.get(`/entitlements/${id}`);
  return res.data;
};

// Get entitlements by plan ID
export const fetchEntitlementsByPlanId = async (planId: number): Promise<Entitlement[]> => {
  const res = await api.get(`/entitlements/plan/${planId}`);
  return res.data;
};

// Get latest entitlement for plan
export const fetchLatestEntitlementByPlanId = async (planId: number): Promise<Entitlement> => {
  const res = await api.get(`/entitlements/plan/${planId}/latest`);
  return res.data;
};

// Create entitlement
export const createEntitlement = async (data: {
  planId: number;
  version: number;
  max_processors_per_job: number;
  max_weight_per_job: number;
  daily_weight_quota: number;
  max_video_sec: number;
  max_resolution: string;
  watermark: boolean;
  concurrency: number;
}): Promise<Entitlement> => {
  const res = await api.post("/entitlements", data);
  return res.data;
};

// Update entitlement
export const updateEntitlement = async (
  id: number,
  data: Partial<{
    max_processors_per_job: number;
    max_weight_per_job: number;
    daily_weight_quota: number;
    max_video_sec: number;
    max_resolution: string;
    watermark: boolean;
    concurrency: number;
  }>
): Promise<Entitlement> => {
  const res = await api.put(`/entitlements/${id}`, data);
  return res.data;
};

// Delete entitlement
export const deleteEntitlement = async (id: number): Promise<void> => {
  await api.delete(`/entitlements/${id}`);
};
