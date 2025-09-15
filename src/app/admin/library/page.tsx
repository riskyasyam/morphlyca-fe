"use client";

import { useEffect, useMemo, useState } from "react";
import type { MediaAsset } from "@/types/media";
import {
  fetchAllMediaAssets,
  buildProxyUrl,
  buildDownloadUrl,
  deleteMediaAsset,
} from "@/lib/media";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Film, ImageIcon, FileAudio, FileType, Trash2, Loader2 } from "lucide-react";
import clsx from "clsx";

function formatBytes(strBytes?: string | number | null) {
  const b = typeof strBytes === "string" ? Number(strBytes) : (strBytes ?? 0);
  if (!b || isNaN(b)) return "-";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}
function formatDayLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
function formatTimeLocal(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
function typeIcon(type: string) {
  if (type === "VIDEO") return <Film className="w-4 h-4" />;
  if (type === "IMAGE") return <ImageIcon className="w-4 h-4" />;
  if (type === "AUDIO") return <FileAudio className="w-4 h-4" />;
  return <FileType className="w-4 h-4" />;
}

export default function AdminLibrary() {
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  // delete state per item
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const all = await fetchAllMediaAssets();
        all.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        setAssets(all);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load media assets");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return assets;
    const s = q.trim().toLowerCase();
    return assets.filter(
      (a) =>
        a.objectKey.toLowerCase().includes(s) ||
        a.bucket.toLowerCase().includes(s) ||
        a.mimeType.toLowerCase().includes(s) ||
        a.type.toLowerCase().includes(s) ||
        a.outputForJobs?.some((j) => j.id.toLowerCase().includes(s))
    );
  }, [assets, q]);

  const byDay = useMemo(() => {
    const groups: Record<string, MediaAsset[]> = {};
    for (const a of filtered) {
      const key = formatDayLabel(a.createdAt);
      (groups[key] ||= []).push(a);
    }
    return groups;
  }, [filtered]);

  const handleDelete = async (id: string, label?: string) => {
    const ok = window.confirm(
      `Hapus media ini?\n${label ?? id}\n\nFile akan dihapus dari output MinIO.`
    );
    if (!ok) return;
    try {
      setDeletingId(id);
      await deleteMediaAsset(id);
      setAssets((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus media");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-white">
        <h1 className="text-3xl font-bold mb-4">My media</h1>
        <p className="text-slate-400 mb-6">Loading media from MinIO…</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 bg-gray-900/40 border border-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-white">
        <h1 className="text-3xl font-bold mb-2">My media</h1>
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="text-white">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My media</h1>
          <p className="mt-4 text-slate-400">Assets from MinIO (facefusion output)</p>
        </div>

        {/* Search */}
        <div className="relative w-80">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search filename, job id, mime…"
            className="bg-gray-900 border-gray-700 text-white pr-8"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {Object.keys(byDay).length === 0 ? (
        <p className="text-slate-400">No media found.</p>
      ) : (
        <div className="space-y-8">
          {Object.entries(byDay).map(([day, items]) => (
            <section key={day}>
              <h2 className="text-lg font-semibold mb-3">{day}</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                {items.map((a) => {
                  const urlProxy = buildProxyUrl(a);
                  const urlDownload = buildDownloadUrl(a);
                  const isVideo = a.mimeType.startsWith("video/");
                  const isImage = a.mimeType.startsWith("image/");
                  const isAudio = a.mimeType.startsWith("audio/");

                  const shortName = a.objectKey.split("/").slice(-2).join("/");

                  return (
                    <article
                      key={a.id}
                      className="group relative rounded-lg overflow-hidden border border-gray-800 bg-black hover:bg-gray-900/30 transition-colors"
                    >
                      {/* Preview */}
                      <div className="relative z-0 aspect-video bg-gray-900/40 flex items-center justify-center">
                        {isVideo && (
                          <video
                            src={urlProxy}
                            controls
                            className="w-full h-full object-cover block"
                            preload="metadata"
                          />
                        )}
                        {isImage && (
                          <img src={urlProxy} alt={a.objectKey} className="w-full h-full object-cover block" />
                        )}
                        {isAudio && (
                          <audio controls className="w-full">
                            <source src={urlProxy} type={a.mimeType} />
                          </audio>
                        )}
                        {!isVideo && !isImage && !isAudio && (
                          <div className="text-slate-400 text-sm p-4 text-center">No preview</div>
                        )}
                      </div>

                      {/* Info + actions */}
                      <div className="relative z-10 p-3 space-y-2 bg-transparent">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-slate-300 text-xs">
                            {typeIcon(a.type)}
                            <span className="uppercase">{a.type}</span>
                            <span className="text-slate-600">•</span>
                            <span>{a.mimeType}</span>
                          </div>
                          <div className="text-slate-400 text-xs">{formatBytes(a.sizeBytes)}</div>
                        </div>

                        <div className="text-sm font-medium truncate" title={a.objectKey}>
                          {shortName}
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>
                            Dibuat: <span className="font-mono">{formatTimeLocal(a.createdAt)}</span>
                          </span>
                        </div>

                        <div className="pt-1 flex items-center gap-4">
                          <a
                            href={urlProxy}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative z-20 text-xs text-blue-400 hover:text-blue-300 underline"
                          >
                            Open
                          </a>
                          <a
                            href={urlDownload}
                            className="relative z-20 text-xs text-blue-400 hover:text-blue-300 underline"
                          >
                            Download
                          </a>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="relative z-20 ml-auto text-red-400 hover:text-red-300 hover:bg-gray-800"
                            title="Delete"
                            onClick={() => handleDelete(a.id, shortName)}
                            disabled={deletingId === a.id}
                          >
                            {deletingId === a.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}