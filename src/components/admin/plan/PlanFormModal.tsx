"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Plan } from "@/types/plan";
import { createPlan, updatePlan } from "@/lib/plan";
import { Loader2 } from "lucide-react";

type Mode = "create" | "edit";

interface PlanFormModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: Mode;
  initialData?: Plan | null;
  onSaved?: (plan: Plan) => void; // callback setelah sukses
}

export default function PlanFormModal({
  open,
  onOpenChange,
  mode,
  initialData,
  onSaved,
}: PlanFormModalProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [priority, setPriority] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // isi form saat edit
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setName(initialData.name ?? "");
      setCode(initialData.code ?? "");
      setPriority(initialData.priority ?? 1);
    } else {
      setName("");
      setCode("");
      setPriority(1);
    }
    setError(null);
  }, [mode, initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      let result: Plan;
      if (mode === "create") {
        result = await createPlan({ name, code, priority });
      } else {
        if (!initialData) throw new Error("Data plan tidak tersedia");
        result = await updatePlan(String(initialData.id), { name, code, priority });
      }
      onSaved?.(result);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan plan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !saving && onOpenChange(v)}>
      <DialogContent className="sm:max-w-md bg-black border border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">
            {mode === "create" ? "Create Plan" : "Edit Plan"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-gray-300">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Pro / Premium / Basic"
              className="bg-gray-900 border-gray-700 text-white"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="code" className="text-gray-300">Code</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="PRO / BASIC / TES"
              className="bg-gray-900 border-gray-700 text-white uppercase"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="priority" className="text-gray-300">Priority</Label>
            <Input
              id="priority"
              type="number"
              min={0}
              max={10}
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="bg-gray-900 border-gray-700 text-white"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

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