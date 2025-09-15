"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Eye, Loader2, Pencil, X } from "lucide-react";
import { fetchUserSubscriptions } from "@/lib/subscription";
import type { SubscriptionStatus, UserWithSubscription } from "@/types/subscription";
import QuotaViewModal from "@/components/admin/subscription/QuotaViewModal";
import SubscriptionFormModal from "@/components/admin/subscription/SubscriptionFormModal";

const statusBadgeClass = (s?: SubscriptionStatus) =>
  s === "ACTIVE"
    ? "bg-green-600 hover:bg-green-700 text-white"
    : s === "CANCELED"
    ? "bg-red-600 hover:bg-red-700 text-white"
    : "bg-gray-600 hover:bg-gray-700 text-gray-100";

export default function SubscriptionTable() {
  const [rows, setRows] = useState<UserWithSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // search
  const [query, setQuery] = useState("");

  // modals
  const [quotaOpen, setQuotaOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithSubscription | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchUserSubscriptions();
      setRows(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      r.displayName.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      (r.subscription?.planCode ?? "").toLowerCase().includes(q)
    );
  }, [rows, query]);

  const formatDate = (iso?: string | null) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleDateString("id-ID", {
        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-black border border-gray-800 rounded-lg overflow-hidden relative z-[50]">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between gap-4 relative z-[60] pointer-events-auto">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-white truncate">
              Subscriptions ({filtered.length})
            </h3>
            <p className="text-sm text-gray-400 mt-1">Users and their subscription info</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, or plan code…"
                className="bg-gray-900 border-gray-700 text-white w-72 pr-8"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-auto max-h-[70vh]">
          <Table className="min-w-full">
            <TableHeader className="sticky top-0 z-10 bg-black/90 backdrop-blur supports-[backdrop-filter]:bg-black/60">
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-300 font-medium pl-6">Name</TableHead>
                <TableHead className="text-gray-300 font-medium">Email</TableHead>
                <TableHead className="text-gray-300 font-medium">Role</TableHead>
                <TableHead className="text-gray-300 font-medium">Plan</TableHead>
                <TableHead className="text-gray-300 font-medium">Status</TableHead>
                <TableHead className="text-gray-300 font-medium">Current Start</TableHead>
                <TableHead className="text-gray-300 font-medium">User ID</TableHead>
                <TableHead className="text-right text-gray-300 font-medium pr-10">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((u) => {
                const s = u.subscription;
                return (
                  <TableRow key={u.id} className="border-gray-800 hover:bg-gray-900/30 transition-colors">
                    <TableCell className="font-medium text-white pl-6">{u.displayName}</TableCell>
                    <TableCell className="text-gray-300">{u.email}</TableCell>
                    <TableCell className="text-gray-300">{u.role}</TableCell>
                    <TableCell className="text-gray-300">
                      {s ? `${s.planName} (${s.planCode})` : "FREE (default)"}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusBadgeClass(s?.status)}>{s?.status ?? "INACTIVE"}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-400">{formatDate(s?.currentStart)}</TableCell>
                    <TableCell className="text-gray-500 font-mono text-xs">{u.id.slice(0, 8)}…</TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Quota */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-300 hover:text-white hover:bg-gray-800"
                          title="View quota"
                          onClick={() => {
                            setSelectedUser(u);
                            setQuotaOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {/* Update Subscription */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-300 hover:text-white hover:bg-gray-800"
                          title="Update subscription"
                          onClick={() => {
                            setSelectedUser(u);
                            setEditOpen(true);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-gray-400">
                    {query ? "No users match your search." : "No data."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal: View Quota */}
      <QuotaViewModal
        open={quotaOpen}
        onOpenChange={setQuotaOpen}
        userId={selectedUser?.id ?? null}
      />

      {/* Modal: Update Subscription */}
      <SubscriptionFormModal
        open={editOpen}
        onOpenChange={setEditOpen}
        userId={selectedUser?.id ?? null}
        currentPlanCode={selectedUser?.subscription?.planCode ?? "FREE"}
        currentStatus={selectedUser?.subscription?.status ?? "INACTIVE"}
        onSaved={() => {
          // refresh list setelah update
          loadData();
        }}
      />
    </>
  );
}
