import React from 'react';
import {
  Route,
  Gauge,
  Sliders,
  Cloud,
  Zap,
  Car,
  TrendingUp,
  ArrowRight,
  Info,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { useTraffic } from '../hooks/useTrafficData';
import { formatNumber, formatEmissions, formatNox, formatPercent } from '../utils/formatters';
import DistanceControl from '../components/DistanceControl';
import NoticeBanner from '../components/NoticeBanner';
import KPICard from '../components/KPICard';

export default function DistanceSimulator({ onNavigate }) {
  const {
    distanceKm,
    setDistance,
    countType,
    emissions,
    distanceComparison,
  } = useTraffic();

  const { totals, categories } = emissions;
  const co2Formatted = formatEmissions(totals.co2Kg);
  const noxFormatted = formatNox(totals.noxKg);

  // Line chart trajectory across distance steps (10 to 150 km)
  const trajectoryData = [10, 25, 40, 50, 60, 75, 90, 100, 120, 150].map((d) => {
    const isCurrent = d === distanceKm;
    const vkt = totals.vehicleCount * d;
    // Calculate total CO2 for this distance
    const co2Tonnes = categories.reduce((sum, c) => sum + (c.activeCount * d * c.co2Factor) / 1000, 0);
    const noxKg = categories.reduce((sum, c) => sum + (c.activeCount * d * c.noxFactor) / 1000, 0);

    return {
      distance: `${d} km`,
      distanceVal: d,
      co2Tonnes: Number(co2Tonnes.toFixed(2)),
      noxKg: Number(noxKg.toFixed(2)),
      isCurrent,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 m-0">
          Distance Simulator
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Simulate the impact of highway transit trip distance on Vehicle Kilometres (VKT) and tailpipe emissions
        </p>
      </div>

      <NoticeBanner countType={countType} onNavigate={onNavigate} />

      {/* Main Interactive Distance Adjustment Box */}
      <DistanceControl />

      {/* Immediate Calculation Impact KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Assumed Trip Distance"
          value={`${distanceKm}`}
          unit="km"
          subtext="Configurable corridor length"
          badgeText="Active Multiplier"
          icon={Gauge}
          variant="emerald"
        />

        <KPICard
          title="Vehicle Kilometres (VKT)"
          value={formatNumber(totals.vehicleKm)}
          unit="km"
          subtext={`Count (${formatNumber(totals.vehicleCount)}) × ${distanceKm} km`}
          badgeText="Linear VKT"
          icon={Route}
          variant="blue"
        />

        <KPICard
          title="Estimated CO2 Emissions"
          value={co2Formatted.value}
          unit={co2Formatted.unit}
          subtext={`Recalculated for ${distanceKm} km`}
          badgeText={`${formatNumber(totals.co2Kg)} kg`}
          icon={Cloud}
          variant="teal"
        />

        <KPICard
          title="Estimated NOx Emissions"
          value={noxFormatted.value}
          unit={noxFormatted.unit}
          subtext={`Recalculated for ${distanceKm} km`}
          badgeText={`${formatNumber(totals.noxGrams, 0)} g`}
          icon={Zap}
          variant="amber"
        />
      </div>

      {/* Formula & Scientific Logic Card */}
      <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-2">
          Mathematical Formulation & Dynamic Recalculation
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          TollTrack applies the standard transport environmental model where tailpipe emissions are directly proportional to cumulative Vehicle Kilometres Traveled:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block mb-1">
              Step 1: Activity Multiplier
            </span>
            <code className="text-xs font-mono text-slate-900 dark:text-slate-100 font-bold block">
              VKT = Vehicle Count × Distance
            </code>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Active: {formatNumber(totals.vehicleCount)} × {distanceKm} = {formatNumber(totals.vehicleKm)} km
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 block mb-1">
              Step 2: CO2 Estimation
            </span>
            <code className="text-xs font-mono text-slate-900 dark:text-slate-100 font-bold block">
              CO2 (kg) = VKT × EF_CO2 (kg/km)
            </code>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Active Total: {formatNumber(totals.co2Kg)} kg ({co2Formatted.value} {co2Formatted.unit})
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1">
              Step 3: NOx Estimation
            </span>
            <code className="text-xs font-mono text-slate-900 dark:text-slate-100 font-bold block">
              NOx (kg) = VKT × EF_NOx (g/km) / 1000
            </code>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Active Total: {formatNumber(totals.noxKg, 2)} kg ({formatNumber(totals.noxGrams, 0)} g)
            </p>
          </div>
        </div>
      </div>

      {/* Trajectory Scaling Chart */}
      <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Distance Sensitivity Trajectory (10 km – 150 km)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Simulating emissions scaling as corridor transit distance increases
            </p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Active: {distanceKm} km
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trajectoryData}
              margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="distance" tick={{ fontSize: 11 }} />
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
                  name === 'co2Tonnes' ? 'Total CO2' : 'Total NOx',
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
                    {val === 'co2Tonnes' ? 'CO2 Emissions (Tonnes)' : 'NOx Emissions (kg)'}
                  </span>
                )}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="co2Tonnes"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="co2Tonnes"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="noxKg"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="noxKg"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown at Active Distance */}
      <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Category-Wise Recalculations at {distanceKm} km
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live outputs derived from {formatNumber(totals.vehicleCount)} total vehicles
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {distanceKm} km Applied
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Vehicle Category</th>
                <th className="py-3 px-4 text-right">Count</th>
                <th className="py-3 px-4 text-right">Assumed Distance</th>
                <th className="py-3 px-4 text-right">Computed VKT</th>
                <th className="py-3 px-4 text-right">CO2 Factor</th>
                <th className="py-3 px-4 text-right">Resulting CO2</th>
                <th className="py-3 px-4 text-right">NOx Factor</th>
                <th className="py-3 px-4 text-right">Resulting NOx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {categories.map((c) => (
                <tr key={c.category} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    {c.category}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-800 dark:text-slate-200">
                    {formatNumber(c.activeCount)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-700 dark:text-emerald-400">
                    {distanceKm} km
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-slate-900 dark:text-slate-100">
                    {formatNumber(c.vkt)} km
                  </td>
                  <td className="py-3 px-4 text-right text-xs font-mono text-slate-500">
                    {c.co2Factor} kg/km
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                    {formatNumber(c.co2Tonnes, 3)} t
                  </td>
                  <td className="py-3 px-4 text-right text-xs font-mono text-slate-500">
                    {c.noxFactor} g/km
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-amber-700 dark:text-amber-400">
                    {formatNumber(c.noxKg, 3)} kg
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100/80 dark:bg-slate-800/80 font-bold border-t border-slate-200 dark:border-slate-700">
              <tr>
                <td className="py-3 px-4">FLEET TOTAL</td>
                <td className="py-3 px-4 text-right">{formatNumber(totals.vehicleCount)}</td>
                <td className="py-3 px-4 text-right">{distanceKm} km</td>
                <td className="py-3 px-4 text-right font-mono">{formatNumber(totals.vehicleKm)} km</td>
                <td className="py-3 px-4 text-right">-</td>
                <td className="py-3 px-4 text-right text-emerald-700 dark:text-emerald-400">
                  {formatNumber(totals.co2Tonnes, 3)} Tonnes
                </td>
                <td className="py-3 px-4 text-right">-</td>
                <td className="py-3 px-4 text-right text-amber-700 dark:text-amber-400">
                  {formatNumber(totals.noxKg, 3)} kg
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
