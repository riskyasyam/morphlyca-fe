export interface Subscription {
    id: string;
    userId: string;
    plan: "FREE" | "PRO" | "ENTERPRISE";
    status: "ACTIVE" | "INACTIVE" | "CANCELLED";
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
}