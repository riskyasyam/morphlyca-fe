"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import type { Feature } from "@/types/feature";
import { createFeature, updateFeature } from "@/lib/feature";

type Mode = "create" | "edit";

// hanya izinkan 2 tipe ini di UI
const ALLOWED_TYPES = ["feature", "processor"] as const;
const coerceType = (t: string) =>
  (ALLOWED_TYPES.includes(t as typeof ALLOWED_TYPES[number]) ? t : "feature");

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: Mode;
  initialData?: Feature | null;
  onSaved?: (f: Feature) => void;
}

export default function FeatureFormModal({
  open,
  onOpenChange,
  mode,
  initialData,
  onSaved,
}: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("feature");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [weight, setWeight] = useState<number>(0);

  // flag untuk menghapus value saat edit
  const [removeValue, setRemoveValue] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setName(initialData.name);
      setType(coerceType(initialData.type)); // paksa ke salah satu opsi
      setStatus((initialData.status as "ACTIVE" | "INACTIVE") ?? "ACTIVE");
      setWeight(initialData.weight ?? 0);
      setRemoveValue(false); // reset checkbox
    } else {
      setName("");
      setType("feature");
      setStatus("ACTIVE");
      setWeight(0);
      setRemoveValue(false);
    }
    setError(null);
  }, [mode, initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      let saved: Feature;
      if (mode === "create") {
        // Tidak kirim 'value' sama sekali
        saved = await createFeature({ name, type, status, weight });
      } else {
        if (!initialData) throw new Error("Data feature tidak tersedia");

        // Kirim 'value: null' jika ingin menghapus value di server
        // (Jika backend maunya "", ganti ke payload.value = "")
        const payload: { name: string; type: string; status: string; value?: string | null } = {
          name,
          type,
          status,
        };
        if (removeValue) payload.value = null;

        saved = await updateFeature(initialData.id, payload);
      }
      onSaved?.(saved);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan feature");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !saving && onOpenChange(v)}>
      <DialogContent className="sm:max-w-md bg-black border border-gray-800 z-[80]">
        <DialogClose
          className="absolute right-4 top-4 rounded-md p-1 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </DialogClose>

        <DialogHeader>
          <DialogTitle className="text-white">
            {mode === "create" ? "Create Feature" : "Edit Feature"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="grid gap-2">
            <Label className="text-gray-300">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="output_video_preset"
              className="bg-gray-900 border-gray-700 text-white"
              required
            />
          </div>

          {/* Type (dropdown) */}
          <div className="grid gap-2">
            <Label className="text-gray-300">Type</Label>
            <select
              className="bg-gray-900 border border-gray-700 text-white rounded-md h-10 px-3"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="feature">feature</option>
              <option value="processor">processor</option>
            </select>
          </div>

          {/* Status */}
          <div className="grid gap-2">
            <Label className="text-gray-300">Status</Label>
            <select
              className="bg-gray-900 border border-gray-700 text-white rounded-md h-10 px-3"
              value={status}
              onChange={(e) => setStatus(e.target.value as "ACTIVE" | "INACTIVE")}
              required
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          {/* Weight */}
          <div className="grid gap-2">
            <Label className="text-gray-300">
              Weight {mode === "edit" && <span className="text-gray-500">(read-only on edit)</span>}
            </Label>
            <Input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="bg-gray-900 border-gray-700 text-white"
              required={mode === "create"}
              readOnly={mode === "edit"}
            />
          </div>

          {/* Remove current value (only edit & if there is a value) */}
          {mode === "edit" && initialData && initialData.value !== "" && (
            <div className="flex items-center gap-2 pt-1">
              <input
                id="removeValue"
                type="checkbox"
                className="h-4 w-4"
                checked={removeValue}
                onChange={(e) => setRemoveValue(e.target.checked)}
              />
              <Label htmlFor="removeValue" className="text-gray-300">
                Remove current value{initialData.value ? ` (“${initialData.value}”)` : ""}
              </Label>
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-gray-300 hover:text-white hover:bg-gray-800"
              disabled={saving}
            >
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
