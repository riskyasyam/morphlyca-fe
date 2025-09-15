export type MediaType = "VIDEO" | "IMAGE" | "AUDIO" | "OTHER";

export interface MediaJob {
  id: string;
  processors: string[];
  status: string;
  createdAt: string;
  finishedAt?: string | null;
}

export interface MediaAsset {
  id: string;
  type: MediaType;
  bucket: string;
  objectKey: string; // e.g. results/.../result.mp4
  path: string;      // e.g. facefusion-output/results/.../result.mp4
  mimeType: string;  // e.g. video/mp4
  width: number | null;
  height: number | null;
  durationSec: number | null;
  sizeBytes: string; // string di response
  createdAt: string;
  outputForJobs?: MediaJob[];
}

export interface MediaListResponse {
  data: MediaAsset[];
  pagination?: {
    skip: number;
    take: number;
    total: number;
    hasMore: boolean;
  };
}