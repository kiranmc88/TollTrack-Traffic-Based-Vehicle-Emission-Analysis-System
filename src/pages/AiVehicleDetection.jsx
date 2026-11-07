import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Upload,
  Trash2,
  Play,
  Download,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  HelpCircle,
  Truck,
  Car,
  Bus,
  Bike,
  Route,
  Cloud,
  Zap,
  BarChart2,
  PieChart as PieChartIcon,
  RefreshCw,
  Plus,
  X,
  Layers,
  Sparkles,
  ExternalLink,
  Sliders,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { DEFAULT_EMISSION_FACTORS } from '../data/emissionFactors';
import { formatNumber, formatEmissions, formatNox } from '../utils/formatters';

// Configurable backend URL from environment variables
// Priority:
// 1. VITE_AI_API_URL (Primary standard)
// 2. VITE_BACKEND_URL / VITE_API_URL (Alternative fallbacks)
// 3. Local development fallback: 'http://127.0.0.1:5000' during DEV mode
// 4. Production fallback: '' (Unconfigured - alerts user with Vercel configuration instructions)
const RAW_BACKEND_URL = (
  import.meta.env.VITE_AI_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://127.0.0.1:5000' : '')
).replace(/\/+$/, '');

const IS_PROD_WITHOUT_URL = Boolean(!RAW_BACKEND_URL && !import.meta.env.DEV);

/**
 * Resilient API fetch:
 * - Direct calls to RAW_BACKEND_URL (Render backend or localhost)
 * - Dev fallback to relative path via Vite proxy if needed
 * - Configurable request timeout (Render cold starts may take ~30-50s)
 */
async function apiFetch(endpoint, options = {}, timeoutMs = 60000) {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = RAW_BACKEND_URL ? `${RAW_BACKEND_URL}${path}` : path;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const fetchOptions = {
    ...options,
    signal: options.signal || controller.signal,
  };

  try {
    const res = await fetch(fullUrl, fetchOptions);
    clearTimeout(timeoutId);
    return res;
  } catch (directErr) {
    clearTimeout(timeoutId);

    // If running in Vite dev server and direct connection failed, try relative path proxy
    if (import.meta.env.DEV && RAW_BACKEND_URL) {
      try {
        const relRes = await fetch(path, options);
        return relRes;
      } catch {
        throw directErr;
      }
    }
    throw directErr;
  }
}

const ALL_CATEGORIES = [
  'Car / Jeep / Van',
  'Mini LCV',
  'LCV',
  'Bus',
  '2-Axle Truck',
  '3-Axle Truck',
  'Multi-Axle Vehicle / OSV',
  'Motorcycle / 2-Wheeler'
];

const CATEGORY_COLORS = {
  'Car / Jeep / Van': '#10b981',        // Emerald
  'Mini LCV': '#38bdf8',                // Light Sky
  'LCV': '#3b82f6',                     // Blue
  'Bus': '#8b5cf6',                     // Purple
  '2-Axle Truck': '#f59e0b',            // Amber
  '3-Axle Truck': '#ea580c',            // Orange
  'Multi-Axle Vehicle / OSV': '#ef4444',// Red
  'Motorcycle / 2-Wheeler': '#06b6d4',  // Cyan
};

const PIE_PALETTE = ['#10b981', '#38bdf8', '#3b82f6', '#8b5cf6', '#f59e0b', '#ea580c', '#ef4444', '#06b6d4'];

const DISTANCE_PRESETS = [
  { label: '10 km (Local Bypass)', value: 10 },
  { label: '25 km (Corridor)', value: 25 },
  { label: '50 km (Standard Default)', value: 50 },
  { label: '75 km (Suburban Transit)', value: 75 },
  { label: '100 km (Intercity Haul)', value: 100 },
];

export default function AiVehicleDetection({ onNavigate }) {
  // Input & State
  const [selectedImage, setSelectedImage] = useState(null); // File or dataUrl
  const [imagePreview, setImagePreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [viewMode, setViewMode] = useState('annotated'); // 'annotated' | 'original' | 'split'
  const [distanceKm, setDistanceKm] = useState(50);

  // Detection & Results
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisPhase, setAnalysisPhase] = useState('');
  const [detections, setDetections] = useState([]);
  const [annotatedImage, setAnnotatedImage] = useState(null);
  const [emissionResults, setEmissionResults] = useState(null);
  const [analysisDate, setAnalysisDate] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Backend Health
  const [backendStatus, setBackendStatus] = useState(IS_PROD_WITHOUT_URL ? 'unconfigured' : 'checking'); // 'online' | 'offline' | 'checking' | 'waking' | 'unconfigured'
  const [backendInfo, setBackendInfo] = useState(null);

  // Camera Modal State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('environment'); // 'environment' | 'user'
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Check Backend Health on Mount and Periodically
  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(() => {
      checkBackendHealth(true);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const checkBackendHealth = async (silent = false) => {
    if (IS_PROD_WITHOUT_URL) {
      setBackendStatus('unconfigured');
      return false;
    }

    if (!silent) setBackendStatus('checking');

    let wakingTimer = null;
    if (!silent) {
      wakingTimer = setTimeout(() => {
        setBackendStatus('waking');
      }, 3000);
    }

    try {
      const res = await apiFetch('/api/health', {
        method: 'GET',
      }, 20000);

      if (wakingTimer) clearTimeout(wakingTimer);

      if (res && res.ok) {
        const data = await res.json();
        setBackendInfo(data);

        // Mark online ONLY when data.model_loaded === true (or data.ai_ready === true)
        if (data && (data.model_loaded === true || data.ai_ready === true)) {
          setBackendStatus('online');
          if (!silent) setErrorMsg(null);
          return true;
        } else {
          // Backend is reachable, but YOLO model is not loaded
          setBackendStatus('model_error');
          if (!silent) {
            setErrorMsg(
              data.model_error
                ? `AI Model Unavailable: ${data.model_error}`
                : 'Flask server is online, but the YOLO model failed to load. AI analysis cannot proceed.'
            );
          }
          return false;
        }
      }
      setBackendStatus('offline');
      return false;
    } catch {
      if (wakingTimer) clearTimeout(wakingTimer);
      setBackendStatus('offline');
      return false;
    }
  };

  // Start Camera Stream
  const startCamera = async () => {
    setIsCameraOpen(true);
    setCameraError(null);
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in your browser settings.'
          : `Failed to access camera: ${err.message}`
      );
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const switchCameraFacing = () => {
    setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  useEffect(() => {
    if (isCameraOpen) {
      startCamera();
    }
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraFacing]);

  // Capture Frame from Video
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    setSelectedImage(dataUrl);
    setImagePreview(dataUrl);
    setFileName(`camera_capture_${Date.now()}.jpg`);
    setDetections([]);
    setAnnotatedImage(null);
    setEmissionResults(null);
    setErrorMsg(null);
    setSuccessMsg(null);
    stopCamera();
  };

  // File Upload Handling
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setErrorMsg('Invalid file format. Please upload a JPG, JPEG, PNG, or WEBP image.');
      return;
    }

    if (file.size > 16 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 16MB limit.');
      return;
    }

    setSelectedImage(file);
    setFileName(file.name);
    setDetections([]);
    setAnnotatedImage(null);
    setEmissionResults(null);
    setErrorMsg(null);
    setSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Remove Selected Image
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setFileName('');
    setDetections([]);
    setAnnotatedImage(null);
    setEmissionResults(null);
    setErrorMsg(null);
    setSuccessMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Run Genuine AI Vehicle Detection
  const analyzeTraffic = async () => {
    if (!selectedImage) {
      setErrorMsg('Please select or capture an image first.');
      return;
    }

    if (IS_PROD_WITHOUT_URL) {
      setErrorMsg(
        'Backend URL is not configured. Please set VITE_AI_API_URL in your Vercel Project Settings > Environment Variables, and redeploy.'
      );
      return;
    }

    // Ping backend to wake up / verify connection
    let isLive = backendStatus === 'online';
    if (!isLive) {
      setAnalysisPhase('Connecting to Flask AI backend (verifying YOLO model readiness)...');
      isLive = await checkBackendHealth();
    }

    if (!isLive) {
      if (backendStatus === 'model_error') {
        setErrorMsg(
          backendInfo?.model_error
            ? `AI Model Unavailable: ${backendInfo.model_error}. The Flask backend is reachable, but the YOLO detection model is not loaded. Cannot run vehicle detection.`
            : 'The Flask backend is reachable, but the YOLO model is not loaded. Please verify the AI model configuration.'
        );
      } else if (RAW_BACKEND_URL && RAW_BACKEND_URL.includes('.hf.space')) {
        setErrorMsg(
          `The Hugging Face Space at ${RAW_BACKEND_URL} is currently booting or waking up (~15–30s). Please wait a few seconds and click "Retry Connection".`
        );
      } else if (RAW_BACKEND_URL && RAW_BACKEND_URL.includes('onrender.com')) {
        setErrorMsg(
          `The backend at ${RAW_BACKEND_URL} is currently asleep or starting up. Please wait a moment and click "Retry Connection".`
        );
      } else {
        setErrorMsg(
          `The AI backend is offline (${RAW_BACKEND_URL || 'localhost:5000'}). Please start the backend or verify VITE_AI_API_URL in your Vercel project environment variables.`
        );
      }
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setAnalysisPhase('Uploading image file...');

    try {
      let response;
      if (selectedImage instanceof File) {
        setAnalysisPhase('Executing YOLOv8 vehicle detection & classification...');
        const formData = new FormData();
        formData.append('image', selectedImage, selectedImage.name || 'traffic.jpg');
        formData.append('distance', distanceKm.toString());
        response = await apiFetch('/api/detect', { method: 'POST', body: formData }, 90000);
      } else {
        // Base64 string from camera capture
        setAnalysisPhase('Executing YOLOv8 vehicle detection & classification...');
        response = await apiFetch('/api/detect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: selectedImage, distance: distanceKm }),
        }, 90000);
      }

      setAnalysisPhase('Quantifying CO2 and NOx emissions with ARAI/CPCB standards...');
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to detect vehicles in image.');
      }

      const totalFound = result.total_detected || 0;
      setDetections(result.detections || []);
      setAnnotatedImage(result.annotated_image || null);
      setEmissionResults(result.emissions || null);
      setAnalysisDate(result.analysis_date || new Date().toLocaleString());
      setViewMode('annotated');

      if (totalFound > 0) {
        setSuccessMsg(
          `Analysis successful: ${totalFound} vehicle${totalFound === 1 ? '' : 's'} detected and classified.`
        );
      } else {
        setErrorMsg(
          'No vehicles were detected in the uploaded image. Ensure vehicles are clearly visible with adequate lighting.'
        );
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error occurred during AI vehicle detection.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisPhase('');
    }
  };

  // Interactive Correction: User modifies vehicle category
  const handleCategoryChange = async (detId, newCategory) => {
    const updatedDetections = detections.map((det) =>
      det.id === detId ? { ...det, category: newCategory, manuallyCorrected: true } : det
    );
    setDetections(updatedDetections);
    recalculateEmissions(updatedDetections, distanceKm);
  };

  // Remove false positive detection
  const handleRemoveDetection = (detId) => {
    const updated = detections.filter((d) => d.id !== detId);
    setDetections(updated);
    recalculateEmissions(updated, distanceKm);
  };

  // Add manual vehicle
  const handleAddManualVehicle = () => {
    const newId = `manual_${Date.now()}`;
    const newDet = {
      id: newId,
      raw_class: 'manual',
      category: 'Car / Jeep / Van',
      confidence: 1.0,
      confidence_pct: 100.0,
      box: { x1: 0, y1: 0, x2: 0, y2: 0, w: 0, h: 0 },
      manuallyAdded: true,
      requires_manual_refinement: false,
    };
    const updated = [...detections, newDet];
    setDetections(updated);
    recalculateEmissions(updated, distanceKm);
  };

  // Distance Adjustment
  const handleDistanceChange = (newDist) => {
    const dist = Math.max(1, Math.min(300, Number(newDist) || 50));
    setDistanceKm(dist);
    if (detections.length > 0) {
      recalculateEmissions(detections, dist);
    }
  };

  // Recalculate Emissions via Backend (or Client Fallback)
  const recalculateEmissions = async (currentDetections, dist) => {
    try {
      const res = await apiFetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ detections: currentDetections, distance: dist }),
      });
      if (res && res.ok) {
        const data = await res.json();
        if (data.success && data.emissions) {
          setEmissionResults(data.emissions);
          return;
        }
      }
    } catch {
      // Fallback client calculation if backend is briefly unreachable
      calculateClientEmissions(currentDetections, dist);
    }
  };

  // Client calculation fallback
  const calculateClientEmissions = (curDets, dist) => {
    const counts = {};
    ALL_CATEGORIES.forEach((c) => (counts[c] = 0));
    curDets.forEach((d) => {
      counts[d.category] = (counts[d.category] || 0) + 1;
    });

    let totalVehicles = 0;
    let totalVkt = 0;
    let totalCo2Kg = 0;
    let totalNoxKg = 0;
    let totalPcu = 0;

    const catDetails = DEFAULT_EMISSION_FACTORS.map((f) => {
      const count = counts[f.category] || 0;
      const vkt = count * dist;
      const co2Kg = vkt * (f.co2_factor || 0);
      const noxGrams = vkt * (f.nox_factor || 0);
      const noxKg = noxGrams / 1000;
      const pcu = count * (f.pcu_factor || 1.0);

      totalVehicles += count;
      totalVkt += vkt;
      totalCo2Kg += co2Kg;
      totalNoxKg += noxKg;
      totalPcu += pcu;

      return {
        category: f.category,
        count,
        distanceKm: dist,
        vkt,
        co2Factor: f.co2_factor,
        noxFactor: f.nox_factor,
        co2Kg,
        co2Tonnes: co2Kg / 1000,
        noxKg,
        noxGrams,
        pcuFactor: f.pcu_factor || 1.0,
        emissionStandard: f.emission_standard,
        source: f.source,
      };
    });

    catDetails.forEach((c) => {
      c.trafficShare = totalVehicles > 0 ? Number(((c.count / totalVehicles) * 100).toFixed(2)) : 0;
      c.co2Share = totalCo2Kg > 0 ? Number(((c.co2Kg / totalCo2Kg) * 100).toFixed(2)) : 0;
      c.noxShare = totalNoxKg > 0 ? Number(((c.noxKg / totalNoxKg) * 100).toFixed(2)) : 0;
    });

    setEmissionResults({
      assumedDistanceKm: dist,
      totals: {
        vehicleCount: totalVehicles,
        vehicleKm: totalVkt,
        co2Kg: totalCo2Kg,
        co2Tonnes: totalCo2Kg / 1000,
        noxKg: totalNoxKg,
        noxGrams: totalNoxKg * 1000,
        totalPcu,
        treesNeeded: Number((totalCo2Kg / 21.77).toFixed(1)),
        dieselEquivLiters: Number((totalCo2Kg / 2.68).toFixed(1)),
      },
      categories: catDetails,
    });
  };

  // Export CSV
  const handleExportCsv = async () => {
    if (!emissionResults) return;
    try {
      const res = await apiFetch('/api/export-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          detections,
          emissions: emissionResults,
          analysis_date: analysisDate,
        }),
      });

      if (res && res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `TollTrack_AI_Vehicle_Detections_${Date.now()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (e) {
      setErrorMsg(`Failed to export CSV: ${e.message}`);
    }
  };

  // Export PDF
  const handleExportPdf = async () => {
    if (!emissionResults) return;
    try {
      const res = await apiFetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          detections,
          emissions: emissionResults,
          analysis_date: analysisDate,
        }),
      });

      if (res && res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `TollTrack_AI_Emission_Audit_${Date.now()}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Server failed to generate PDF.');
      }
    } catch (e) {
      setErrorMsg(`Failed to export PDF: ${e.message}`);
    }
  };

  // Download Annotated Image
  const handleDownloadAnnotatedImage = () => {
    if (!annotatedImage) return;
    const a = document.createElement('a');
    a.href = annotatedImage;
    a.download = `TollTrack_Annotated_Traffic_${Date.now()}.jpg`;
    a.click();
  };

  // Load verified sample highway traffic photo with vehicles
  const loadSampleTollImage = async () => {
    try {
      let res = await fetch('/sample_traffic.jpg');
      let name = 'sample_toll_traffic.jpg';
      if (!res.ok) {
        res = await fetch('/src/assets/hero.png');
        name = 'sample_traffic.png';
      }
      if (res.ok) {
        const blob = await res.blob();
        const file = new File([blob], name, { type: blob.type || 'image/jpeg' });
        setSelectedImage(file);
        setFileName(name);
        setImagePreview(URL.createObjectURL(blob));
        setDetections([]);
        setAnnotatedImage(null);
        setEmissionResults(null);
        setErrorMsg(null);
        setSuccessMsg(null);
      }
    } catch (err) {
      setErrorMsg('Could not load sample toll plaza photo: ' + err.message);
    }
  };

  // Chart Data Preparation
  const chartData = (emissionResults?.categories || [])
    .filter((c) => c.count > 0)
    .map((c) => ({
      name: c.category.replace('Vehicle / OSV', 'OSV').replace(' / Jeep / Van', ''),
      fullName: c.category,
      count: c.count,
      co2Kg: Number(c.co2Kg.toFixed(2)),
      noxKg: Number(c.noxKg.toFixed(3)),
      trafficShare: c.trafficShare,
      co2Share: c.co2Share,
    }));

  const pieData = chartData.map((item, idx) => ({
    name: item.name,
    value: item.co2Kg,
    color: PIE_PALETTE[idx % PIE_PALETTE.length],
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              AI Vehicle Detection & Emission Calculator
            </h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
            Analyze photographic snapshots of toll plaza traffic using pretrained YOLO vision models.
            Detect vehicles, classify categories, and quantify CO2 & NOx emissions with verified ARAI/CPCB standards.
          </p>
        </div>

        {/* Backend Status Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              backendStatus === 'online'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                : backendStatus === 'model_error'
                ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                : backendStatus === 'waking' || backendStatus === 'checking'
                ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                : backendStatus === 'unconfigured'
                ? 'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800'
                : 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendStatus === 'online'
                  ? 'bg-emerald-500 animate-pulse'
                  : backendStatus === 'model_error'
                  ? 'bg-rose-500'
                  : backendStatus === 'waking' || backendStatus === 'checking'
                  ? 'bg-amber-500 animate-ping'
                  : backendStatus === 'unconfigured'
                  ? 'bg-sky-500'
                  : 'bg-red-500'
              }`}
            />
            <span>
              {backendStatus === 'online'
                ? `AI Engine: Active (${backendInfo?.yolo_model || 'YOLOv8'})`
                : backendStatus === 'model_error'
                ? 'AI Engine: Model Not Loaded'
                : backendStatus === 'waking'
                ? 'Waking up Cloud Backend (~20s)...'
                : backendStatus === 'checking'
                ? 'Connecting to AI Engine...'
                : backendStatus === 'unconfigured'
                ? 'AI Backend: Unconfigured in Vercel'
                : 'AI Backend: Offline'}
            </span>
          </div>

          <button
            onClick={() => checkBackendHealth(false)}
            title="Refresh backend status"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${backendStatus === 'checking' || backendStatus === 'waking' ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Backend Unconfigured in Vercel Notice */}
      {backendStatus === 'unconfigured' && (
        <div className="p-4 rounded-xl border border-sky-300 bg-sky-50/90 dark:border-sky-900/60 dark:bg-sky-950/40 text-sky-950 dark:text-sky-200 text-sm flex flex-col sm:flex-row items-start justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <p className="font-bold">Vercel Deployment: Free Hugging Face AI Backend URL Needed</p>
              <p className="text-xs text-sky-900 dark:text-sky-300 leading-relaxed">
                Your frontend is live on Vercel. Connect your free Hugging Face Gradio Space (or local backend) to activate AI vehicle detection:
              </p>
              <ol className="list-decimal list-inside text-xs space-y-1 text-sky-800 dark:text-sky-300 font-medium">
                <li>Create a 100% free Space on <strong>Hugging Face</strong> using the files in the <code className="font-mono">hf_space/</code> directory.</li>
                <li>Copy your public Space URL (e.g. <code className="font-mono">https://YOUR_HF_USERNAME-SPACE_NAME.hf.space</code>).</li>
                <li>In <strong>Vercel &gt; Settings &gt; Environment Variables</strong>, add:</li>
              </ol>
              <div className="p-2 rounded-lg bg-slate-900 text-emerald-400 font-mono text-xs select-all">
                VITE_AI_API_URL=https://YOUR_HF_USERNAME-SPACE_NAME.hf.space
              </div>
              <p className="text-[11px] text-sky-700 dark:text-sky-400">
                After saving the environment variable, trigger a <strong>Redeploy</strong> in Vercel to activate online AI vehicle detection.
              </p>
            </div>
          </div>
          <button
            onClick={() => checkBackendHealth(false)}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recheck</span>
          </button>
        </div>
      )}

      {/* Backend Reachable but Model Not Loaded Notice */}
      {backendStatus === 'model_error' && (
        <div className="p-4 rounded-xl border border-rose-300 bg-rose-50/90 dark:border-rose-900/60 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 text-sm flex flex-col sm:flex-row items-start justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <p className="font-bold">Backend Reachable, But YOLO AI Model Is Not Loaded</p>
              <p className="text-xs text-rose-900 dark:text-rose-300 leading-relaxed">
                The AI backend is running, but the YOLO vehicle detection model could not be loaded into memory.
              </p>
              {backendInfo?.model_error && (
                <div className="p-2.5 rounded-lg bg-slate-900 text-rose-300 font-mono text-xs select-all break-all">
                  Error: {backendInfo.model_error}
                </div>
              )}
              <p className="text-[11px] text-rose-700 dark:text-rose-400">
                Backend URL: <code className="font-mono font-bold">{RAW_BACKEND_URL || 'http://127.0.0.1:5000'}</code>.
                Verify that <code className="font-mono">ultralytics</code> and <code className="font-mono">torch</code> dependencies are installed and model weights are accessible.
              </p>
            </div>
          </div>
          <button
            onClick={() => checkBackendHealth(false)}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Model Check</span>
          </button>
        </div>
      )}

      {/* Backend Offline Troubleshooting Alert */}
      {backendStatus === 'offline' && (
        <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/90 dark:border-amber-900/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-sm flex flex-col sm:flex-row items-start justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <p className="font-bold">AI Backend Not Detected</p>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                Target Backend URL: <code className="font-mono font-bold">{RAW_BACKEND_URL || 'http://127.0.0.1:5000'}</code>
              </p>
              {RAW_BACKEND_URL && RAW_BACKEND_URL.includes('.hf.space') ? (
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  Hugging Face Spaces may sleep when inactive. The instance is currently waking up (~15–30s). Please wait a few seconds and click <strong>Retry Connection</strong>.
                </p>
              ) : RAW_BACKEND_URL && RAW_BACKEND_URL.includes('onrender.com') ? (
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  The backend service is currently starting up. Please wait a few seconds and click <strong>Retry Connection</strong>.
                </p>
              ) : (
                <>
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    To start the backend locally on Windows, execute in your terminal:
                  </p>
                  <div className="p-2 rounded-lg bg-slate-900 text-emerald-400 font-mono text-xs select-all">
                    python backend/app.py
                  </div>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => checkBackendHealth(false)}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* REQUIREMENT 6: DATA SOURCE DISTINCTION BANNER */}
      <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/30 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-blue-900 dark:text-blue-200">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold tracking-wide uppercase text-[11px] text-blue-800 dark:text-blue-300 block mb-0.5">
              Data Lineage & Pipeline Isolation Notice (Item 6)
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              This module operates in an <strong>isolated snapshot pipeline</strong>. Detections reflect solely the vehicles
              visible in the uploaded photograph and are <strong>strictly separated</strong> from Chokkenahalli Toll Plaza's
              statutory monthly FASTag traffic baseline (~37,277 AADT). Snapshot counts will never combine or alter official baseline data.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-900/60 font-semibold text-[11px] text-blue-800 dark:text-blue-300">
          <span>Snapshot Isolated</span>
        </div>
      </div>

      {/* REQUIREMENT 1: IMAGE INPUT INTERFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Controls & Viewfinder */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>1. Photographic Input</span>
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">JPG, JPEG, PNG, WEBP (Max 16MB)</span>
            </div>

            {/* Action Buttons Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Open Camera Button */}
              <button
                type="button"
                onClick={startCamera}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 font-semibold text-xs transition-colors cursor-pointer shadow-xs"
              >
                <Camera className="w-4 h-4" />
                <span>Open Camera</span>
              </button>

              {/* Upload Image Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload-input"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Image</span>
              </button>

              {/* Sample Photo Button */}
              <button
                type="button"
                onClick={loadSampleTollImage}
                title="Load sample highway toll plaza photo with vehicles"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-xs transition-colors cursor-pointer"
              >
                <span>Sample Toll Photo</span>
              </button>

              {/* Remove Image Button */}
              {imagePreview && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-medium transition-colors ml-auto cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove Image</span>
                </button>
              )}
            </div>

            {/* Image Preview Canvas / Viewport */}
            <div className="relative min-h-[300px] max-h-[460px] rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
              {imagePreview ? (
                <div className="relative w-full h-full flex items-center justify-center p-2">
                  {/* View Mode Switcher when Annotated Image is available */}
                  {annotatedImage && (
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-xs shadow-md">
                      <button
                        onClick={() => setViewMode('annotated')}
                        className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                          viewMode === 'annotated' ? 'bg-emerald-600 font-bold' : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        AI Annotated
                      </button>
                      <button
                        onClick={() => setViewMode('original')}
                        className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                          viewMode === 'original' ? 'bg-emerald-600 font-bold' : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        Original
                      </button>
                    </div>
                  )}

                  {/* Render Image */}
                  <img
                    src={viewMode === 'annotated' && annotatedImage ? annotatedImage : imagePreview}
                    alt="Toll plaza traffic preview"
                    className="max-h-[440px] max-w-full object-contain rounded-lg shadow-xs"
                  />

                  {/* Metadata Tag */}
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-mono">
                    {fileName || 'Toll Plaza Traffic'}
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer text-center p-8 space-y-3 group"
                >
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:scale-105 group-hover:text-emerald-600 transition-all">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Drop toll plaza photograph here or click to browse
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Supports JPG, JPEG, PNG, WEBP formats up to 16MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Analyze Traffic Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={!imagePreview || isAnalyzing}
                onClick={analyzeTraffic}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer ${
                  !imagePreview || isAnalyzing
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 active:scale-[0.99]'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>{analysisPhase || 'Running YOLO Vehicle Detection & Categorization...'}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Analyze Traffic & Quantify Emissions</span>
                  </>
                )}
              </button>
            </div>

            {/* Status alerts */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Distance Simulator & Axle Transparency */}
        <div className="lg:col-span-5 space-y-4">
          {/* REQUIREMENT 4: ASSUMED DISTANCE CONTROL */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Route className="w-4 h-4 text-emerald-600" />
                <span>2. Assumed Travel Distance</span>
              </h2>
              <span className="font-mono font-bold text-sm px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {distanceKm} km
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Vehicle Kilometres (VKT) = Detected Vehicle Count × Assumed Distance.
              Default highway corridor standard is <strong>50 km</strong>.
            </p>

            {/* Slider */}
            <div className="space-y-2">
              <input
                type="range"
                min="5"
                max="150"
                step="5"
                value={distanceKm}
                onChange={(e) => handleDistanceChange(e.target.value)}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>5 km</span>
                <span>50 km (Default)</span>
                <span>150 km</span>
              </div>
            </div>

            {/* Preset Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {DISTANCE_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handleDistanceChange(preset.value)}
                  className={`px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors text-left cursor-pointer border ${
                    distanceKm === preset.value
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* REQUIREMENT 2: AXLE CLASSIFICATION TRANSPARENCY CARD */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Axle Classification Transparency (Item 2)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Pretrained YOLO vision models classify vehicles into general categories (<strong>Car, Motorcycle, Bus, Truck</strong>).
              Standard visual weights cannot infer axle configurations (2-Axle vs 3-Axle vs Multi-Axle OSV).
            </p>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs space-y-1">
              <p className="font-semibold">Default Classification Policy:</p>
              <p className="text-[11px] leading-relaxed">
                Detected trucks default to <strong>2-Axle Truck</strong>. You can manually correct each vehicle category in the table
                below before finalizing environmental calculations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* REQUIREMENT 3 & 5: RESULTS & DETECTION DASHBOARD */}
      {emissionResults && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* KPI 1: Total Detected Vehicles */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Vehicles</span>
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60">
                  <Car className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
                {emissionResults.totals.vehicleCount}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {emissionResults.totals.totalPcu} PCU Units
              </p>
            </div>

            {/* KPI 2: Vehicle Kilometres */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total VKT</span>
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60">
                  <Route className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
                {formatNumber(emissionResults.totals.vehicleKm)}
                <span className="text-xs font-normal text-slate-500 ml-1">km</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                At {distanceKm} km assumed distance
              </p>
            </div>

            {/* KPI 3: Total CO2 Emissions */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total CO2</span>
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60">
                  <Cloud className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-2">
                {emissionResults.totals.co2Tonnes >= 1
                  ? `${emissionResults.totals.co2Tonnes.toFixed(3)} t`
                  : `${emissionResults.totals.co2Kg.toFixed(1)} kg`}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Equiv. {emissionResults.totals.treesNeeded} trees/yr
              </p>
            </div>

            {/* KPI 4: Total NOx Emissions */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total NOx</span>
                <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60">
                  <Zap className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-black text-purple-700 dark:text-purple-400 mt-2">
                {emissionResults.totals.noxKg >= 1
                  ? `${emissionResults.totals.noxKg.toFixed(3)} kg`
                  : `${emissionResults.totals.noxGrams.toFixed(1)} g`}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                ARAI/CPCB weighted factor
              </p>
            </div>
          </div>

          {/* REQUIREMENT 3: INTERACTIVE DETECTIONS & MANUAL CORRECTION TABLE */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Interactive Detection Review & Category Correction</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Review YOLO detections. Reassign vehicle categories manually to refine axle distributions before exporting.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddManualVehicle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Missed Vehicle</span>
              </button>
            </div>

            {/* Detections Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold bg-slate-50/50 dark:bg-slate-950/50">
                    <th className="py-2.5 px-3"># ID</th>
                    <th className="py-2.5 px-3">YOLO Class</th>
                    <th className="py-2.5 px-3">Confidence</th>
                    <th className="py-2.5 px-3">TollTrack Scientific Category</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {detections.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-400">
                        No vehicles detected in this snapshot.
                      </td>
                    </tr>
                  ) : (
                    detections.map((det) => (
                      <tr key={det.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-500">
                          {det.id}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300 capitalize">
                          {det.raw_class}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-mono font-semibold text-[11px] ${
                              det.confidence >= 0.75
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}
                          >
                            {det.confidence_pct}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <select
                            value={det.category}
                            onChange={(e) => handleCategoryChange(det.id, e.target.value)}
                            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                          >
                            {ALL_CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                          {det.manuallyCorrected && (
                            <span className="ml-2 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                              Modified
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveDetection(det.id)}
                            title="Remove detection"
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Bar Chart: CO2 by Category */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-600" />
                <span>CO2 Emissions by Vehicle Category (kg)</span>
              </h3>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      angle={-20}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="p-3 bg-slate-900 text-white rounded-xl shadow-lg text-xs space-y-1">
                              <p className="font-bold">{data.fullName}</p>
                              <p>Count: {data.count} units</p>
                              <p className="text-emerald-400 font-bold">CO2: {data.co2Kg} kg ({data.co2Share}%)</p>
                              <p className="text-purple-400">NOx: {data.noxKg} kg</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="co2Kg" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut Chart: CO2 Contribution */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-emerald-600" />
                <span>CO2 Emission Contribution Share</span>
              </h3>
              <div className="h-[280px] w-full flex items-center justify-center">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-slate-400">No emission data to render</p>
                )}
              </div>
            </div>
          </div>

          {/* Category-Wise Calculation Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Scientific Category Emission Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold bg-slate-50 dark:bg-slate-950">
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-center">Detected Count</th>
                    <th className="py-2.5 px-3 text-right">VKT ({distanceKm} km)</th>
                    <th className="py-2.5 px-3 text-right">CO2 Factor</th>
                    <th className="py-2.5 px-3 text-right">Total CO2</th>
                    <th className="py-2.5 px-3 text-right">NOx Factor</th>
                    <th className="py-2.5 px-3 text-right">Total NOx</th>
                    <th className="py-2.5 px-3 text-right">Share (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {emissionResults.categories
                    .filter((c) => c.count > 0)
                    .map((c) => (
                      <tr key={c.category} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {c.category}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold">{c.count}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{formatNumber(c.vkt)} km</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-500">{c.co2Factor} kg/km</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                          {c.co2Kg.toFixed(2)} kg
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-500">{c.noxFactor} g/km</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-600">
                          {c.noxKg.toFixed(3)} kg
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">{c.co2Share}%</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* REQUIREMENT 7: REPORT EXPORT CONTROLS */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Export Audit Documentation (Item 7)</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Download verified detection records, statutory citations, and high-resolution annotated images.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* CSV Export */}
              <button
                type="button"
                onClick={handleExportCsv}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV</span>
              </button>

              {/* PDF Export */}
              <button
                type="button"
                onClick={handleExportPdf}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Download PDF Audit</span>
              </button>

              {/* Download Annotated Image */}
              {annotatedImage && (
                <button
                  type="button"
                  onClick={handleDownloadAnnotatedImage}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Annotated Image</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CAMERA VIEWFINDER MODAL */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl space-y-4 p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Live Camera Viewfinder</h3>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Viewfinder Window */}
            <div className="relative aspect-video rounded-2xl bg-black overflow-hidden flex items-center justify-center">
              {cameraError ? (
                <div className="p-6 text-center space-y-2">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                  <p className="text-xs text-amber-200">{cameraError}</p>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Camera Controls */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={switchCameraFacing}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium cursor-pointer transition-colors"
              >
                Flip Camera ({cameraFacing === 'environment' ? 'Rear' : 'Front'})
              </button>

              <button
                type="button"
                onClick={capturePhoto}
                disabled={!!cameraError}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Photo</span>
              </button>

              <button
                type="button"
                onClick={stopCamera}
                className="px-3 py-2 rounded-xl text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
