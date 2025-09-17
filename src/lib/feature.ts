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
  try {
    const res = await api.get("/features/model-categories");
    return res.data;
  } catch (error: any) {
    // If endpoint doesn't exist (400/404), return static categories
    if (error?.response?.status === 400 || error?.response?.status === 404) {
      console.log("Model categories endpoint not available, using static fallback");
      return [
        "face_swapper_model",
        "face_enhancer_model", 
        "frame_enhancer_model",
        "face_detector_model",
        "expression_restorer_model",
        "face_editor_model",
        "frame_colorizer_model",
        "lip_syncer_model",
        "deep_swapper_model"
      ];
    }
    console.error("Model categories endpoint error:", error);
    // For other errors, still return static fallback
    return [
      "face_swapper_model",
      "face_enhancer_model", 
      "frame_enhancer_model",
      "face_detector_model",
      "expression_restorer_model",
      "face_editor_model",
      "frame_colorizer_model",
      "lip_syncer_model",
      "deep_swapper_model"
    ];
  }
}

// Get models by category
export async function getModelsByCategory(category: string): Promise<Feature[]> {
  try {
    const res = await api.get(`/features/processor-options/category/${category}`);
    return res.data;
  } catch (error: any) {
    // If endpoint doesn't exist, return empty array (will use static fallback)
    if (error?.response?.status === 400 || error?.response?.status === 404) {
      console.log(`Models for category ${category} endpoint not available`);
      return [];
    }
    console.error(`Models for category ${category} error:`, error);
    return [];
  }
}

// Get core processors
export async function getCoreProcessors(): Promise<Feature[]> {
  try {
    const res = await api.get("/features/core-processors");
    return res.data;
  } catch (error) {
    console.error("Core processors endpoint not available:", error);
    return [];
  }
}

// Get all processor options
export async function getAllProcessorOptions(): Promise<Feature[]> {
  try {
    const res = await api.get("/features/processor-options");
    return res.data;
  } catch (error) {
    console.error("Processor options endpoint not available:", error);
    return [];
  }
}