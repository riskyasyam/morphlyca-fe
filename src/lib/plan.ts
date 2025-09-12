import { Plan, PlansListResponse, PlanDetail, PlanEntitlementsPayload, PlanEntitlement } from "@/types/plan";
import { api } from "./api";

export const fetchPlans = async (): Promise<PlansListResponse> => {
  const response = await api.get("/plans");
  return response.data;
};

// ganti tipe return ke PlanDetail (karena ada entitlements)
export const fetchPlanById = async (id: string): Promise<PlanDetail> => {
  const response = await api.get(`/plans/${id}`);
  return response.data;
};

export const createPlan = async (data: { name: string; code: string; priority: number }): Promise<Plan> => {
  const response = await api.post("/plans", data);
  return response.data;
};

export const updatePlan = async (id: string, data: { name: string; code: string; priority: number }): Promise<Plan> => {
  const response = await api.patch(`/plans/${id}`, data);
  return response.data;
};

export const deletePlan = async (id: string): Promise<void> => {
  await api.delete(`/plans/${id}`);
};


export const createPlanEntitlement = async (
  planId: string | number,
  payload: PlanEntitlementsPayload
): Promise<PlanEntitlement> => {
  const res = await api.post(`/plans/${planId}/entitlements`, payload);
  return res.data;
};