import React from 'react';
import { Database, Calendar, ShieldCheck, Route, FileCheck, Info, CheckCircle2 } from 'lucide-react';
import { useTraffic } from '../hooks/useTrafficData';

export default function DataTransparencyCard({ compact = false }) {
  const { distanceKm, countType, activePreset, presets } = useTraffic();

  const presetInfo = presets[activePreset] || presets.ARAI_CPCB_STANDARD;

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-xs transition-all">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
          Data Transparency & Scientific Audit Matrix
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
            1. Actual Data Source
          </span>
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            NHAI & IHMCL ETC FASTag Reporting Framework
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Raajmarg Infra InvIT Disclosures (Chokkenahalli Toll Plaza, Km 61+500, NH-48)
          </p>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
            2. Reporting Month & Extraction
          </span>
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            Target Month: September 2026
          </p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5 font-medium">
            Active Baseline: FY2026 AADT (up to Oct 2025) • Extracted: Nov 2026
          </p>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
            3. Actual vs Estimated Counts
          </span>
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            {countType === 'monthly' ? 'Estimated 30-Day (Derived: AADT × 30)' : 'Actual Observed Baseline (AADT)'}
          </p>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
            {countType === 'monthly' ? 'Mathematical projection, not continuous monthly count' : 'Daily average over multi-month surveillance'}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
            4. Emission Factor Reference
          </span>
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            {presetInfo.authority}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Publication: {presetInfo.publicationYear} • Status: {presetInfo.isVerified ? 'Peer-Reviewed Verified' : 'Custom'}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
            5. Selected Distance Assumption
          </span>
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            Assumed Trip Corridor: {distanceKm} km (Uniform Multiplier)
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Modelling assumption applied to every vehicle; not individual GPS/odometer tracking
          </p>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
            6. NOx Pollutant Definition
          </span>
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            NOx = Nitric Oxide (NO) + Nitrogen Dioxide (NO2)
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Tailpipe emission mass (kg); does not measure ambient nitrate concentration
          </p>
        </div>
      </div>
    </div>
  );
}
