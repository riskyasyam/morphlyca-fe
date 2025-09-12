export type FeatureStatus = "ACTIVE" | "INACTIVE" | (string & {});
export type FeatureType =
  | "feature"
  | "toggle"
  | "config"
  | (string & {});

// Satu item feature
export interface Feature {
  id: number;
  name: string;
  value?: string;
  type: FeatureType;
  status: FeatureStatus;
  weight: number;
  createdAt: string; // ISO string
}

// List response (buat fleksibel: meta opsional)
export interface FeaturesListResponse {
  items: Feature[];
  total?: number;
  skip?: number;
  take?: number;
}