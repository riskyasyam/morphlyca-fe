// This file is deprecated - entitlements are now managed in /admin/entitlements
// Please use the new entitlements management page instead
import { DialogHeader } from "@/components/ui/dialog";
import { fetchPlanById } from "@/lib/plan";
import type { PlanDetail } from "@/types/plan";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  planId: number | null;
}

export default function EntitlementsViewModal({ open, onOpenChange, planId }: Props) {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<PlanDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || planId == null) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const d = await fetchPlanById(String(planId));
        setDetail(d);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load entitlements");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, planId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-black border border-gray-800 z-[80]">
        <DialogClose
          className="absolute right-4 top-4 rounded-md p-1 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </DialogClose>
        <DialogHeader>
          <DialogTitle className="text-white">Entitlements</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          </div>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : !detail?.entitlements || detail.entitlements.length === 0 ? (
          <p className="text-gray-400">No entitlements found for this plan.</p>
        ) : (
          <div className="space-y-3">
            {detail.entitlements.map((e) => (
              <div key={e.id} className="border border-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-semibold">Version {e.version}</p>
                  <span className="text-xs text-gray-400">ID: {e.id}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(e.entitlements).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-gray-400">{k}</span>
                      <span className="text-gray-200">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
