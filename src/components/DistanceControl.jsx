import React from 'react';
import { Route, Gauge } from 'lucide-react';
import { useTraffic } from '../hooks/useTrafficData';

export default function DistanceControl({ compact = false }) {
  const { distanceKm, setDistance } = useTraffic();

  const presets = [10, 25, 50, 75, 100];

  return (
    <div className={`rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-all ${
      compact ? 'p-3' : 'p-4 sm:p-5'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400">
            <Route className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
              Distance Simulator
            </h3>
            {!compact && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Formula: Vehicle Kilometres (VKT) = Vehicle Count × Distance
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Selected:</span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg font-bold text-sm bg-emerald-600 text-white shadow-sm">
            <Gauge className="w-3.5 h-3.5" />
            {distanceKm} km
          </span>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">Presets:</span>
        {presets.map((preset) => {
          const isActive = distanceKm === preset;
          return (
            <button
              key={preset}
              onClick={() => setDistance(preset)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/40'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {preset} km
            </button>
          );
        })}
      </div>

      {/* Interactive Slider & Custom Input */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative flex items-center">
          <input
            type="range"
            min="1"
            max="150"
            step="1"
            value={distanceKm}
            onChange={(e) => setDistance(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <input
            type="number"
            min="1"
            max="1000"
            value={distanceKm}
            onChange={(e) => setDistance(e.target.value)}
            className="w-20 px-2.5 py-1 text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center"
          />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">km</span>
        </div>
      </div>
    </div>
  );
}
