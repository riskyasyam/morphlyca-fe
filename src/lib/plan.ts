import { Plan, PlansListResponse } from "@/types/plan";
import { api } from "./api";

export const fetchPlans = async (): Promise<PlansListResponse> => { 
    const response = await api.get("/plans"); 
    return response.data; 
};

export const fetchPlanById = async (id: string): Promise<Plan> => { 
    const response = await api.get(`/plans/${id}`); 
    return response.data; 
}

export const createPlan = async (planData: Partial<Plan>): Promise<Plan> => { 
    const response = await api.post("/plans", planData); 
    return response.data; 
};

export const updatePlan = async (id: string, planData: Partial<Plan>): Promise<Plan> => { 
    const response = await api.put(`/plans/${id}`, planData); 
    return response.data; 
}

export const deletePlan = async (id: string): Promise<void> => { 
    await api.delete(`/plans/${id}`); 
}