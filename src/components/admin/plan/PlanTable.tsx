"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { Plan, PlansListResponse } from "@/types/plan";
import { fetchPlans, deletePlan } from "@/lib/plan";
import { Loader2, Pencil, Trash2, Plus, Crown } from "lucide-react";
import PlanFormModal from "@/components/admin/plan/PlanFormModal";
import Link from "next/link";

const PlanTable = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [meta, setMeta] = useState<{ total: number; skip: number; take: number }>({ total: 0, skip: 0, take: 0 });
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

    const loadPlans = async () => {
        try {
            setLoading(true);
            const data: PlansListResponse = await fetchPlans();
            setPlans(data.items ?? []);
            setMeta({ total: data.total, skip: data.skip, take: data.take });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load plans");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPlans();
    }, []);

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString("id-ID", {
            year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
        });

    const priorityBadgeClass = (p: number) => {
        if (p >= 8) return "bg-red-600 hover:bg-red-700 text-white";
        if (p >= 5) return "bg-blue-600 hover:bg-blue-700 text-white";
        return "bg-gray-600 hover:bg-gray-700 text-gray-100";
    };

    const handleDelete = async (id: number) => {
        const yes = window.confirm("Hapus plan ini?");
        if (!yes) return;
        try {
            setDeletingId(id);
            await deletePlan(String(id));
            setPlans((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Gagal menghapus plan. Coba lagi.");
        } finally {
            setDeletingId(null);
        }
    };

    const openCreate = () => {
        console.log("open create");
        setModalMode("create");
        setEditingPlan(null);
        setModalOpen(true);
    };

    const openEdit = (plan: Plan) => {
        setModalMode("edit");
        setEditingPlan(plan);
        setModalOpen(true);
    };

    const handleSaved = (saved: Plan) => {
        if (modalMode === "create") {
            // prepend
            setPlans((prev) => [saved, ...prev]);
            setMeta((m) => ({ ...m, total: m.total + 1 }));
        } else {
            // replace item
            setPlans((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
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
            <div className="bg-black border border-gray-800 rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-800 flex items-center justify-between relative z-[60] pointer-events-auto">
                    <div>
                        <h3 className="text-lg font-semibold text-white">
                            Plans ({plans.length})
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                            Manage subscription plans and priorities
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/admin/entitlements">
                            <Button className="bg-purple-600 hover:bg-purple-700">
                                <Crown className="w-4 h-4 mr-2" />
                                Manage Entitlements
                            </Button>
                        </Link>
                        
                        <Button
                            type="button"
                            onClick={openCreate}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Create Plan
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-gray-800 hover:bg-gray-900/50">
                                <TableHead className="text-gray-300 font-medium pl-6">Name</TableHead>
                                <TableHead className="text-gray-300 font-medium">Code</TableHead>
                                <TableHead className="text-gray-300 font-medium">Priority</TableHead>
                                <TableHead className="text-gray-300 font-medium">Created At</TableHead>
                                <TableHead className="text-gray-300 font-medium">Plan ID</TableHead>
                                <TableHead className="text-right text-gray-300 font-medium pr-10">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {plans.map((plan) => (
                                <TableRow key={plan.id} className="border-gray-800 hover:bg-gray-900/30 transition-colors">
                                    <TableCell className="font-medium text-white pl-6">{plan.name}</TableCell>
                                    <TableCell className="text-gray-300">{plan.code}</TableCell>
                                    <TableCell>
                                        <Badge className={priorityBadgeClass(plan.priority)}>{plan.priority}</Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-400">{formatDate(plan.createdAt)}</TableCell>
                                    <TableCell className="text-gray-500 font-mono text-xs">{String(plan.id)}</TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Edit Plan */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-gray-300 hover:text-white hover:bg-gray-800"
                                                onClick={() => openEdit(plan)}
                                                title="Edit"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>

                                            {/* Delete */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(plan.id)}
                                                className="text-red-400 hover:text-red-300 hover:bg-gray-800"
                                                title="Delete"
                                                disabled={deletingId === plan.id}
                                            >
                                                {deletingId === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {plans.length === 0 && (
                    <div className="flex items-center justify-center h-32 text-gray-400">
                        <p>No plans found</p>
                    </div>
                )}
            </div>

            {/* Modal Create/Edit Plan */}
            <PlanFormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                mode={modalMode}
                initialData={editingPlan ?? undefined}
                onSaved={handleSaved}
            />
        </>
    );
};

export default PlanTable;