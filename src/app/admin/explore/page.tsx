"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fetchQuotaToday, createUploadedProcess, getJob, requeueJob } from "@/lib/jobs";
import { fetchAllFeatures } from "@/lib/feature";
import type { Job, JobStatus, QuotaToday } from "@/types/job";
import type { Feature } from "@/types/feature";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw, UploadCloud, Video, Image as ImgIcon, Music, PlayCircle } from "lucide-react";
import clsx from "clsx";

// ====== Konfigurasi & util ======

// opsi FaceFusion (contoh minimal)
const FACESWAPPER_MODELS = [
  { value: "inswapper_128", label: "inswapper_128" },
  { value: "hyperswap_1a_256", label: "hyperswap_1a_256" },
];

const gradientButtonStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #A0D45B 0%, #DDFFB1 34.55%, #7EBE2A 100%)",
  color: "#0B1400",
};

// format angka sederhana
const fmt = (n: number) => Intl.NumberFormat("en-US").format(n);

// ====== Halaman ======

export default function ExplorePage() {
  // files
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  // processors data dari API
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(true);

  // pisahkan processors dan features - hanya yang ACTIVE
  const processors = useMemo(() => {
    return features.filter(f => f.type === "processor" && f.status === "ACTIVE");
  }, [features]);

  const regularFeatures = useMemo(() => {
    return features.filter(f => f.type === "feature" && f.status === "ACTIVE");
  }, [features]);

  // processors selection (gunakan dynamic keys dari API)
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  // feature selection (radio button untuk features)
  const [selectedFeature, setSelectedFeature] = useState<string>("");

  // options (sederhana)
  const [useCuda, setUseCuda] = useState(true);
  const [deviceId, setDeviceId] = useState(0);
  const [faceSwapperModel, setFaceSwapperModel] = useState(FACESWAPPER_MODELS[0].value);
  const [rawOptions, setRawOptions] = useState<string>(""); // bisa diisi manual jika perlu

  // quota & kalkulasi weight
  const [quota, setQuota] = useState<QuotaToday | null>(null);
  const totalSelectedWeight = useMemo(() => {
    return processors
      .filter(p => selected[p.name])
      .reduce((sum, p) => sum + (p.weight || 0), 0);
  }, [selected, processors]);

  const remainingAfter = useMemo(() => {
    return Math.max(0, (quota?.remaining ?? 0) - totalSelectedWeight);
  }, [quota, totalSelectedWeight]);

  const usedWeight = useMemo(() => {
    return (quota?.dailyLimit ?? 0) - (quota?.remaining ?? 0);
  }, [quota]);

  const quotaPercentage = useMemo(() => {
    if ((quota?.dailyLimit ?? 0) === 0) return 0;
    return Math.min(100, (usedWeight / (quota?.dailyLimit ?? 1)) * 100);
  }, [usedWeight, quota]);

  // job lifecycle
  const [submitting, setSubmitting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const pollTimer = useRef<NodeJS.Timeout | null>(null);

  // initial data loading
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load quota
        const quotaData = await fetchQuotaToday();
        setQuota(quotaData);

        // Load ALL features (termasuk processors) - gunakan fetchAllFeatures
        setLoadingFeatures(true);
        const allFeatures = await fetchAllFeatures();
        setFeatures(allFeatures);

        // Set default selection untuk processors (face_swapper default checked jika ada)
        const defaultSelected: Record<string, boolean> = {};
        allFeatures.forEach(f => {
          if (f.type === "processor") {
            defaultSelected[f.name] = f.name === "face_swapper"; // default hanya face_swapper
          }
        });
        setSelected(defaultSelected);

      } catch (e) {
        console.error("Error loading data:", e);
      } finally {
        setLoadingFeatures(false);
      }
    };

    loadData();

    // cleanup poller saat unmount
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, []);

  // polling status job
  const startPolling = (id: string) => {
    if (pollTimer.current) clearInterval(pollTimer.current);
    pollTimer.current = setInterval(async () => {
      try {
        const j = await getJob(id);
        setJob(j);
        if (j.status === "SUCCEEDED" || j.status === "FAILED") {
          if (pollTimer.current) clearInterval(pollTimer.current);
          // refresh quota supaya sisa weight ter-update sesudah sukses
          try {
            const q = await fetchQuotaToday();
            setQuota(q);
          } catch {}
        }
      } catch (e) {
        console.error(e);
      }
    }, 2000);
  };

  // handle toggle processor
  const toggleProcessor = (processorName: string) => {
    setSelected(prev => ({ ...prev, [processorName]: !prev[processorName] }));
  };

  // preview states for source and target files
  const [sourcePreview, setSourcePreview] = useState<string>("");
  const [targetPreview, setTargetPreview] = useState<string>("");
  // handle file change dengan preview
  const handleSourceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSourceFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setSourcePreview(url);
    } else {
      setSourcePreview("");
    }
  };

  const handleTargetFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setTargetFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setTargetPreview(url);
    } else {
      setTargetPreview("");
    }
  };

  // cleanup preview URLs
  useEffect(() => {
    return () => {
      if (sourcePreview) URL.revokeObjectURL(sourcePreview);
      if (targetPreview) URL.revokeObjectURL(targetPreview);
    };
  }, [sourcePreview, targetPreview]);

  // kirim job
  const canSubmit =
    !!sourceFile &&
    !!targetFile &&
    totalSelectedWeight > 0 &&
    (quota?.remaining ?? 0) >= totalSelectedWeight &&
    !submitting;

  const handleSubmit = async () => {
    if (!sourceFile || !targetFile) return;
    setSubmitting(true);
    setJobId(null);
    setJob(null);

    try {
      const form = new FormData();
      form.append("source", sourceFile);
      form.append("target", targetFile);
      if (audioFile) form.append("audio", audioFile);

      const enabledProcessors = processors
        .filter(p => selected[p.name])
        .map(p => p.name);
      form.append("processors", JSON.stringify(enabledProcessors));

      const baseOptions: Record<string, any> = {
        faceSwapperModel,
        useCuda,
        deviceId: String(deviceId),
      };

      // jika user mengisi rawOptions (JSON), gabungkan ke baseOptions
      if (rawOptions.trim()) {
        try {
          const extra = JSON.parse(rawOptions);
          Object.assign(baseOptions, extra);
        } catch {
          // biarkan saja kalau JSON invalid; tidak digabungkan
        }
      }

      form.append("options", JSON.stringify(baseOptions));

      const { id } = await createUploadedProcess(form);
      setJobId(id);
      startPolling(id);
    } catch (e: any) {
      alert(e?.message ?? "Gagal membuat job");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequeue = async () => {
    if (!jobId) return;
    try {
      const j = await requeueJob(jobId);
      setJob(j);
      startPolling(jobId);
    } catch (e: any) {
      alert(e?.message ?? "Gagal requeue job");
    }
  };

  // ====== UI ======

  return (
    <main className="relative z-[60] pointer-events-auto text-white space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Explore</h1>
          <p className="text-slate-400 mt-1">Generate FaceFusion jobs</p>
        </div>

        {/* Kuota harian */}
        <div className="bg-black/40 border border-gray-800 rounded-xl p-4 min-w-[320px]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Daily Weight Quota</span>
            <span className="text-sm text-slate-300">
              {fmt(usedWeight)} / {fmt(quota?.dailyLimit ?? 0)}
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded bg-gray-800 overflow-hidden">
            <div
              className={clsx(
                "h-full transition-all",
                (quota?.remaining ?? 0) > 0 ? "bg-emerald-500" : "bg-red-500"
              )}
              style={{
                width: `${quotaPercentage.toFixed(1)}%`,
              }}
            />
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Used: <b>{fmt(usedWeight)}</b> •
            Remaining: <b>{fmt(quota?.remaining ?? 0)}</b>
          </div>
        </div>
      </div>

      {/* Grid: kiri form, kanan status */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* KIRI: Form (span 2 col) */}
        <section className="xl:col-span-2 space-y-6">
          {/* Files with preview */}
          <div className="bg-black border border-gray-800 rounded-xl p-4">
            <h2 className="font-semibold mb-4">Inputs</h2>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-3">
                <label className="block">
                  <span className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                    <ImgIcon className="w-4 h-4" /> Source (image)
                  </span>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleSourceFileChange}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </label>
                {sourcePreview && (
                  <div className="relative">
                    <img
                      src={sourcePreview}
                      alt="Source preview"
                      className="w-full h-32 object-cover rounded border border-gray-700"
                    />
                    <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      SOURCE
                    </div>
                  </div>
                )}
                {sourceFile && (
                  <p className="text-xs text-slate-500 truncate">{sourceFile.name}</p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block">
                  <span className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                    <Video className="w-4 h-4" /> Target (video)
                  </span>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={handleTargetFileChange}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </label>
                {targetPreview && (
                  <div className="relative">
                    <video
                      src={targetPreview}
                      className="w-full h-32 object-cover rounded border border-gray-700"
                      muted
                    />
                    <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      TARGET
                    </div>
                  </div>
                )}
                {targetFile && (
                  <p className="text-xs text-slate-500 truncate">{targetFile.name}</p>
                )}
              </div>

              <label className="block">
                <span className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                  <Music className="w-4 h-4" /> Audio (optional)
                </span>
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
                  className="bg-gray-900 border-gray-700 text-white"
                />
                {audioFile && (
                  <p className="mt-1 text-xs text-slate-500 truncate">{audioFile.name}</p>
                )}
              </label>
            </div>
          </div>

          {/* Processors + kalkulasi */}
          <div className="bg-black border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Processors</h2>
              <div
                className={clsx(
                  "rounded px-2 py-1 text-xs",
                  remainingAfter >= totalSelectedWeight
                    ? "bg-emerald-600/20 text-emerald-300"
                    : "bg-red-600/20 text-red-300"
                )}
              >
                Selected weight: <b>{fmt(totalSelectedWeight)}</b>{" "}
                • Will remain: <b>{fmt(remainingAfter)}</b>
              </div>
            </div>

            {loadingFeatures ? (
              <div className="mt-4 flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              </div>
            ) : (
              <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {processors.map((processor) => {
                  const checked = !!selected[processor.name];
                  return (
                    <label
                      key={processor.id}
                      className={clsx(
                        "flex items-center justify-between gap-3 rounded-lg border px-3 py-2 cursor-pointer",
                        checked ? "border-emerald-600 bg-emerald-600/10" : "border-gray-800 bg-gray-900/40 hover:bg-gray-900/70"
                      )}
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {processor.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          Weight: {processor.weight || 0}
                          {processor.value && ` • ${processor.value}`}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={checked}
                        onChange={() => toggleProcessor(processor.name)}
                      />
                    </label>
                  );
                })}
              </div>
            )}

            {!loadingFeatures && processors.length === 0 && (
              <div className="mt-4 text-center text-slate-400 py-8">
                No processors found. Please add processors in Features management.
              </div>
            )}
          </div>

          {/* Features (radio button selection) */}
          {regularFeatures.length > 0 && (
            <div className="bg-black border border-gray-800 rounded-xl p-4">
              <h2 className="font-semibold mb-4">Available Features (Select One)</h2>
              <div className="space-y-2">
                {/* Option untuk tidak memilih feature */}
                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-800 bg-gray-900/40 hover:bg-gray-900/70 cursor-pointer">
                  <input
                    type="radio"
                    name="feature"
                    value=""
                    checked={selectedFeature === ""}
                    onChange={(e) => setSelectedFeature(e.target.value)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="text-sm font-medium">None</div>
                    <div className="text-xs text-slate-400">Don't use any additional feature</div>
                  </div>
                </label>

                {regularFeatures.map((feature) => (
                  <label
                    key={feature.id}
                    className={clsx(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer",
                      selectedFeature === feature.name
                        ? "border-blue-600 bg-blue-600/10"
                        : "border-gray-800 bg-gray-900/40 hover:bg-gray-900/70"
                    )}
                  >
                    <input
                      type="radio"
                      name="feature"
                      value={feature.name}
                      checked={selectedFeature === feature.name}
                      onChange={(e) => setSelectedFeature(e.target.value)}
                      className="w-4 h-4"
                    />
                    <div>
                      <div className="text-sm font-medium">{feature.name}</div>
                      <div className="text-xs text-slate-400">
                        Weight: {feature.weight || 0}
                        {feature.value && ` • ${feature.value}`}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Options */}
          <div className="bg-black border border-gray-800 rounded-xl p-4 space-y-4">
            <h2 className="font-semibold">Options</h2>

            <div className="grid md:grid-cols-3 gap-4">
              <label className="block">
                <span className="text-sm text-slate-300">Face swapper model</span>
                <select
                  value={faceSwapperModel}
                  onChange={(e) => setFaceSwapperModel(e.target.value)}
                  className="mt-1 w-full h-10 rounded bg-gray-900 border border-gray-700 text-white px-3"
                >
                  {FACESWAPPER_MODELS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm text-slate-300">Use CUDA</span>
                <select
                  value={useCuda ? "1" : "0"}
                  onChange={(e) => setUseCuda(e.target.value === "1")}
                  className="mt-1 w-full h-10 rounded bg-gray-900 border border-gray-700 text-white px-3"
                >
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm text-slate-300">Device ID</span>
                <Input
                  type="number"
                  value={deviceId}
                  onChange={(e) => setDeviceId(Number(e.target.value))}
                  className="mt-1 bg-gray-900 border-gray-700 text-white"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm text-slate-300">Extra options (JSON, optional)</span>
              <textarea
                value={rawOptions}
                onChange={(e) => setRawOptions(e.target.value)}
                placeholder='contoh: {"trimFrame": 120, "previewMode": "default"}'
                rows={4}
                className="mt-1 w-full rounded bg-gray-900 border border-gray-700 text-white px-3 py-2"
              />
              <p className="text-xs text-slate-500 mt-1">Field ini akan digabungkan ke options dasar di atas (jika valid JSON).</p>
            </label>

            <div className="pt-2 flex items-center gap-3">
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                style={gradientButtonStyle}
                className="font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Starting…
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <PlayCircle className="w-4 h-4" /> Start
                  </span>
                )}
              </Button>

              <div className="text-xs text-slate-400">
                * Submit aktif bila file **source & target** terpilih, ada processor, dan
                sisa quota mencukupi untuk total weight yang dipilih.
              </div>
            </div>
          </div>
        </section>

        {/* KANAN: Status Job */}
        <aside className="space-y-4">
          <div className="bg-black border border-gray-800 rounded-xl p-4">
            <h2 className="font-semibold mb-3">Job status</h2>

            {!jobId ? (
              <p className="text-slate-400 text-sm">
                Belum ada job yang berjalan. Submit job untuk melihat status di sini.
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    Job ID: <span className="font-mono">{jobId}</span>
                  </div>
                  <div
                    className={clsx(
                      "px-2 py-0.5 rounded text-xs",
                      job?.status === "SUCCEEDED" && "bg-emerald-600/20 text-emerald-300",
                      job?.status === "FAILED" && "bg-red-600/20 text-red-300",
                      job?.status === "RUNNING" && "bg-blue-600/20 text-blue-300",
                      job?.status === "QUEUED" && "bg-yellow-600/20 text-yellow-300"
                    )}
                  >
                    {job?.status ?? "QUEUED"}
                  </div>
                </div>

                {job?.error && (
                  <p className="mt-2 text-xs text-red-400 break-words">
                    Error: {job.error}
                  </p>
                )}

                <div className="mt-4 flex items-center gap-3">
                  {job?.status === "FAILED" && (
                    <Button
                      onClick={handleRequeue}
                      style={gradientButtonStyle}
                      className="font-semibold"
                    >
                      <span className="inline-flex items-center gap-2">
                        <RefreshCcw className="w-4 h-4" /> Requeue
                      </span>
                    </Button>
                  )}
                  {!job || (job.status !== "SUCCEEDED" && job.status !== "FAILED") ? (
                    <div className="text-xs text-slate-400">
                      Memantau status tiap 2 detik…
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </div>

          {/* Tips / Bantuan singkat */}
          <div className="bg-black/40 border border-gray-800 rounded-xl p-4 text-sm text-slate-400">
            <div className="font-semibold text-slate-200 mb-1">Catatan</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>Processor diambil dari Features dengan type "processor" - hanya yang ACTIVE bisa dipilih.</li>
              <li>Features dengan type "feature" ditampilkan sebagai informasi tambahan.</li>
              <li>Kuota harian diambil dari <code>/jobs/quota-today</code>.</li>
              <li>Status job dipantau via <code>/jobs/{`{id}`}</code>; requeue pakai <code>/jobs/{`{id}`}/requeue</code>.</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}

