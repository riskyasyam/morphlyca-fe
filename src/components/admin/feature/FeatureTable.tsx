"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { Feature, FeaturesListResponse } from "@/types/feature";
import { fetchAllFeatures, deleteFeature } from "@/lib/feature";
import { Loader2, Pencil, Trash2, Plus, X } from "lucide-react";
import FeatureFormModal from "@/components/admin/feature/FeatureFormModal";

const statusBadgeClass = (s: string) =>
    s === "ACTIVE"
        ? "bg-green-600 hover:bg-green-700 text-white"
        : "bg-gray-600 hover:bg-gray-700 text-gray-100";

export default function FeatureTable() {
    const [features, setFeatures] = useState<Feature[]>([]);
    const [meta, setMeta] = useState<{ total?: number; skip?: number; take?: number }>({});
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Search
    const [query, setQuery] = useState("");

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [editingFeature, setEditingFeature] = useState<Feature | null>(null);

    const loadFeatures = async () => {
        try {
            setLoading(true);
            const data: Feature[] = await fetchAllFeatures();
            setFeatures(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load features");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFeatures();
    }, []);

    const filtered = useMemo(() => {
        if (!query.trim()) return features;
        const q = query.trim().toLowerCase();
        return features.filter((f) => f.name.toLowerCase().includes(q));
    }, [features, query]);

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    const handleDelete = async (id: number) => {
        const yes = window.confirm("Hapus feature ini?");
        if (!yes) return;
        try {
            setDeletingId(id);
            await deleteFeature(id);
            setFeatures((prev) => prev.filter((f) => f.id !== id));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Gagal menghapus feature. Coba lagi.");
        } finally {
            setDeletingId(null);
        }
    };

    const openCreate = () => {
        setModalMode("create");
        setEditingFeature(null);
        setModalOpen(true);
    };

    const openEdit = (f: Feature) => {
        setModalMode("edit");
        setEditingFeature(f);
        setModalOpen(true);
    };

    const handleSaved = (saved: Feature) => {
        if (modalMode === "create") {
            setFeatures((prev) => [saved, ...prev]);
        } else {
            setFeatures((prev) => prev.map((f) => (f.id === saved.id ? saved : f)));
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
                {/* Header + Actions */}
                <div className="p-6 border-b border-gray-800 flex items-center justify-between gap-4 relative z-[60] pointer-events-auto">
                    <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate">
                            Features ({filtered.length})
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">Manage system features and flags</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search feature name…"
                                className="bg-gray-900 border-gray-700 text-white w-64 pr-8"
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={() => setQuery("")}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                                    aria-label="Clear search"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <Button type="button" onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                            <Plus className="w-4 h-4 mr-2" /> Create Feature
                        </Button>
                    </div>
                </div>

                {/* Scrollable table (full data, no pagination) */}
                <div className="overflow-auto max-h-[70vh]">
                    <Table className="min-w-full">
                        <TableHeader className="sticky top-0 z-10 bg-black/90 backdrop-blur supports-[backdrop-filter]:bg-black/60">
                            <TableRow className="border-gray-800">
                                <TableHead className="text-gray-300 font-medium pl-6">Name</TableHead>
                                <TableHead className="text-gray-300 font-medium">Type</TableHead>
                                <TableHead className="text-gray-300 font-medium">Status</TableHead>
                                <TableHead className="text-gray-300 font-medium">Weight</TableHead>
                                <TableHead className="text-gray-300 font-medium">Created At</TableHead>
                                <TableHead className="text-gray-300 font-medium">Feature ID</TableHead>
                                <TableHead className="text-right text-gray-300 font-medium pr-10">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filtered.map((f) => (
                                <TableRow key={f.id} className="border-gray-800 hover:bg-gray-900/30 transition-colors">
                                    <TableCell className="font-medium text-white pl-6">{f.name}</TableCell>
                                    <TableCell className="text-gray-300">{f.type}</TableCell>
                                    <TableCell>
                                        <Badge className={statusBadgeClass(f.status)}>{f.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-300">{f.weight}</TableCell>
                                    <TableCell className="text-gray-400">{formatDate(f.createdAt)}</TableCell>
                                    <TableCell className="text-gray-500 font-mono text-xs">{String(f.id)}</TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-gray-300 hover:text-white hover:bg-gray-800"
                                                onClick={() => openEdit(f)}
                                                title="Edit"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(f.id)}
                                                className="text-red-400 hover:text-red-300 hover:bg-gray-800"
                                                title="Delete"
                                                disabled={deletingId === f.id}
                                            >
                                                {deletingId === f.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-10 text-gray-400">
                                        {query ? "No features match your search." : "No features found."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Modal Create/Edit */}
            <FeatureFormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                mode={modalMode}
                initialData={editingFeature ?? undefined}
                onSaved={handleSaved}
            />
        </>
    );
}
