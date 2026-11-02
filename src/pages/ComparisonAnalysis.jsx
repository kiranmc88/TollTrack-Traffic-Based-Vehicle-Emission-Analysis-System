import React, { useState } from 'react';
import {
  BarChart3,
  Route,
  Cloud,
  Zap,
  Trees,
  Sliders,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { useTraffic } from '../hooks/useTrafficData';
import { formatNumber, formatEmissions, formatNox, formatPercent } from '../utils/formatters';
import NoticeBanner from '../components/NoticeBanner';

export default function ComparisonAnalysis({ onNavigate }) {
  const { distanceComparison, distanceKm, setDistance, countType, emissions } = useTraffic();
  const [metricTab, setMetricTab] = useState('both'); // 'both' | 'co2' | 'nox'

  // Prepare chart data
  const chartData = distanceComparison.map((d) => ({
    name: d.label,
    distanceVal: d.distance,
    co2Tonnes: Number(d.co2Tonnes.toFixed(2)),
    noxKg: Number(d.noxKg.toFixed(2)),
    vktKm: d.vehicleKm,
    treesNeeded: Math.round(d.treesNeeded),
    isCurrent: d.distance === distanceKm,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 m-0">
          Comparison Analysis Across Distances
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Comparative environmental impact across standard trip distances (10 km, 25 km, 50 km, 75 km, 100 km)
        </p>
      </div>

      <NoticeBanner countType={countType} onNavigate={onNavigate} />

      {/* Preset Distance Comparison Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {distanceComparison.map((item) => {
          const isSelected = item.distance === distanceKm;
          return (
            <div
              key={item.distance}
              onClick={() => setDistance(item.distance)}
              className={`rounded-xl p-4 transition-all cursor-pointer border ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 dark:border-emerald-600 ring-2 ring-emerald-500/30 shadow-md'
                  : 'border-slate-200/80 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                  isSelected
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {item.label}
                </span>
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>

              <div className="space-y-2 mt-3">
                <div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
                    CO2 Output
                  </p>
                  <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
                    {formatNumber(item.co2Tonnes, 1)} <span className="text-xs font-medium text-slate-500">t</span>
                  </p>
                </div>

                <div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
                    NOx Output
                  </p>
                  <p className="text-sm sm:text-base font-bold text-amber-600 dark:text-amber-400">
                    {formatNumber(item.noxKg, 1)} <span className="text-xs font-medium text-slate-500">kg</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>~{formatNumber(Math.round(item.treesNeeded))} trees</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Chart Section */}
      <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Distance Scaling Visualization
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Evaluating emissions growth across 10 km, 25 km, 50 km, 75 km, and 100 km
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start sm:self-center">
            <button
              onClick={() => setMetricTab('both')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                metricTab === 'both'
                  ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-900 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              CO2 & NOx Combined
            </button>
            <button
              onClick={() => setMetricTab('co2')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                metricTab === 'co2'
                  ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-900 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              CO2 Only (Tonnes)
            </button>
            <button
              onClick={() => setMetricTab('nox')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                metricTab === 'nox'
                  ? 'bg-white text-amber-700 shadow-xs dark:bg-slate-900 dark:text-amber-400'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              NOx Only (kg)
            </button>
          </div>
        </div>

        {/* Grouped Bar Chart */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 20, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} />
              
              {metricTab === 'both' ? (
                <>
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    tick={{ fontSize: 11 }}
                    unit=" t"
                    label={{ value: 'CO2 (Tonnes)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#10b981' }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11 }}
                    unit=" kg"
                    label={{ value: 'NOx (kg)', angle: 90, position: 'insideRight', fontSize: 11, fill: '#f59e0b' }}
                  />
                  <Tooltip
                    formatter={(val, name) => [
                      name === 'co2Tonnes' ? `${val} Tonnes CO2` : `${val} kg NOx`,
                      name === 'co2Tonnes' ? 'CO2 Emissions' : 'NOx Emissions',
                    ]}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      color: '#f8fafc',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    height={30}
                    formatter={(val) => (
                      <span className="text-xs text-slate-700 dark:text-slate-300">
                        {val === 'co2Tonnes' ? 'CO2 (Tonnes)' : 'NOx (kg)'}
                      </span>
                    )}
                  />
                  <Bar yAxisId="left" dataKey="co2Tonnes" fill="#10b981" radius={[4, 4, 0, 0]} name="co2Tonnes" />
                  <Bar yAxisId="right" dataKey="noxKg" fill="#f59e0b" radius={[4, 4, 0, 0]} name="noxKg" />
                </>
              ) : metricTab === 'co2' ? (
                <>
                  <YAxis unit=" t" tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val) => [`${val} Tonnes CO2`, 'CO2 Emissions']}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      color: '#f8fafc',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="co2Tonnes" fill="#10b981" radius={[6, 6, 0, 0]} name="CO2 Emissions (Tonnes)" />
                </>
              ) : (
                <>
                  <YAxis unit=" kg" tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val) => [`${val} kg NOx`, 'NOx Emissions']}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      color: '#f8fafc',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="noxKg" fill="#f59e0b" radius={[6, 6, 0, 0]} name="NOx Emissions (kg)" />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comprehensive Comparison Matrix Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Multi-Distance Sensitivity Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Side-by-side numerical comparison across the 5 standard distances
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Linear Growth Model
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Distance Scenario</th>
                <th className="py-3 px-4 text-right">Cumulative VKT</th>
                <th className="py-3 px-4 text-right">CO2 (kg)</th>
                <th className="py-3 px-4 text-right">CO2 (Tonnes)</th>
                <th className="py-3 px-4 text-right">NOx (kg)</th>
                <th className="py-3 px-4 text-right">Annual Trees Required</th>
                <th className="py-3 px-4">Corridor Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {distanceComparison.map((row) => {
                const isSelected = row.distance === distanceKm;
                let interpretation = 'Short commuter / local transit';
                if (row.distance === 25) interpretation = 'Nelamangala – Tumakuru partial corridor';
                if (row.distance === 50) interpretation = 'Full Tumakuru – Bengaluru suburban stretch (Default)';
                if (row.distance === 75) interpretation = 'Tumakuru – Bengaluru urban core connector';
                if (row.distance >= 100) interpretation = 'Long-haul intercity freight corridor';

                return (
                  <tr
                    key={row.distance}
                    onClick={() => setDistance(row.distance)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 font-semibold'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3.5 px-4 text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                      {row.label}
                      {isSelected && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold ml-1">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-800 dark:text-slate-200">
                      {formatNumber(row.vehicleKm)} km
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                      {formatNumber(row.co2Kg, 1)} kg
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-700 dark:text-emerald-400">
                      {formatNumber(row.co2Tonnes, 2)} t
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-amber-700 dark:text-amber-400">
                      {formatNumber(row.noxKg, 2)} kg
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-800 dark:text-slate-200">
                      ~{formatNumber(Math.round(row.treesNeeded))}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                      {interpretation}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
