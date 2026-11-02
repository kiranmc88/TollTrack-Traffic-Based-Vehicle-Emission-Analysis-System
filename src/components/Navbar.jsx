import React from 'react';
import {
  Activity,
  Moon,
  Sun,
  Download,
  Calendar,
  Menu,
  X,
  Gauge,
  MapPin,
} from 'lucide-react';
import { useTraffic } from '../hooks/useTrafficData';
import { useTheme } from '../context/ThemeContext';
import ScientificBadge from './ScientificBadge';

export default function Navbar({ onToggleSidebar, isSidebarOpen }) {
  const { countType, setCountType, distanceKm, factorValidation, exportEmissionReport } = useTraffic();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 transition-colors">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                  Toll<span className="text-emerald-600 dark:text-emerald-400">Track</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-semibold tracking-wide rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  NH-48
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[260px]">
                Chokkenahalli Toll Plaza, Tumakuru
              </p>
            </div>
          </div>
        </div>

        {/* Center: Period Switcher (Daily vs 30-Day Derived) */}
        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setCountType('daily')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                countType === 'daily'
                  ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Daily AADT</span>
            </button>
            <button
              onClick={() => setCountType('monthly')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                countType === 'monthly'
                  ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <span>30-Day Estimate</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                Derived
              </span>
            </button>
          </div>

          {/* Verification Badge */}
          <div className="hidden xl:block">
            <ScientificBadge status={factorValidation.isValid ? 'verified' : 'pending_verification'} size="sm" />
          </div>
        </div>

        {/* Right: Distance Badge, Export & Theme Toggle */}
        <div className="flex items-center gap-2">
          {/* Active Distance Indicator */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Gauge className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{distanceKm} km</span>
          </div>

          {/* Export Report */}
          <button
            onClick={exportEmissionReport}
            title="Download full emission report CSV"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Export Report</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle color theme"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400 hover:text-amber-300 transition-colors" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600 hover:text-slate-900 transition-colors" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
