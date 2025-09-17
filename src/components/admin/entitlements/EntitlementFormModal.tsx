"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { createEntitlement, updateEntitlement } from "@/lib/entitlement";
import { fetchPlans } from "@/lib/plan";
import type { Entitlement } from "@/types/entitlement";
import type { Plan } from "@/types/plan";

interface EntitlementFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialData?: Entitlement;
  onSaved: (entitlement: Entitlement) => void;
}

interface FormData {
  planId: number;
  version: number;
  max_processors_per_job: number;
  max_weight_per_job: number;
  daily_weight_quota: number;
  max_video_sec: number;
  max_resolution: string;
  watermark: boolean;
  concurrency: number;
}

const defaultFormData: FormData = {
  planId: 0,
  version: 1,
  max_processors_per_job: 2,
  max_weight_per_job: 3,
  daily_weight_quota: 10,
  max_video_sec: 30,
  max_resolution: "480p",
  watermark: true,
  concurrency: 1,
};

const EntitlementFormModal: React.FC<EntitlementFormModalProps> = ({
  open,
  onOpenChange,
  mode,
  initialData,
  onSaved,
}) => {
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      loadPlans();
      if (mode === "edit" && initialData) {
        setFormData({
          planId: initialData.planId,
          version: initialData.version,
          max_processors_per_job: initialData.entitlements.max_processors_per_job,
          max_weight_per_job: initialData.entitlements.max_weight_per_job,
          daily_weight_quota: initialData.entitlements.daily_weight_quota,
          max_video_sec: initialData.entitlements.max_video_sec,
          max_resolution: initialData.entitlements.max_resolution,
          watermark: initialData.entitlements.watermark,
          concurrency: initialData.entitlements.concurrency,
        });
      } else {
        setFormData(defaultFormData);
      }
      setErrors({});
    }
  }, [open, mode, initialData]);

  const loadPlans = async () => {
    try {
      setLoadingPlans(true);
      const response = await fetchPlans();
      setPlans(response.items || []);
    } catch (err) {
      console.error("Failed to load plans:", err);
    } finally {
      setLoadingPlans(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.planId) newErrors.planId = "Plan is required";
    if (formData.version < 1) newErrors.version = "Version must be at least 1";
    if (formData.max_processors_per_job < 1) newErrors.max_processors_per_job = "Must be at least 1";
    if (formData.max_weight_per_job < 1) newErrors.max_weight_per_job = "Must be at least 1";
    if (formData.daily_weight_quota < 1) newErrors.daily_weight_quota = "Must be at least 1";
    if (formData.max_video_sec < 1) newErrors.max_video_sec = "Must be at least 1";
    if (!formData.max_resolution) newErrors.max_resolution = "Resolution is required";
    if (formData.concurrency < 1) newErrors.concurrency = "Must be at least 1";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const payload = {
        planId: formData.planId,
        version: formData.version,
        max_processors_per_job: formData.max_processors_per_job,
        max_weight_per_job: formData.max_weight_per_job,
        daily_weight_quota: formData.daily_weight_quota,
        max_video_sec: formData.max_video_sec,
        max_resolution: formData.max_resolution,
        watermark: formData.watermark,
        concurrency: formData.concurrency,
      };

      let saved: Entitlement;
      if (mode === "create") {
        saved = await createEntitlement(payload);
      } else {
        saved = await updateEntitlement(initialData!.id, payload);
      }

      onSaved(saved);
      onOpenChange(false);
    } catch (err) {
      console.error("Save failed:", err);
      alert(err instanceof Error ? err.message : "Failed to save entitlement");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-800 text-white max-h-[90vh] overflow-hidden z-[100]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Entitlement" : "Edit Entitlement"}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[75vh] overflow-y-auto pr-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Plan Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="planId">Plan *</Label>
                <Select
                  value={formData.planId.toString()}
                  onValueChange={(value) => updateField("planId", parseInt(value))}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 z-[10000]">
                    {loadingPlans ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : (
                      plans.map((plan) => {
                        return (
                          <SelectItem key={plan.id} value={plan.id.toString()}>
                            {plan.name} ({plan.code})
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
                {errors.planId && <p className="text-red-400 text-sm mt-1">{errors.planId}</p>}
              </div>

              <div>
                <Label htmlFor="version">Version *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.version}
                  onChange={(e) => updateField("version", parseInt(e.target.value) || 1)}
                  className="bg-gray-800 border-gray-700"
                />
                {errors.version && <p className="text-red-400 text-sm mt-1">{errors.version}</p>}
              </div>
            </div>

            {/* Processor Limits */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max_processors_per_job">Max Processors per Job *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.max_processors_per_job}
                  onChange={(e) => updateField("max_processors_per_job", parseInt(e.target.value) || 1)}
                  className="bg-gray-800 border-gray-700"
                />
                {errors.max_processors_per_job && <p className="text-red-400 text-sm mt-1">{errors.max_processors_per_job}</p>}
              </div>

              <div>
                <Label htmlFor="max_weight_per_job">Max Weight per Job *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.max_weight_per_job}
                  onChange={(e) => updateField("max_weight_per_job", parseInt(e.target.value) || 1)}
                  className="bg-gray-800 border-gray-700"
                />
                {errors.max_weight_per_job && <p className="text-red-400 text-sm mt-1">{errors.max_weight_per_job}</p>}
              </div>
            </div>

            {/* Quota & Video Limits */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="daily_weight_quota">Daily Weight Quota *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.daily_weight_quota}
                  onChange={(e) => updateField("daily_weight_quota", parseInt(e.target.value) || 1)}
                  className="bg-gray-800 border-gray-700"
                />
                {errors.daily_weight_quota && <p className="text-red-400 text-sm mt-1">{errors.daily_weight_quota}</p>}
              </div>

              <div>
                <Label htmlFor="max_video_sec">Max Video Duration (seconds) *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.max_video_sec}
                  onChange={(e) => updateField("max_video_sec", parseInt(e.target.value) || 1)}
                  className="bg-gray-800 border-gray-700"
                />
                {errors.max_video_sec && <p className="text-red-400 text-sm mt-1">{errors.max_video_sec}</p>}
              </div>
            </div>

            {/* Resolution & Concurrency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max_resolution">Max Resolution *</Label>
                <Select
                  value={formData.max_resolution}
                  onValueChange={(value) => updateField("max_resolution", value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select resolution" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 z-[10000]">
                    <SelectItem value="480p">480p</SelectItem>
                    <SelectItem value="720p">720p</SelectItem>
                    <SelectItem value="1080p">1080p</SelectItem>
                    <SelectItem value="4K">4K</SelectItem>
                  </SelectContent>
                </Select>
                {errors.max_resolution && <p className="text-red-400 text-sm mt-1">{errors.max_resolution}</p>}
              </div>

              <div>
                <Label htmlFor="concurrency">Concurrency Limit *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.concurrency}
                  onChange={(e) => updateField("concurrency", parseInt(e.target.value) || 1)}
                  className="bg-gray-800 border-gray-700"
                />
                {errors.concurrency && <p className="text-red-400 text-sm mt-1">{errors.concurrency}</p>}
              </div>
            </div>

            {/* Watermark */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="watermark"
                checked={formData.watermark}
                onChange={(e) => updateField("watermark", e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="watermark">Apply Watermark</Label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  mode === "create" ? "Create" : "Update"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EntitlementFormModal;
