import React from 'react';
import { Info, Calendar, MapPin, Database, ShieldAlert, FileText } from 'lucide-react';

export default function NoticeBanner({ countType = 'daily', onNavigate }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50/90 via-slate-50 to-white dark:border-emerald-900/60 dark:from-emerald-950/40 dark:via-slate-900/40 dark:to-slate-900/80 p-4 sm:p-5 shadow-xs mb-6 transition-all">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5 shadow-sm">
            <Database className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                Data Transparency & Lineage Advisory
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Chokkenahalli Toll Plaza (Km 61+500, NH-48)
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                <ShieldAlert className="w-3 h-3" /> Historical Reference Baseline
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong>Dataset Lineage:</strong> Target period is <em>September 2026 (IHMCL / MoRTH ETC Reports)</em>. In strict compliance with scientific integrity principles (no fabricated counts), verified category-wise September 2026 IHMCL figures are pending official public release. The active dataset represents the published <strong>FY2026 Average Daily Traffic (AADT) baseline up to October 2025</strong>, retained strictly as clearly labelled historical reference data.
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-slate-500 dark:text-slate-400">
              <span>
                • <strong>Daily Counts:</strong> Actual published AADT (~37,277 veh/day)
              </span>
              <span>
                • <strong>30-Day Counts:</strong> Derived estimate (<code className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold">AADT × 30</code> = 1,118,310 veh), not observed continuous monthly counts
              </span>
              <span>
                • <strong>Data Extraction:</strong> November 2026
              </span>
            </div>
          </div>
        </div>

        <div className="flex lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 gap-1.5">
          <div className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Target: Sep 2026</span>
          </div>
          <span className="text-[11px] text-slate-400">Baseline: Oct 2025</span>
          {onNavigate && (
            <button
              onClick={() => onNavigate('realData')}
              className="mt-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 underline cursor-pointer"
            >
              Real Data & Sources →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

