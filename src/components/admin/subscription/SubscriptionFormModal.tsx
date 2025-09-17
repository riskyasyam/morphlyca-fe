"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import type { SubscriptionStatus } from "@/types/subscription";
import { updateUserSubscription } from "@/lib/subscription";

import { fetchPlans } from "@/lib/plan";
import type { Plan } from "@/types/plan";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: string | null;
  currentPlanCode?: string;
  currentStatus?: SubscriptionStatus;
  onSaved?: () => void;
}

const STATUS_OPTS: SubscriptionStatus[] = ["ACTIVE", "INACTIVE", "CANCELED"];

export default function SubscriptionFormModal({
  open,
  onOpenChange,
  userId,
  currentPlanCode,
  currentStatus,
  onSaved,
}: Props) {
  const [plan, setPlan] = useState<string>(currentPlanCode ?? "");
  const [status, setStatus] = useState<SubscriptionStatus>(currentStatus ?? "ACTIVE");

  // Plans dropdown state
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // load plans setiap modal dibuka
  useEffect(() => {
    if (!open) return;

    (async () => {
      try {
        setPlansLoading(true);
        setPlansError(null);
        const res = await fetchPlans(); // { items, total, ... }
        const items = res.items ?? [];
        setPlans(items);

        // reset form berdasarkan current props
        const normalizedCurrent = (currentPlanCode ?? "").toUpperCase();

        if (normalizedCurrent && items.some(p => p.code.toUpperCase() === normalizedCurrent)) {
          setPlan(normalizedCurrent);
        } else if (items.length > 0) {
          setPlan(items[0].code.toUpperCase());
        } else {
          setPlan(""); // tidak ada plan
        }

        setStatus((currentStatus as SubscriptionStatus) ?? "ACTIVE");
        setError(null);
      } catch (err) {
        setPlansError(err instanceof Error ? err.message : "Failed to load plans");
        // fallback: tetap set plan ke current jika ada
        setPlan((currentPlanCode ?? "").toUpperCase());
      } finally {
        setPlansLoading(false);
      }
    })();
  }, [open, currentPlanCode, currentStatus]);

  const selectablePlans = useMemo(
    () => plans.map(p => ({ code: p.code.toUpperCase(), label: `${p.name} (${p.code.toUpperCase()})` })),
    [plans]
  );

  const canSubmit = !!userId && !!plan && !plansLoading && !saving && selectablePlans.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    try {
      setSaving(true);
      setError(null);
      await updateUserSubscription(userId, { plan, status });
      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update subscription");
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
          <DialogTitle className="text-white">Update Subscription</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Plan dropdown */}
          <div className="grid gap-2">
            <Label className="text-gray-300">Plan</Label>
            <div className="flex items-center gap-2">
              <select
                className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-md h-10 px-3 disabled:opacity-60"
                value={plan}
                onChange={(e) => setPlan(e.target.value.toUpperCase())}
                disabled={plansLoading || selectablePlans.length === 0}
                required
              >
                {selectablePlans.length === 0 ? (
                  <option value="">No plans available</option>
                ) : (
                  selectablePlans.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.label}
                    </option>
                  ))
                )}
              </select>

              {plansLoading && <Loader2 className="w-4 h-4 animate-spin text-white" />}
            </div>
            {plansError && <p className="text-xs text-red-400">{plansError}</p>}
          </div>

          {/* Status */}
          <div className="grid gap-2">
            <Label className="text-gray-300">Status</Label>
            <select
              className="bg-gray-900 border border-gray-700 text-white rounded-md h-10 px-3"
              value={status}
              onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
              required
            >
              {STATUS_OPTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

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
            <Button type="submit" disabled={!canSubmit} className="bg-blue-600 hover:bg-blue-700">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
