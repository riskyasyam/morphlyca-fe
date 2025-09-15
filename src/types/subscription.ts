
export type UserRole = "ADMIN" | "USER" | (string & {});
export type SubscriptionStatus = "ACTIVE" | "INACTIVE" | "CANCELED" | (string & {});

export type Entitlements = Record<string, string | number | boolean>;
export type PlanLimits = Record<string, string | number | boolean>;

// Item dari GET /user/subscriptions
export interface UserWithSubscription {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
  subscription: {
    id: string;
    planCode: string;
    planName: string;
    planPriority: number;
    status: SubscriptionStatus;
    currentStart: string;
    billingRef: string | null;
    entitlements: Entitlements;
    planLimits: PlanLimits;
  } | null; // jaga-jaga kalau ada user tanpa subscription
}

// GET /user/{userId}/quota
export interface UserQuota {
  userId: string;
  email: string;
  displayName: string;
  plan: {
    code: string;
    name: string;
    priority: number;
  };
  jobsThisMonth: number;
  planEntitlements: Entitlements;
}

// PUT /user/{userId}/subscription body
export interface UpdateUserSubscriptionBody {
  plan: string;            // plan code (mis: "PRO")
  status: SubscriptionStatus; // mis: "ACTIVE" | "INACTIVE"
}