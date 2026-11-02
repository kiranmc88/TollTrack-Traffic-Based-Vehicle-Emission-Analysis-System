import React from 'react';
import {
  LayoutDashboard,
  Truck,
  Route,
  Cloud,
  Zap,
  BarChart3,
  Database,
  BookOpen,
  MapPin,
  ExternalLink,
  FileCheck2,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
  { id: 'realData', label: 'Real Data & Research Methodology', icon: FileCheck2 },
  { id: 'traffic', label: 'Vehicle Traffic Analysis', icon: Truck },
  { id: 'distance', label: 'Distance Simulator', icon: Route },
  { id: 'co2', label: 'CO2 Emission Analysis', icon: Cloud },
  { id: 'nox', label: 'NOx Emission Analysis', icon: Zap },
  { id: 'comparison', label: 'Comparison Analysis', icon: BarChart3 },
  { id: 'data', label: 'Data Management', icon: Database },
  { id: 'methodology', label: 'Methodology & Science', icon: BookOpen },
];


export default function Sidebar({ activePage, onSelectPage, isOpen, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-72 border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-1 overflow-y-auto">
          <p className="px-3 py-1.5 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Analytics Modules
          </p>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectPage(item.id);
                    if (onClose) onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Toll Plaza Metadata Card */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800">
          <div className="rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-teal-50/50 p-3.5 dark:border-emerald-900/50 dark:from-emerald-950/30 dark:to-slate-900/60">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-600 text-white shrink-0 shadow-xs">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  Chokkenahalli Toll Plaza
                </p>
                <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                  Km 61+500, NH-48 (Nelamangala – Tumakuru)
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Kyathsandra, Tumakuru District, Karnataka
                </p>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Baseline: FY2026 (Oct 2025)</span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">NHAI</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
