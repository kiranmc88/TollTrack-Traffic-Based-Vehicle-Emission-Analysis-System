import React, { useState, useRef } from 'react';
import {
  Database,
  Upload,
  Download,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  Edit2,
  Save,
  Info,
} from 'lucide-react';
import { useTraffic } from '../hooks/useTrafficData';
import { parseUploadedCsv } from '../utils/csvLoader';
import { formatNumber } from '../utils/formatters';
import ScientificBadge from '../components/ScientificBadge';
import DataTransparencyCard from '../components/DataTransparencyCard';

export default function DataManagement() {
  const {
    trafficData,
    originalData,
    isCustomDataActive,
    uploadData,
    resetTrafficData,
    exportCsv,
    emissionFactors,
    activePreset,
    presets,
    applyPreset,
    updateFactor,
    resetFactors,
    factorValidation,
  } = useTraffic();

  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('traffic'); // 'traffic' | 'factors'
  const [uploadError, setUploadError] = useState(null);
  const [uploadWarnings, setUploadWarnings] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCo2, setEditCo2] = useState('');
  const [editNox, setEditNox] = useState('');

  // Handle file upload
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadWarnings([]);
    setUploadSuccess(null);

    try {
      const validation = await parseUploadedCsv(file);
      if (!validation.isValid) {
        setUploadError(validation.errors.join(' '));
        if (validation.warnings.length) setUploadWarnings(validation.warnings);
        return;
      }

      uploadData(validation.data);
      setUploadSuccess(`Successfully loaded ${validation.data.length} vehicle categories from ${file.name}`);
      if (validation.warnings.length) setUploadWarnings(validation.warnings);
    } catch (err) {
      setUploadError(err.message || 'Failed to parse uploaded CSV');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const startEditFactor = (factor) => {
    setEditingCategory(factor.category_code || factor.category);
    setEditCo2(factor.co2_factor);
    setEditNox(factor.nox_factor);
  };

  const saveEditFactor = (categoryCode) => {
    const co2Val = Number(editCo2);
    const noxVal = Number(editNox);
    if (!isNaN(co2Val) && co2Val > 0) {
      updateFactor(categoryCode, 'co2_factor', co2Val);
    }
    if (!isNaN(noxVal) && noxVal > 0) {
      updateFactor(categoryCode, 'nox_factor', noxVal);
    }
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 m-0">
            Data & Emission Factor Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dynamic dataset management, CSV upload/export, and scientific emission factor configuration
          </p>
        </div>

        {/* Tab switcher */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start sm:self-center">
          <button
            onClick={() => setActiveTab('traffic')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
              activeTab === 'traffic'
                ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Traffic Dataset</span>
          </button>
          <button
            onClick={() => setActiveTab('factors')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
              activeTab === 'factors'
                ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Emission Factors</span>
          </button>
        </div>
      </div>

      {activeTab === 'traffic' ? (
        /* ================= TRAFFIC DATASET TAB ================= */
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                    Active Dataset Source
                  </h3>
                  {isCustomDataActive ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      Custom Upload Active
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      Historical Baseline (FY2026 AADT)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Chokkenahalli Toll Plaza (Km 61+500, NH-48). Target: <strong>September 2026 (IHMCL ETC Reports)</strong>.
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5 font-medium">
                  Note: Actual category-wise September 2026 IHMCL figures are pending official public release. The active baseline is preserved as verified historical reference data. Upload your own September 2026 CSV file below if available.
                </p>
              </div>


              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload CSV</span>
                </button>

                <button
                  onClick={exportCsv}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Download CSV</span>
                </button>

                {isCustomDataActive && (
                  <button
                    onClick={resetTrafficData}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 shadow-xs transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Original Dataset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Upload notifications */}
            {uploadError && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}
            {uploadSuccess && (
              <div className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{uploadSuccess}</span>
              </div>
            )}
            {uploadWarnings.length > 0 && (
              <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300">
                <p className="font-bold mb-1">Warnings:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  {uploadWarnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Table of Traffic Data */}
          <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Traffic Dataset Records
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Dynamic vehicle counts parsed directly from public/data/chokkenahalli_traffic.csv
                </p>
              </div>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                public/data/chokkenahalli_traffic.csv
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Vehicle Category</th>
                    <th className="py-3 px-4 text-right">Daily Count (AADT)</th>
                    <th className="py-3 px-4 text-right">Derived 30-Day Count</th>
                    <th className="py-3 px-4 text-right">PCU Multiplier</th>
                    <th className="py-3 px-4">Classification Code</th>
                    <th className="py-3 px-4">Scope Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {trafficData.map((row) => (
                    <tr key={row.category} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        {row.category}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-800 dark:text-slate-200">
                        {formatNumber(row.daily_count)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                        {formatNumber(row.estimated_30day_count)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                        {row.pcu_factor ? Number(row.pcu_factor).toFixed(1) : '1.0'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                        {row.category_code || 'CODE'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                        {row.description || `${row.category} on NH-48`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ================= EMISSION FACTORS TAB ================= */
        <div className="space-y-6">
          {/* Scientific Requirement Advisory */}
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/20 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Scientific Requirement & Peer-Reviewed Verification
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  TollTrack strictly maintains scientific integrity. All baseline emission factors are derived from authentic regulatory publications by the <strong>Automotive Research Association of India (ARAI)</strong>, the <strong>Central Pollution Control Board (CPCB)</strong>, and the <strong>India GHG Program</strong>. Custom modifications will be marked as unverified until validated.
                </p>
              </div>
            </div>
          </div>

          {/* Preset Selector */}
          <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Emission Factor Profiles
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select a standardized scientific standard or enter custom factors
                </p>
              </div>

              <button
                onClick={resetFactors}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer self-start sm:self-center"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Reset to ARAI/CPCB Verified Standard</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.values(presets).map((preset) => {
                const isActive = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 dark:border-emerald-600 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        {preset.name.split('(')[0]}
                      </span>
                      {preset.isVerified ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Verified
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Research
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Configurable Emission Factors Table */}
          <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Active Scientific Factors Configuration
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Click 'Edit' to adjust specific parameters or verify documentation
                </p>
              </div>
              <ScientificBadge status={factorValidation.isValid ? 'verified' : 'pending_verification'} size="sm" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Vehicle Category</th>
                    <th className="py-3 px-4 text-right">CO2 Factor (kg/km)</th>
                    <th className="py-3 px-4 text-right">NOx Factor (g/km)</th>
                    <th className="py-3 px-4">Fuel Assumption</th>
                    <th className="py-3 px-4">Emission Standard</th>
                    <th className="py-3 px-4">Verification Authority</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {emissionFactors.map((f) => {
                    const isEditing = editingCategory === (f.category_code || f.category);
                    return (
                      <tr key={f.category} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                          {f.category}
                        </td>

                        {/* CO2 Factor */}
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.001"
                              value={editCo2}
                              onChange={(e) => setEditCo2(e.target.value)}
                              className="w-24 px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-right"
                            />
                          ) : (
                            `${f.co2_factor.toFixed(3)} kg/km`
                          )}
                        </td>

                        {/* NOx Factor */}
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-amber-700 dark:text-amber-400">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editNox}
                              onChange={(e) => setEditNox(e.target.value)}
                              className="w-24 px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-right"
                            />
                          ) : (
                            `${f.nox_factor.toFixed(2)} g/km`
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                          {f.fuel_type}
                        </td>

                        <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                          {f.emission_standard}
                        </td>

                        <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-medium text-slate-700 dark:text-slate-300 block">{f.source}</span>
                          <span className="text-[11px] text-slate-400">{f.publication_year}</span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <ScientificBadge status={f.verification_status} size="sm" showText={false} />
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {isEditing ? (
                            <button
                              onClick={() => saveEditFactor(f.category_code || f.category)}
                              className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer inline-flex items-center gap-1"
                            >
                              <Save className="w-3 h-3" /> Save
                            </button>
                          ) : (
                            <button
                              onClick={() => startEditFactor(f)}
                              className="p-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                              title="Edit factor"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Data Transparency & Lineage Audit Card */}
      <DataTransparencyCard />
    </div>
  );
}

