export interface Plan {
  id: number;
  code: string;
  name: string;
  priority: number;
  createdAt: string; 
}

export interface PlanEntitlementsPayload {
  version: number;
  max_video_sec: number;
  max_resolution: string;
  concurrency: number;
  watermark: boolean;
}

export interface PlanEntitlement {
  id: number;
  planId: number;
  version: number;
  entitlements: {
    watermark: boolean;
    concurrency: number;
    max_video_sec: number;
    max_resolution: string;
    // server bisa kirim field ekstra — kita toleran
    [key: string]: string | number | boolean;
  };
}

// Detail plan (GET /plans/:id)
export interface PlanDetail extends Plan {
  entitlements?: PlanEntitlement[];
}

export interface PlansListResponse {
  items: Plan[];
  total: number;
  skip: number;
  take: number;
}