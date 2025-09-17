export type FeatureStatus = "ACTIVE" | "INACTIVE" | (string & {});
export type FeatureType =
  | "feature"
  | "toggle"
  | "config"
  | "processor"
  | "processor_option"
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
  description?: string | null;
  category?: string | null; // New field for processor option grouping
}

// List response (buat fleksibel: meta opsional)
export interface FeaturesListResponse {
  items: Feature[];
  total?: number;
  skip?: number;
  take?: number;
}

// Processor option categories
export type ProcessorOptionCategory =
  | "face_swapper_model"
  | "face_enhancer_model"
  | "frame_enhancer_model"
  | "face_detector_model"
  | "lip_syncer_model"
  | "deep_swapper_model"
  | (string & {});