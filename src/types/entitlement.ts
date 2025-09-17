export interface EntitlementData {
  max_processors_per_job: number;
  max_weight_per_job: number;
  daily_weight_quota: number;
  max_video_sec: number;
  max_resolution: string;
  watermark: boolean;
  concurrency: number;
}

export interface Entitlement {
  id: number;
  planId: number;
  version: number;
  entitlements: EntitlementData;
  createdAt: string;
  updatedAt: string;
  plan: {
    id: number;
    code: string;
    name: string;
  };
}

export interface EntitlementsListResponse {
  items: Entitlement[];
  total?: number;
  skip?: number;
  take?: number;
}

export type ResolutionType = "480p" | "720p" | "1080p" | "4K";
