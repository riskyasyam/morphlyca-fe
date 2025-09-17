import type { Feature, FeaturesListResponse } from "@/types/feature";
import { api } from "./api";

// fetch per halaman
export const fetchFeaturesPaged = async (
  params: { skip?: number; take?: number } = {}
): Promise<FeaturesListResponse> => {
  const { skip = 0, take = 200 } = params; // sesuaikan default take
  const res = await api.get("/features", { params: { skip, take } });
  return res.data;
};

// fetch semua halaman sampai habis
export const fetchAllFeatures = async (): Promise<Feature[]> => {
  const take = 200; // boleh kamu naikkan sesuai kebutuhan
  let skip = 0;
  let acc: Feature[] = [];

  while (true) {
    const page = await fetchFeaturesPaged({ skip, take });
    const items = page.items ?? [];
    acc = acc.concat(items);

    const total = page.total ?? acc.length; // fallback kalau total tak ada
    if (acc.length >= total || items.length === 0) break;

    skip += take;
  }

  return acc;
};

// GET /features
export const fetchFeatures = async (): Promise<FeaturesListResponse> => {
  const res = await api.get("/features");
  return res.data;
};

// GET /features/:id
export const fetchFeatureById = async (id: string | number): Promise<Feature> => {
  const res = await api.get(`/features/${id}`);
  return res.data;
};

// POST /features
export const createFeature = async (data: {
  name: string;
  value?: string | null;
  type: string;
  status: string;
  weight: number;
}): Promise<Feature> => {
  const res = await api.post("/features", data);
  return res.data;
};

// PATCH /features/:id
// (sesuai spesifikasi kamu: weight TIDAK ikut di update)
export const updateFeature = async (
  id: string | number,
  data: { name: string; value?: string | null; type: string; status: string }
): Promise<Feature> => {
  const res = await api.patch(`/features/${id}`, data);
  return res.data;
};

// DELETE /features/:id
export const deleteFeature = async (id: string | number): Promise<void> => {
  await api.delete(`/features/${id}`);
};

// Get model categories
export async function getModelCategories(): Promise<string[]> {
  const response = await api.get("/features/model-categories", {
    method: "GET",
  });
  return response.data;
}

// Get models by category
export async function getModelsByCategory(category: string): Promise<Feature[]> {
  const response = await api.get(`/features/processor-options/category/${category}`, {
    method: "GET",
  });
  return response.data;
}

// Get core processors
export async function getCoreProcessors(): Promise<Feature[]> {
  const response = await api.get("/features/core-processors", {
    method: "GET",
  });
  return response.data;
}

// Get all processor options
export async function getAllProcessorOptions(): Promise<Feature[]> {
  const response = await api.get("/features/processor-options", {
    method: "GET",
  });
  return response.data;
}