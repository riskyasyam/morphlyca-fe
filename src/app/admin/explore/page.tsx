"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fetchQuotaToday, createUploadedProcess, getJob, requeueJob, fetchJobs } from "@/lib/jobs";
import { fetchAllFeatures, getModelCategories, getModelsByCategory } from "@/lib/feature";
import type { Job, JobStatus, QuotaToday } from "@/types/job";
import type { Feature } from "@/types/feature";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw, X, Video, Image as ImgIcon, Music, PlayCircle, Clock, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import clsx from "clsx";

// ====== Konfigurasi & util ======

// Mapping processor ke options yang relevan berdasarkan API FaceFusion
const PROCESSOR_OPTIONS: Record<string, string[]> = {
  "face_swapper": ["face_swapper_model", "face_swapper_pixel_boost"],
  "face_enhancer": ["face_enhancer_model", "face_enhancer_blend"],
  "frame_enhancer": ["frame_enhancer_model", "frame_enhancer_blend"],
  "age_modifier": ["age_modifier_direction"],
  "expression_restorer": ["expression_restorer_model", "expression_restorer_factor"],
  "face_debugger": ["face_debugger_items"],
  "face_editor": [
    "face_editor_model", "face_editor_eyebrow_direction", "face_editor_eye_gaze_horizontal",
    "face_editor_eye_gaze_vertical", "face_editor_eye_open_ratio", "face_editor_lip_open_ratio",
    "face_editor_mouth_grim", "face_editor_mouth_pout", "face_editor_mouth_smile",
    "face_editor_mouth_position_horizontal", "face_editor_mouth_position_vertical",
    "face_editor_head_pitch", "face_editor_head_yaw", "face_editor_head_roll"
  ],
  "frame_colorizer": ["frame_colorizer_model", "frame_colorizer_blend"],
  "lip_syncer": ["lip_syncer_model", "lip_syncer_weight"],
  "deep_swapper": ["deep_swapper_model", "deep_swapper_morph"]
};

// Enhanced model options based on backend docs (fallback static data)
const MODEL_OPTIONS = {
  face_swapper_model: [
    { value: "inswapper_128", label: "inswapper_128" },
    { value: "hyperswap_1a_256", label: "hyperswap_1a_256" },
    { value: "blendswap_256", label: "blendswap_256" },
    { value: "simswap_256", label: "simswap_256" },
    { value: "simswap_512", label: "simswap_512" },
    { value: "uniface_256", label: "uniface_256" }
  ],
  face_enhancer_model: [
    { value: "gfpgan_1.4", label: "GFPGAN 1.4" },
    { value: "gfpgan_1.3", label: "GFPGAN 1.3" },
    { value: "gfpgan_1.2", label: "GFPGAN 1.2" },
    { value: "codeformer", label: "CodeFormer" },
    { value: "gpen_bfr_256", label: "GPEN BFR 256" },
    { value: "gpen_bfr_512", label: "GPEN BFR 512" },
    { value: "restoreformer_plus_plus", label: "RestoreFormer++" }
  ],
  frame_enhancer_model: [
    { value: "real_esrgan_x2plus", label: "Real-ESRGAN x2" },
    { value: "real_esrgan_x4plus", label: "Real-ESRGAN x4" },
    { value: "real_esrgan_x4plus_anime_6b", label: "Real-ESRGAN x4 Anime" },
    { value: "real_hatgan_x4", label: "Real-HATGAN x4" }
  ],
  face_detector_model: [
    { value: "retinaface", label: "RetinaFace" },
    { value: "yoloface", label: "YOLOFace" },
    { value: "mtcnn", label: "MTCNN" }
  ],
  expression_restorer_model: [
    { value: "live_portrait", label: "Live Portrait" }
  ],
  face_editor_model: [
    { value: "live_portrait", label: "Live Portrait" }
  ],
  frame_colorizer_model: [
    { value: "ddcolor", label: "DDColor" }
  ],
  lip_syncer_model: [
    { value: "wav2lip_gan", label: "Wav2Lip GAN" }
  ],
  deep_swapper_model: [
    { value: "inswapper_128", label: "InSwapper 128" }
  ]
};

// Direction options for age modifier
const DIRECTION_OPTIONS = [
  { value: "increase", label: "Increase Age" },
  { value: "decrease", label: "Decrease Age" }
];

const gradientButtonStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #A0D45B 0%, #DDFFB1 34.55%, #7EBE2A 100%)",
  color: "#0B1400",
};

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

  // Model options loaded from API by category - initialize first
  const [modelOptions, setModelOptions] = useState<Record<string, Feature[]>>({});
  const [loadingModels, setLoadingModels] = useState(false);

  // pisahkan processors dan features - hanya yang ACTIVE
  const processors = useMemo(() => {
    return features.filter(f => f.type === "processor" && f.status === "ACTIVE");
  }, [features]);

  // processors selection
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  // Available features berdasarkan processor yang dipilih
  const availableFeatures = useMemo(() => {
    const selectedProcessors = Object.keys(selected).filter(key => selected[key]);
    const availableOptions = new Set<string>();
    
    selectedProcessors.forEach(processor => {
      const options = PROCESSOR_OPTIONS[processor] || [];
      options.forEach(option => availableOptions.add(option));
    });

    // Filter features from API + create synthetic features for model categories
    const apiFeatures = features.filter(f => 
      (f.type === "feature" || f.type === "processor_option") && 
      f.status === "ACTIVE" && 
      availableOptions.has(f.name)
    );

    // Add synthetic model features for processors that need them
    const syntheticFeatures: Feature[] = [];
    selectedProcessors.forEach(processor => {
      const modelField = `${processor}_model`;
      if (PROCESSOR_OPTIONS[processor]?.includes(modelField)) {
        // Check if we already have this feature from API
        const existingFeature = apiFeatures.find(f => f.name === modelField);
        if (!existingFeature && (modelOptions[modelField]?.length > 0 || MODEL_OPTIONS[modelField as keyof typeof MODEL_OPTIONS])) {
          // Create synthetic feature for model selection
          syntheticFeatures.push({
            id: Date.now() + Math.random(), // temporary ID
            name: modelField,
            type: "processor_option",
            status: "ACTIVE",
            weight: 0,
            createdAt: new Date().toISOString(),
            category: modelField
          });
        }
      }

      // Add other processor-specific options as synthetic features
      const processorOptions = PROCESSOR_OPTIONS[processor] || [];
      processorOptions.forEach(optionName => {
        const existingFeature = apiFeatures.find(f => f.name === optionName);
        if (!existingFeature && !optionName.includes('model')) {
          syntheticFeatures.push({
            id: Date.now() + Math.random(),
            name: optionName,
            type: "feature",
            status: "ACTIVE", 
            weight: 0,
            createdAt: new Date().toISOString()
          });
        }
      });
    });

    return [...apiFeatures, ...syntheticFeatures];
  }, [features, selected, modelOptions]);

  // feature selection values
  const [featureValues, setFeatureValues] = useState<Record<string, any>>({});

  // Global options state
  const [globalOptions, setGlobalOptions] = useState<Record<string, any>>({
    outputVideoQuality: 90,
    faceSelectorMode: "automatic",
    faceSelectorGender: "any",
    useCuda: true
  });

  // quota & kalkulasi weight
  const [quota, setQuota] = useState<QuotaToday | null>(null);
  const totalSelectedWeight = useMemo(() => {
    return processors
      .filter(p => selected[p.name])
      .reduce((sum, p) => sum + (p.weight || 0), 0);
  }, [selected, processors]);

  // preview states
  const [sourcePreview, setSourcePreview] = useState<string>("");
  const [targetPreview, setTargetPreview] = useState<string>("");
  const [audioPreview, setAudioPreview] = useState<string>("");

  // job lifecycle
  const [submitting, setSubmitting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const pollTimer = useRef<NodeJS.Timeout | null>(null);

  // job history
  const [jobHistory, setJobHistory] = useState<Job[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // fetch quota dan features
  const fetchInitialData = async () => {
    try {
      console.log("Loading data...");
      
      // Load quota
      const quotaData = await fetchQuotaToday();
      setQuota(quotaData);
      console.log("Quota loaded:", quotaData);

      // Load ALL features (termasuk processors)
      setLoadingFeatures(true);
      const allFeatures = await fetchAllFeatures();
      setFeatures(allFeatures);
      console.log("Features loaded:", allFeatures);

      // Load model options by categories
      await loadModelOptions();

      // Set default selection untuk processors (face_swapper default checked jika ada)
      const defaultSelected: Record<string, boolean> = {};
      const processorFeatures = allFeatures.filter(f => f.type === "processor" && f.status === "ACTIVE");
      
      processorFeatures.forEach(f => {
        defaultSelected[f.name] = f.name === "face_swapper"; // default hanya face_swapper
      });
      setSelected(defaultSelected);
      console.log("Default selection:", defaultSelected);

    } catch (e) {
      console.error("Error loading data:", e);
    } finally {
      setLoadingFeatures(false);
    }
  };

  // fetch job history
  const fetchJobHistory = async () => {
    setLoadingHistory(true);
    try {
      // Use the same API as dashboard
      const jobs = await fetchJobs({ take: 20, skip: 0 });
      setJobHistory(jobs);
    } catch (e) {
      console.error("Error fetching job history:", e);
      setJobHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Load model options by categories with fallback to static data
  const loadModelOptions = async () => {
    setLoadingModels(true);
    try {
      // Try to load from API first
      try {
        const categories = await getModelCategories();
        const modelData: Record<string, Feature[]> = {};
        
        for (const category of categories) {
          try {
            const models = await getModelsByCategory(category);
            modelData[category] = models;
          } catch (err) {
            console.error(`Error loading models for category ${category}:`, err);
            // Fallback to static data for this category
            const staticModels = MODEL_OPTIONS[category as keyof typeof MODEL_OPTIONS] || [];
            modelData[category] = staticModels.map((model, index) => ({
              id: index + 1,
              name: `${category}_${model.value}`,
              value: model.value,
              type: "processor_option" as const,
              status: "ACTIVE" as const,
              weight: 0,
              createdAt: new Date().toISOString(),
              category: category
            }));
          }
        }
        
        setModelOptions(modelData);
        console.log("Model options loaded from API:", modelData);
      } catch (apiError) {
        console.warn("API endpoints not available, using static model options:", apiError);
        
        // Fallback to static model options
        const staticModelData: Record<string, Feature[]> = {};
        Object.entries(MODEL_OPTIONS).forEach(([category, models]) => {
          staticModelData[category] = models.map((model, index) => ({
            id: index + 1,
            name: `${category}_${model.value}`,
            value: model.value,
            type: "processor_option" as const,
            status: "ACTIVE" as const,
            weight: 0,
            createdAt: new Date().toISOString(),
            category: category
          }));
        });
        
        setModelOptions(staticModelData);
        console.log("Using static model options:", staticModelData);
      }
    } catch (err) {
      console.error("Error loading model options:", err);
      // Set empty model options as last resort
      setModelOptions({});
    } finally {
      setLoadingModels(false);
    }
  };

  // initial data loading
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Loading data...");
        
        // Load quota
        const quotaData = await fetchQuotaToday();
        setQuota(quotaData);
        console.log("Quota loaded:", quotaData);

        // Load ALL features (termasuk processors)
        setLoadingFeatures(true);
        const allFeatures = await fetchAllFeatures();
        setFeatures(allFeatures);
        console.log("Features loaded:", allFeatures);

        // Load model options by categories
        await loadModelOptions();

        // Set default selection untuk processors (face_swapper default checked jika ada)
        const defaultSelected: Record<string, boolean> = {};
        const processorFeatures = allFeatures.filter(f => f.type === "processor" && f.status === "ACTIVE");
        
        processorFeatures.forEach(f => {
          defaultSelected[f.name] = f.name === "face_swapper"; // default hanya face_swapper
        });
        setSelected(defaultSelected);
        console.log("Default selection:", defaultSelected);

        // Load job history
        await fetchJobHistory();

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
          // refresh job history after completion
          await fetchJobHistory();
        }
      } catch (e) {
        console.error(e);
      }
    }, 2000);
  };

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

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAudioFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioPreview(url);
    } else {
      setAudioPreview("");
    }
  };

  const removeSourceFile = () => {
    setSourceFile(null);
    setSourcePreview("");
  };

  const removeTargetFile = () => {
    setTargetFile(null);
    setTargetPreview("");
  };

  const removeAudioFile = () => {
    setAudioFile(null);
    setAudioPreview("");
  };

  // cleanup preview URLs
  useEffect(() => {
    return () => {
      if (sourcePreview) URL.revokeObjectURL(sourcePreview);
      if (targetPreview) URL.revokeObjectURL(targetPreview);
      if (audioPreview) URL.revokeObjectURL(audioPreview);
    };
  }, [sourcePreview, targetPreview, audioPreview]);

  // kirim job
  const canSubmit = !!sourceFile && !!targetFile && totalSelectedWeight > 0 && !submitting;

  const handleSubmit = async () => {
    if (!sourceFile || !targetFile) return;

    // Validate required models for selected processors
    const validationErrors: string[] = [];
    const selectedProcessors = Object.keys(selected).filter(key => selected[key]);
    
    selectedProcessors.forEach(processor => {
      // Check if processor requires a model
      const modelField = `${processor}_model`;
      if (PROCESSOR_OPTIONS[processor]?.includes(modelField)) {
        // Check if it's a required model processor
        if (['face_enhancer', 'frame_enhancer', 'expression_restorer', 'face_editor', 'frame_colorizer', 'lip_syncer', 'deep_swapper'].includes(processor)) {
          const hasModelValue = featureValues[modelField] || globalOptions[modelField];
          const categoryModels = modelOptions[modelField] || [];
          
          if (!hasModelValue && categoryModels.length > 0) {
            validationErrors.push(`${processor.replace('_', ' ')} requires a model selection`);
          }
        }
      }
    });

    if (validationErrors.length > 0) {
      alert('Please fix the following issues:\n' + validationErrors.join('\n'));
      return;
    }

    setSubmitting(true);
    setJobId(null);
    setJob(null);

    try {
      // Prepare the job payload according to backend API
      const jobPayload = {
        processors: selectedProcessors,
        options: {
          ...globalOptions,
          ...featureValues,
          // Face editor params need to be structured properly
          ...(featureValues.face_editor_model && {
            faceEditorParams: {
              eyeOpenRatio: featureValues.face_editor_eye_open_ratio || 1.0,
              mouthSmile: featureValues.face_editor_mouth_smile || 0.0,
              headYaw: featureValues.face_editor_head_yaw || 0.0,
              headPitch: featureValues.face_editor_head_pitch || 0.0,
              headRoll: featureValues.face_editor_head_roll || 0.0,
              eyeGazeHorizontal: featureValues.face_editor_eye_gaze_horizontal || 0.0,
              eyeGazeVertical: featureValues.face_editor_eye_gaze_vertical || 0.0,
              lipOpenRatio: featureValues.face_editor_lip_open_ratio || 1.0,
              mouthGrim: featureValues.face_editor_mouth_grim || 0.0,
              mouthPout: featureValues.face_editor_mouth_pout || 0.0,
              mouthPositionHorizontal: featureValues.face_editor_mouth_position_horizontal || 0.0,
              mouthPositionVertical: featureValues.face_editor_mouth_position_vertical || 0.0,
              eyebrowDirection: featureValues.face_editor_eyebrow_direction || 0.0
            }
          })
        }
      };

      // Create FormData for file upload
      const form = new FormData();
      form.append("source", sourceFile);
      form.append("target", targetFile);
      if (audioFile) form.append("audio", audioFile);
      
      // Add job data as JSON string
      form.append("jobData", JSON.stringify(jobPayload));

      const { id } = await createUploadedProcess(form);
      setJobId(id);
      startPolling(id);
      
      // Refresh job history immediately after creating new job
      await fetchJobHistory();
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
      // Refresh job history after requeue
      await fetchJobHistory();
    } catch (e: any) {
      alert(e?.message ?? "Gagal requeue job");
    }
  };

  // handle retry from history
  const handleRetryFromHistory = async (retryJobId: string) => {
    try {
      const j = await requeueJob(retryJobId);
      // Update the job in history
      setJobHistory(prev => prev.map(job => 
        job.id === retryJobId ? j : job
      ));
      // If this is the current job, update it too
      if (retryJobId === jobId) {
        setJob(j);
        startPolling(retryJobId);
      }
      // Refresh job history to get latest data
      await fetchJobHistory();
    } catch (e: any) {
      alert(e?.message ?? "Gagal retry job");
    }
  };

  // Get file type helper
  const getFileType = (file: File) => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'unknown';
  };

  // Render model selector for processor-specific models using category-based options
  const renderModelSelector = (processorName: string, feature: Feature) => {
    const categoryModels = modelOptions[feature.name] || [];
    
    // Fallback to static options if no API data
    const fallbackModels = MODEL_OPTIONS[feature.name as keyof typeof MODEL_OPTIONS] || [];
    const modelsToUse = categoryModels.length > 0 ? categoryModels : fallbackModels.map((model, index) => ({
      id: index + 1,
      name: `${feature.name}_${model.value}`,
      value: model.value,
      type: "processor_option" as const,
      status: "ACTIVE" as const,
      weight: 0,
      createdAt: new Date().toISOString(),
      category: feature.name
    }));
    
    return (
      <div key={feature.id} className="space-y-1">
        <label className="text-xs font-medium text-slate-400">
          Model *
        </label>
        <select
          className="w-full h-7 text-xs bg-gray-700 border border-gray-600 rounded px-2 text-white"
          value={featureValues[feature.name] || feature.value || ''}
          onChange={(e) => setFeatureValues(prev => ({ 
            ...prev, 
            [feature.name]: e.target.value 
          }))}
        >
          <option value="">Select Model</option>
          {modelsToUse.map(model => (
            <option key={model.id || model.value} value={model.value}>
              {model.value?.replace(/_/g, ' ').toUpperCase()}
            </option>
          ))}
        </select>
        {loadingModels && modelsToUse.length === 0 && (
          <p className="text-xs text-blue-400">Loading models...</p>
        )}
        {!loadingModels && modelsToUse.length === 0 && (
          <p className="text-xs text-yellow-400">No models available</p>
        )}
        {!featureValues[feature.name] && !feature.value && (
          <p className="text-xs text-red-400">Required for {processorName.replace('_', ' ')}</p>
        )}
      </div>
    );
  };

  // Render direction selector for age modifier
  const renderDirectionSelector = (feature: Feature) => {
    return (
      <div key={feature.id} className="space-y-1">
        <label className="text-xs font-medium text-slate-400">
          Direction
        </label>
        <select
          className="w-full h-7 text-xs bg-gray-700 border border-gray-600 rounded px-2 text-white"
          value={featureValues[feature.name] || feature.value || ''}
          onChange={(e) => setFeatureValues(prev => ({ 
            ...prev, 
            [feature.name]: e.target.value 
          }))}
        >
          <option value="">Default</option>
          {DIRECTION_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <main className="relative z-[60] pointer-events-auto text-white h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold">FaceFusion</h1>
          <p className="text-slate-400 text-sm">Generate face swap videos</p>

          {/* Quota info */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-400">
              Quota: <span className="text-white">{fmt(quota?.remaining ?? 0)}</span> / {fmt(quota?.dailyLimit ?? 0)}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={gradientButtonStyle}
              className="font-semibold disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  START
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Controls */}
        <div className="w-80 border-r border-gray-800 overflow-y-auto">
          {/* Source Upload */}
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-sm font-medium text-slate-300 mb-3">SOURCE</h3>
            <div className="relative">
              {!sourceFile ? (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-gray-600">
                  <ImgIcon className="w-8 h-8 text-gray-500 mb-2" />
                  <span className="text-sm text-gray-500">Choose source image</span>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleSourceFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative">
                  <img
                    src={sourcePreview}
                    alt="Source"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    onClick={removeSourceFile}
                    className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-600 hover:bg-red-700"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                  <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    SOURCE
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Target Upload */}
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-sm font-medium text-slate-300 mb-3">TARGET</h3>
            <div className="relative">
              {!targetFile ? (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="w-6 h-6 text-gray-500" />
                    <ImgIcon className="w-6 h-6 text-gray-500" />
                  </div>
                  <span className="text-sm text-gray-500">Choose target image or video</span>
                  <span className="text-xs text-gray-600 mt-1">Supports JPG, PNG, MP4, etc.</span>
                  <Input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleTargetFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative">
                  {getFileType(targetFile) === 'video' ? (
                    <video
                      src={targetPreview}
                      className="w-full h-32 object-cover rounded-lg"
                      muted
                    />
                  ) : (
                    <img
                      src={targetPreview}
                      alt="Target"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  )}
                  <Button
                    onClick={removeTargetFile}
                    className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-600 hover:bg-red-700"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                  <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    {getFileType(targetFile) === 'video' ? (
                      <Video className="w-3 h-3" />
                    ) : (
                      <ImgIcon className="w-3 h-3" />
                    )}
                    TARGET
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Audio Upload */}
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-sm font-medium text-slate-300 mb-3">AUDIO (Optional)</h3>
            <div className="relative">
              {!audioFile ? (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-gray-600">
                  <Music className="w-6 h-6 text-gray-500 mb-1" />
                  <span className="text-sm text-gray-500">Choose audio file</span>
                  <span className="text-xs text-gray-600">MP3, WAV, etc.</span>
                  <Input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Music className="w-4 h-4 text-blue-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{audioFile.name}</p>
                      <p className="text-xs text-slate-400">
                        {(audioFile.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                    <Button
                      onClick={removeAudioFile}
                      className="h-6 w-6 p-0 bg-red-600 hover:bg-red-700"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  {audioPreview && (
                    <audio 
                      src={audioPreview} 
                      controls 
                      className="w-full mt-2 h-8"
                      style={{ height: '32px' }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Processors */}
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-sm font-medium text-slate-300 mb-3">PROCESSORS</h3>
            {loadingFeatures ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : processors.length === 0 ? (
              <div className="text-center text-slate-400 py-4">
                <p className="text-sm">No processors found.</p>
                <p className="text-xs">Add processors in Features management.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {processors.map((processor) => {
                  const checked = !!selected[processor.name];
                  return (
                    <label
                      key={processor.id}
                      className={clsx(
                        "flex items-center gap-3 p-2 rounded border cursor-pointer text-sm transition-colors",
                        checked 
                          ? "border-red-600 bg-red-600/10 text-white" 
                          : "border-gray-700 bg-gray-800/40 hover:bg-gray-800/70 text-slate-300"
                      )}
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={checked}
                        onChange={() => setSelected(prev => ({ 
                          ...prev, 
                          [processor.name]: !prev[processor.name] 
                        }))}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{processor.name}</div>
                        <div className="text-xs text-slate-400">Weight: {processor.weight || 0}</div>
                        {processor.description && (
                          <div className="text-xs text-slate-500 mt-1">{processor.description}</div>
                        )}
                      </div>
                    </label>
                  );
                })}
                
                {/* Total Weight Display */}
                <div className="mt-3 p-2 bg-gray-800/50 rounded border border-gray-700">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300">Total Weight:</span>
                    <span className={clsx(
                      "font-medium",
                      totalSelectedWeight > (quota?.remaining ?? 0) ? "text-red-400" : "text-emerald-400"
                    )}>
                      {totalSelectedWeight}
                    </span>
                  </div>
                  {totalSelectedWeight > (quota?.remaining ?? 0) && (
                    <p className="text-xs text-red-400 mt-1">
                      Exceeds remaining quota ({quota?.remaining ?? 0})
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Selected Processor Features */}
          {Object.keys(selected).filter(key => selected[key]).length > 0 && (
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-sm font-medium text-slate-300 mb-3">PROCESSOR OPTIONS</h3>
              <div className="space-y-3">
                {Object.keys(selected).filter(key => selected[key]).map(processorName => {
                  const processor = processors.find(p => p.name === processorName);
                  
                  // Get all possible options for this processor
                  const processorOptionNames = PROCESSOR_OPTIONS[processorName] || [];
                  const processorFeatures = processorOptionNames.map(optionName => {
                    // Try to find existing feature first
                    let feature = availableFeatures.find(f => f.name === optionName);
                    
                    // If not found, create synthetic feature
                    if (!feature) {
                      feature = {
                        id: Date.now() + Math.random(),
                        name: optionName,
                        type: optionName.includes('model') ? "processor_option" : "feature",
                        status: "ACTIVE",
                        weight: 0,
                        createdAt: new Date().toISOString(),
                        category: optionName.includes('model') ? optionName : undefined
                      };
                    }
                    
                    return feature;
                  }).filter(Boolean);
                  
                  if (processorFeatures.length === 0) {
                    // Show default message but still show the processor card
                    return (
                      <div key={processorName} className="border border-gray-700 rounded-lg p-3 bg-gray-800/30">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <h4 className="text-xs font-medium text-slate-200 uppercase">
                            {processorName.replace(/_/g, ' ')}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-400">Using default settings</p>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={processorName} className="border border-gray-700 rounded-lg p-3 bg-gray-800/30">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <h4 className="text-xs font-medium text-slate-200 uppercase">
                          {processorName.replace(/_/g, ' ')}
                        </h4>
                      </div>
                      
                      <div className="space-y-2">
                        {processorFeatures.map((feature) => {
                          // Handle model selection
                          if (feature.name.includes('model')) {
                            return renderModelSelector(processorName, feature);
                          }
                          
                          // Handle direction selection for age modifier
                          if (feature.name.includes('direction')) {
                            return renderDirectionSelector(feature);
                          }
                          
                          // Handle blend options
                          if (feature.name.includes('blend')) {
                            return (
                              <div key={feature.id} className="space-y-1">
                                <label className="text-xs font-medium text-slate-400">
                                  Blend Strength (%)
                                </label>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                  value={featureValues[feature.name] ?? feature.value ?? 80}
                                  onChange={(e) => setFeatureValues(prev => ({ 
                                    ...prev, 
                                    [feature.name]: Number(e.target.value) 
                                  }))}
                                />
                                <div className="text-xs text-slate-400 text-center">
                                  {(featureValues[feature.name] ?? feature.value ?? 80)}%
                                </div>
                              </div>
                            );
                          }

                          // Handle factor options
                          if (feature.name.includes('factor')) {
                            return (
                              <div key={feature.id} className="space-y-1">
                                <label className="text-xs font-medium text-slate-400">
                                  Enhancement Factor (%)
                                </label>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                  value={featureValues[feature.name] ?? feature.value ?? 75}
                                  onChange={(e) => setFeatureValues(prev => ({ 
                                    ...prev, 
                                    [feature.name]: Number(e.target.value) 
                                  }))}
                                />
                                <div className="text-xs text-slate-400 text-center">
                                  {(featureValues[feature.name] ?? feature.value ?? 75)}%
                                </div>
                              </div>
                            );
                          }

                          // Handle weight options (like lip_syncer_weight)
                          if (feature.name.includes('weight')) {
                            return (
                              <div key={feature.id} className="space-y-1">
                                <label className="text-xs font-medium text-slate-400">
                                  Weight (%)
                                </label>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                  value={featureValues[feature.name] ?? feature.value ?? 50}
                                  onChange={(e) => setFeatureValues(prev => ({ 
                                    ...prev, 
                                    [feature.name]: Number(e.target.value) 
                                  }))}
                                />
                                <div className="text-xs text-slate-400 text-center">
                                  {(featureValues[feature.name] ?? feature.value ?? 50)}%
                                </div>
                              </div>
                            );
                          }

                          // Handle pixel boost (boolean option)
                          if (feature.name.includes('pixel_boost')) {
                            return (
                              <div key={feature.id} className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={featureValues[feature.name] ?? feature.value ?? false}
                                    onChange={(e) => setFeatureValues(prev => ({ 
                                      ...prev, 
                                      [feature.name]: e.target.checked 
                                    }))
                                    }
                                    className="w-4 h-4"
                                  />
                                  <label className="text-xs text-slate-400">Enable Pixel Boost</label>
                                </div>
                              </div>
                            );
                          }

                          // Handle face editor specific parameters
                          if (feature.name.startsWith('face_editor_') && !feature.name.includes('model')) {
                            let min = -1, max = 1, step = 0.1, defaultValue = 0;
                            
                            // Set specific ranges for different parameters
                            if (feature.name.includes('ratio')) {
                              min = 0; max = 2; defaultValue = 1;
                            } else if (feature.name.includes('head_')) {
                              min = -30; max = 30; step = 1; defaultValue = 0;
                            }
                            
                            return (
                              <div key={feature.id} className="space-y-1">
                                <label className="text-xs font-medium text-slate-400">
                                  {feature.name.replace(/face_editor_|_/g, ' ').trim()}
                                </label>
                                <input
                                  type="range"
                                  min={min}
                                  max={max}
                                  step={step}
                                  className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                  value={featureValues[feature.name] ?? feature.value ?? defaultValue}
                                  onChange={(e) => setFeatureValues(prev => ({ 
                                    ...prev, 
                                    [feature.name]: Number(e.target.value) 
                                  }))}
                                />
                                <div className="text-xs text-slate-400 text-center">
                                  {(featureValues[feature.name] ?? feature.value ?? defaultValue).toFixed(step < 1 ? 1 : 0)}
                                </div>
                              </div>
                            );
                          }

                          // Handle debugger items
                          if (feature.name.includes('debugger_items')) {
                            return (
                              <div key={feature.id} className="space-y-1">
                                <label className="text-xs font-medium text-slate-400">
                                  Debug Items
                                </label>
                                <select
                                  className="w-full h-7 text-xs bg-gray-700 border border-gray-600 rounded px-2 text-white"
                                  value={featureValues[feature.name] || feature.value || ''}
                                  onChange={(e) => setFeatureValues(prev => ({ 
                                    ...prev, 
                                    [feature.name]: e.target.value 
                                  }))}
                                >
                                  <option value="">None</option>
                                  <option value="face_detector">Face Detector</option>
                                  <option value="face_landmarker">Face Landmarker</option>
                                  <option value="face_mask">Face Mask</option>
                                  <option value="all">All Debug Items</option>
                                </select>
                              </div>
                            );
                          }

                          // Handle morph for deep swapper
                          if (feature.name.includes('morph')) {
                            return (
                              <div key={feature.id} className="space-y-1">
                                <label className="text-xs font-medium text-slate-400">
                                  Morph Factor (%)
                                </label>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                  value={featureValues[feature.name] ?? feature.value ?? 50}
                                  onChange={(e) => setFeatureValues(prev => ({ 
                                    ...prev, 
                                    [feature.name]: Number(e.target.value) 
                                  }))}
                                />
                                <div className="text-xs text-slate-400 text-center">
                                  {(featureValues[feature.name] ?? feature.value ?? 50)}%
                                </div>
                              </div>
                            );
                          }
                          
                          // Default text input for any other options
                          return (
                            <div key={feature.id} className="space-y-1">
                              <label className="text-xs font-medium text-slate-400">
                                {feature.name.replace(/_/g, ' ').replace(processorName.replace(/_/g, ' '), '').trim()}
                              </label>
                              <Input
                                type="text"
                                className="h-7 text-xs bg-gray-700 border-gray-600 text-white"
                                value={featureValues[feature.name] || feature.value || ''}
                                onChange={(e) => setFeatureValues(prev => ({ 
                                  ...prev, 
                                  [feature.name]: e.target.value 
                                }))}
                                placeholder={feature.value || "Enter value"}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Global Options */}
          <div className="p-4">
            <h3 className="text-sm font-medium text-slate-300 mb-3">GLOBAL OPTIONS</h3>
            <div className="space-y-3">
              
              {/* Output Video Quality */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">
                  Output Video Quality (%)
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  value={globalOptions.outputVideoQuality}
                  onChange={(e) => setGlobalOptions(prev => ({ 
                    ...prev, 
                    outputVideoQuality: Number(e.target.value) 
                  }))}
                />
                <div className="text-xs text-slate-400 text-center">
                  {globalOptions.outputVideoQuality}%
                </div>
              </div>

              {/* Face Selector Mode */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">
                  Face Selector Mode
                </label>
                <select
                  className="w-full h-7 text-xs bg-gray-700 border border-gray-600 rounded px-2 text-white"
                  value={globalOptions.faceSelectorMode}
                  onChange={(e) => setGlobalOptions(prev => ({ 
                    ...prev, 
                    faceSelectorMode: e.target.value 
                  }))}
                >
                  <option value="automatic">Automatic</option>
                  <option value="reference">Reference</option>
                  <option value="one">One</option>
                  <option value="many">Many</option>
                  <option value="best-worst">Best-Worst</option>
                  <option value="left-right">Left-Right</option>
                </select>
              </div>

              {/* Face Selector Gender */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">
                  Face Selector Gender
                </label>
                <select
                  className="w-full h-7 text-xs bg-gray-700 border border-gray-600 rounded px-2 text-white"
                  value={globalOptions.faceSelectorGender}
                  onChange={(e) => setGlobalOptions(prev => ({ 
                    ...prev, 
                    faceSelectorGender: e.target.value 
                  }))}
                >
                  <option value="any">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* Use CUDA */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={globalOptions.useCuda}
                  onChange={(e) => setGlobalOptions(prev => ({ 
                    ...prev, 
                    useCuda: e.target.checked 
                  }))}
                  className="w-4 h-4"
                />
                <label className="text-xs text-slate-400">Use CUDA (GPU Acceleration)</label>
              </div>

            </div>
          </div>

          {/* Available Features - Dynamic based on selected processors */}
          {availableFeatures.length > 0 && Object.keys(selected).filter(key => selected[key]).length === 0 && (
            <div className="p-4">
              <h3 className="text-sm font-medium text-slate-300 mb-3">OPTIONS</h3>
              <div className="text-center text-slate-400 py-4">
                <p className="text-sm">Select processors to see available options</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Preview & History */}
        <div className="flex-1 flex flex-col">
          {/* Preview Area */}
          <div className="h-64 bg-gradient-to-br from-purple-900/20 to-blue-900/20 flex items-center justify-center border-b border-gray-800">
            {targetPreview ? (
              <div className="relative max-w-sm max-h-full p-4">
                {getFileType(targetFile!) === 'video' ? (
                  <video
                    src={targetPreview}
                    className="max-w-full max-h-48 rounded-lg shadow-lg object-contain"
                    controls
                    muted
                  />
                ) : (
                  <img
                    src={targetPreview}
                    alt="Target Preview"
                    className="max-w-full max-h-48 rounded-lg shadow-lg object-contain"
                  />
                )}
                <div className="absolute top-6 right-6 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  {getFileType(targetFile!) === 'video' ? (
                    <Video className="w-3 h-3" />
                  ) : (
                    <ImgIcon className="w-3 h-3" />
                  )}
                  PREVIEW
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Video className="w-12 h-12 opacity-50" />
                  <ImgIcon className="w-12 h-12 opacity-50" />
                </div>
                <p className="text-sm">Upload target image or video to see preview</p>
                <p className="text-xs text-slate-500 mt-1">Supports images and videos</p>
              </div>
            )}
          </div>

          {/* Job Status */}
          <div className="p-4 border-t border-gray-800">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h3 className="text-sm font-medium mb-2">Job Status</h3>
              {!jobId ? (
                <p className="text-xs text-slate-400">No active job</p>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Job ID:</span>
                    <span className="font-mono">{jobId.substring(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Status:</span>
                    <span className={clsx(
                      "px-2 py-0.5 rounded",
                      job?.status === "SUCCEEDED" && "bg-emerald-600/20 text-emerald-300",
                      job?.status === "FAILED" && "bg-red-600/20 text-red-300",
                      job?.status === "RUNNING" && "bg-blue-600/20 text-blue-300",
                      job?.status === "QUEUED" && "bg-yellow-600/20 text-yellow-300"
                    )}>
                      {job?.status ?? "QUEUED"}
                    </span>
                  </div>
                  {job?.error && (
                    <p className="text-xs text-red-400 break-words">{job.error}</p>
                  )}
                  {job?.status === "FAILED" && (
                    <Button
                      onClick={handleRequeue}
                      size="sm"
                      className="mt-2 bg-red-600 hover:bg-red-700"
                    >
                      <RefreshCcw className="w-3 h-3 mr-1" />
                      Retry
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Job History Table */}
          <div className="border-t border-gray-800 max-h-80 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Job History</h3>
                <Button
                  onClick={fetchJobHistory}
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  disabled={loadingHistory}
                >
                  {loadingHistory ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCcw className="w-3 h-3" />
                  )}
                </Button>
              </div>

              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : jobHistory.length === 0 ? (
                <div className="text-center text-slate-400 py-4">
                  <p className="text-sm">No jobs found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {jobHistory.slice(0, 10).map((historyJob) => (
                    <div
                      key={historyJob.id}
                      className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg text-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-slate-400">
                            {historyJob.id.substring(0, 8)}...
                          </span>
                          <div className="flex items-center gap-1">
                            {historyJob.status === "SUCCEEDED" && (
                              <CheckCircle className="w-3 h-3 text-emerald-400" />
                            )}
                            {historyJob.status === "FAILED" && (
                              <XCircle className="w-3 h-3 text-red-400" />
                            )}
                            {historyJob.status === "RUNNING" && (
                              <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                            )}
                            {historyJob.status === "QUEUED" && (
                              <Clock className="w-3 h-3 text-yellow-400" />
                            )}
                            <span className={clsx(
                              "text-xs px-1.5 py-0.5 rounded",
                              historyJob.status === "SUCCEEDED" && "bg-emerald-600/20 text-emerald-300",
                              historyJob.status === "FAILED" && "bg-red-600/20 text-red-300",
                              historyJob.status === "RUNNING" && "bg-blue-600/20 text-blue-300",
                              historyJob.status === "QUEUED" && "bg-yellow-600/20 text-yellow-300"
                            )}>
                              {historyJob.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-xs text-slate-400 truncate">
                          {historyJob.createdAt && new Date(historyJob.createdAt).toLocaleString()}
                        </div>
                        
                        <div className="text-xs text-slate-300 truncate mt-1">
                          {Array.isArray(historyJob.processors) ? historyJob.processors.join(", ") : "-"}
                        </div>
                        
                        {historyJob.error && (
                          <div className="text-xs text-red-400 mt-1 truncate">
                            {historyJob.error}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-2">
                        {historyJob.status === "FAILED" && (
                          <Button
                            onClick={() => handleRetryFromHistory(historyJob.id)}
                            size="sm"
                            className="h-6 px-2 bg-red-600 hover:bg-red-700 text-xs"
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Retry
                          </Button>
                        )}
                        
                        {historyJob.status === "SUCCEEDED" && historyJob.resultUrl && (
                          <Button
                            onClick={() => window.open(historyJob.resultUrl, '_blank')}
                            size="sm"
                            className="h-6 px-2 bg-emerald-600 hover:bg-emerald-700 text-xs"
                          >
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {jobHistory.length > 10 && (
                    <div className="text-center pt-2">
                      <span className="text-xs text-slate-400">
                        Showing 10 of {jobHistory.length} jobs
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}