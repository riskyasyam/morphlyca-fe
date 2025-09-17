// lib/media.ts
import { api } from "./api";
import type { MediaAsset, MediaListResponse } from "@/types/media";

const BASE_PATH = "/media-assets/output/facefusion";


export const getMediaOutputTotal = async (): Promise<number> => {
  const res = await api.get<MediaListResponse>("/media-assets/output/facefusion", {
    params: { skip: 0, take: 1 },
  });
  return res.data?.pagination?.total ?? (res.data?.data?.length ?? 0);
};

export const fetchMediaAssets = async (skip = 0, take = 50): Promise<MediaListResponse> => {
  const res = await api.get(BASE_PATH, { params: { skip, take } });
  return res.data;
};

// ambil semua halaman (kalau backend paging). fallback: kalau tidak ada pagination, langsung pakai data.
export const fetchAllMediaAssets = async (): Promise<MediaAsset[]> => {
  const first = await fetchMediaAssets(0, 100);
  if (!first.pagination) return first.data ?? [];

  let items = first.data ?? [];
  let { hasMore, take, skip } = first.pagination;

  while (hasMore) {
    const next = await fetchMediaAssets(skip + take, take);
    items = items.concat(next.data ?? []);
    if (!next.pagination) break;
    hasMore = next.pagination.hasMore;
    take = next.pagination.take;
    skip = next.pagination.skip;
  }
  return items;
};

// Bangun URL file untuk preview.
// Set salah satu env berikut di FE:
// - NEXT_PUBLIC_MINIO_PUBLIC_BASE (contoh: https://minio.example.com)  -> url = {base}/{path}
// - atau gunakan NEXT_PUBLIC_API_URL kalau backend mem-proxy path tersebut.
export const buildMediaUrl = (asset: MediaAsset): string | undefined => {
  const base =
    process.env.NEXT_PUBLIC_MINIO_PUBLIC_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    "";

  if (!base) return undefined;
  if (/^https?:\/\//i.test(asset.path)) return asset.path; // sudah absolute
  return `${base.replace(/\/$/, "")}/${asset.path.replace(/^\//, "")}`;
};

export function buildProxyUrl(a: MediaAsset) {
  const p = `${a.bucket}/${a.objectKey}`;
  const qs = new URLSearchParams({ p }).toString();
  return `/api/media/proxy?${qs}`;
}

export function buildDownloadUrl(a: MediaAsset) {
  const p = `${a.bucket}/${a.objectKey}`;
  const filename = a.objectKey.split("/").pop() || "download";
  const qs = new URLSearchParams({ p, filename }).toString();
  return `/api/media/download?${qs}`;
}

export interface DeleteMediaResponse {
  message: string;
  deletedAsset: {
    id: string;
    objectKey: string;
    type: string;
    mimeType: string;
    sizeBytes?: string;
    createdAt: string;
    relatedJobs?: { id: string; status: string }[];
  };
}

export async function deleteMediaAsset(id: string): Promise<DeleteMediaResponse> {
  const res = await api.delete(`/media-assets/output/${id}`);
  return res.data;
}