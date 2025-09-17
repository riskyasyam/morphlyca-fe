"use client";

import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose,
} from "@/components/ui/dialog";
import { Loader2, X } from "lucide-react";
import { fetchUserQuota } from "@/lib/subscription";
import type { UserQuota } from "@/types/subscription";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: string | null;
}

export default function QuotaViewModal({ open, onOpenChange, userId }: Props) {
  const [loading, setLoading] = useState(false);
  const [quota, setQuota] = useState<UserQuota | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !userId) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const d = await fetchUserQuota(userId);
        setQuota(d);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load quota");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, userId]);

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
          <DialogTitle className="text-white">User Quota</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          </div>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : !quota ? (
          <p className="text-gray-400">Data tidak tersedia.</p>
        ) : (
          <div className="space-y-4">
            <div className="border border-gray-800 rounded-lg p-3">
              <p className="text-white font-semibold">{quota.displayName}</p>
              <p className="text-gray-300 text-sm">{quota.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="border border-gray-800 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Plan</p>
                <p className="text-white font-semibold">
                  {quota.plan.name} ({quota.plan.code})
                </p>
                <p className="text-gray-400 text-xs mt-1">Priority: {quota.plan.priority}</p>
              </div>

              <div className="border border-gray-800 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Jobs This Month</p>
                <p className="text-white font-semibold">{quota.jobsThisMonth}</p>
              </div>
            </div>

            <div className="border border-gray-800 rounded-lg p-3">
              <p className="text-white font-semibold mb-2">Entitlements</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(quota.planEntitlements).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-gray-400">{k}</span>
                    <span className="text-gray-200">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
