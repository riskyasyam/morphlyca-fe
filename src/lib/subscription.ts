import { api } from "./api";
import type { UpdateUserSubscriptionBody, UserQuota, UserWithSubscription } from "@/types/subscription";

// GET /user/subscriptions
export const fetchUserSubscriptions = async (): Promise<UserWithSubscription[]> => {
  const res = await api.get("/user/subscriptions");
  return res.data;
};

// GET /user/{id}/quota
export const fetchUserQuota = async (userId: string): Promise<UserQuota> => {
  const res = await api.get(`/user/${userId}/quota`);
  return res.data;
};

// PUT /user/{id}/subscription
export const updateUserSubscription = async (userId: string, body: UpdateUserSubscriptionBody) => {
  const res = await api.put(`/user/${userId}/subscription`, body);
  return res.data;
};