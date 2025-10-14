"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { Entitlement } from "@/types/entitlement";
import { fetchEntitlements, deleteEntitlement } from "@/lib/entitlement";
import { Loader2, Pencil, Trash2, Plus, Eye, Crown, Shield, Star } from "lucide-react";
import EntitlementFormModal from "./EntitlementFormModal";
import EntitlementViewModal from "./EntitlementViewModal";

const EntitlementsTable = () => {
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingEntitlement, setEditingEntitlement] = useState<Entitlement | null>(null);
  const [viewingEntitlement, setViewingEntitlement] = useState<Entitlement | null>(null);

  const loadEntitlements = async () => {
    try {
      setLoading(true);
      const data = await fetchEntitlements();
      setEntitlements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load entitlements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntitlements();
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", {
      year: "numeric", month: "short", day: "numeric", 
      hour: "2-digit", minute: "2-digit",
    });

  const getPlanIcon = (planCode: string) => {
    switch (planCode?.toUpperCase()) {
      case 'FREE': return <Shield className="w-4 h-4 text-gray-400" />;
      case 'PREMIUM': return <Star className="w-4 h-4 text-blue-400" />;
      case 'PRO': return <Crown className="w-4 h-4 text-yellow-400" />;
      default: return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const getResolutionBadge = (resolution: string) => {
    const colors = {
      '480p': 'bg-red-600/20 text-red-300',
      '720p': 'bg-yellow-600/20 text-yellow-300',
      '1080p': 'bg-green-600/20 text-green-300',
      '4K': 'bg-purple-600/20 text-purple-300',
    };
    return colors[resolution as keyof typeof colors] || 'bg-gray-600/20 text-gray-300';
  };

  const handleDelete = async (id: number) => {
    const yes = window.confirm("Delete this entitlement?");
    if (!yes) return;
    
    try {
      setDeletingId(id);
      await deleteEntitlement(id);
      setEntitlements(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete entitlement");
    } finally {
      setDeletingId(null);
    }
  };

  const openCreate = () => {
    setModalMode("create");
    setEditingEntitlement(null);
    setFormModalOpen(true);
  };

  const openEdit = (entitlement: Entitlement) => {
    setModalMode("edit");
    setEditingEntitlement(entitlement);
    setFormModalOpen(true);
  };

  const openView = (entitlement: Entitlement) => {
    setViewingEntitlement(entitlement);
    setViewModalOpen(true);
  };

  const handleSaved = (saved: Entitlement) => {
    if (modalMode === "create") {
      setEntitlements(prev => [saved, ...prev]);
    } else {
      setEntitlements(prev => prev.map(e => e.id === saved.id ? saved : e));
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
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Entitlements ({entitlements.length})
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Manage plan limits and capabilities
            </p>
          </div>

          <Button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" /> Create Entitlement
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-gray-900/50">
                <TableHead className="text-gray-300 font-medium pl-6">Plan</TableHead>
                <TableHead className="text-gray-300 font-medium">Version</TableHead>
                <TableHead className="text-gray-300 font-medium">Processors</TableHead>
                <TableHead className="text-gray-300 font-medium">Weight</TableHead>
                <TableHead className="text-gray-300 font-medium">Daily Quota</TableHead>
                <TableHead className="text-gray-300 font-medium">Video Limit</TableHead>
                <TableHead className="text-gray-300 font-medium">Resolution</TableHead>
                <TableHead className="text-gray-300 font-medium">Watermark</TableHead>
                <TableHead className="text-gray-300 font-medium">Concurrency</TableHead>
                <TableHead className="text-right text-gray-300 font-medium pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {entitlements.map((entitlement) => (
                <TableRow key={entitlement.id} className="border-gray-800 hover:bg-gray-900/30 transition-colors">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-2">
                      {getPlanIcon(entitlement.plan.code)}
                      <div>
                        <p className="font-medium text-white">{entitlement.plan.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline" className="text-gray-300 border-gray-600">
                      v{entitlement.version}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="text-gray-300">
                    {entitlement.entitlements.max_processors_per_job}
                  </TableCell>
                  
                  <TableCell className="text-gray-300">
                    {entitlement.entitlements.max_weight_per_job}
                  </TableCell>
                  
                  <TableCell className="text-gray-300">
                    {entitlement.entitlements.daily_weight_quota}
                  </TableCell>
                  
                  <TableCell className="text-gray-300">
                    {entitlement.entitlements.max_video_sec}s
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={getResolutionBadge(entitlement.entitlements.max_resolution)}>
                      {entitlement.entitlements.max_resolution}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={entitlement.entitlements.watermark 
                      ? "bg-red-600/20 text-red-300" 
                      : "bg-green-600/20 text-green-300"
                    }>
                      {entitlement.entitlements.watermark ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="text-gray-300">
                    {entitlement.entitlements.concurrency}
                  </TableCell>
                  
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-300 hover:text-white hover:bg-gray-800"
                        onClick={() => openView(entitlement)}
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-300 hover:text-white hover:bg-gray-800"
                        onClick={() => openEdit(entitlement)}
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(entitlement.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-gray-800"
                        title="Delete"
                        disabled={deletingId === entitlement.id}
                      >
                        {deletingId === entitlement.id ? 
                          <Loader2 className="w-4 h-4 animate-spin" /> : 
                          <Trash2 className="w-4 h-4" />
                        }
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {entitlements.length === 0 && (
          <div className="flex items-center justify-center h-32 text-gray-400">
            <p>No entitlements found</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <EntitlementFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        mode={modalMode}
        initialData={editingEntitlement ?? undefined}
        onSaved={handleSaved}
      />

      {/* View Modal */}
      <EntitlementViewModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        entitlement={viewingEntitlement}
      />
    </>
  );
};

export default EntitlementsTable;
