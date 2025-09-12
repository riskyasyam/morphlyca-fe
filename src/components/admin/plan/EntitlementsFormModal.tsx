"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { PlanEntitlementsPayload, PlanEntitlement } from "@/types/plan";
import { createPlanEntitlement } from "@/lib/plan";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  planId: number;
  onCreated?: (e: PlanEntitlement) => void;
}

export default function EntitlementsFormModal({ open, onOpenChange, planId, onCreated }: Props) {
  const [form, setForm] = useState<PlanEntitlementsPayload>({
    version: 1,
    max_video_sec: 60,
    max_resolution: "1080p",
    concurrency: 1,
    watermark: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof PlanEntitlementsPayload>(key: K, value: PlanEntitlementsPayload[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const created = await createPlanEntitlement(planId, form);
      onCreated?.(created);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create entitlements");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !saving && onOpenChange(v)}>
      <DialogContent className="sm:max-w-md bg-black border border-gray-800 z-[80]">
        <DialogHeader>
          <DialogTitle className="text-white">Add Entitlements</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label className="text-gray-300">Version</Label>
            <Input
              type="number"
              min={1}
              value={form.version}
              onChange={(e) => update("version", Number(e.target.value))}
              className="bg-gray-900 border-gray-700 text-white"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-gray-300">Max Video (sec)</Label>
            <Input
              type="number"
              min={1}
              value={form.max_video_sec}
              onChange={(e) => update("max_video_sec", Number(e.target.value))}
              className="bg-gray-900 border-gray-700 text-white"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-gray-300">Max Resolution</Label>
            <Input
              value={form.max_resolution}
              onChange={(e) => update("max_resolution", e.target.value)}
              placeholder="720p / 1080p / 4K"
              className="bg-gray-900 border-gray-700 text-white"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-gray-300">Concurrency</Label>
            <Input
              type="number"
              min={1}
              value={form.concurrency}
              onChange={(e) => update("concurrency", Number(e.target.value))}
              className="bg-gray-900 border-gray-700 text-white"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="watermark"
              type="checkbox"
              checked={form.watermark}
              onChange={(e) => update("watermark", e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="watermark" className="text-gray-300">Watermark</Label>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-gray-300 hover:text-white hover:bg-gray-800" disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}