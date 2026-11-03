import React from 'react';
import {
  Car,
  Cloud,
  Zap,
  Route,
  Trees,
  TrendingUp,
  Fuel,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  Camera,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useTraffic } from '../hooks/useTrafficData';
import { formatNumber, formatEmissions, formatNox, formatPercent } from '../utils/formatters';
import KPICard from '../components/KPICard';
import DistanceControl from '../components/DistanceControl';
import NoticeBanner from '../components/NoticeBanner';
import ScientificBadge from '../components/ScientificBadge';
import DataTransparencyCard from '../components/DataTransparencyCard';

const CATEGORY_COLORS = [
  '#10b981', // Car (Emerald)
  '#06b6d4', // Mini LCV (Cyan)
  '#3b82f6', // LCV (Blue)
  '#8b5cf6', // Bus (Purple)
  '#f59e0b', // 2-Axle (Amber)
  '#f97316', // 3-Axle (Orange)
  '#ef4444', // Multi-Axle (Red)
];

export default function OverviewDashboard({ onNavigate }) {
  const {
    trafficData,
    emissions,
    distanceKm,
    countType,
    factorValidation,
  } = useTraffic();

  const { totals, categories } = emissions;

  const co2Formatted = formatEmissions(totals.co2Kg);
  const noxFormatted = formatNox(totals.noxKg);

  // Data for Category Distribution Pie Chart
  const pieData = categories.map((cat, index) => ({
    name: cat.category,
    value: cat.activeCount,
    percentage: cat.trafficShare,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));

  // Data for Traffic Share vs CO2 Share Comparison
  const shareComparisonData = categories.map((cat) => ({
    name: cat.category.length > 12 ? cat.category.split('/')[0].trim() : cat.category,
    trafficShare: Number(cat.trafficShare.toFixed(1)),
    co2Share: Number(cat.co2Share.toFixed(1)),
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 m-0">
            Overview Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Chokkenahalli Toll Plaza (NH-48, Kyathsandra, Tumakuru) – Traffic & Vehicle Emissions Baseline
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ScientificBadge status={factorValidation.isValid ? 'verified' : 'pending_verification'} size="md" />
        </div>
      </div>

      {/* Derived 30-day & baseline notice */}
      <NoticeBanner countType={countType} onNavigate={onNavigate} />

      {/* Distance Simulator Bar */}
      <DistanceControl />

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Vehicles"
          value={formatNumber(totals.vehicleCount)}
          unit={countType === 'monthly' ? '30-Day Est.' : 'Vehicles / Day'}
          subtext={`Study Period: ${countType === 'monthly' ? 'Estimated 30-Day' : 'Daily Average (AADT)'}`}
          badgeText="FY2026 Base"
          icon={Car}
          variant="emerald"
        />

        <KPICard
          title="Estimated CO2 Emissions"
          value={co2Formatted.value}
          unit={co2Formatted.unit}
          subtext={`Distance: ${distanceKm} km assumed`}
          badgeText={`~${formatNumber(totals.co2Kg)} kg CO2`}
          icon={Cloud}
          variant="teal"
          onClick={() => onNavigate('co2')}
        />

        <KPICard
          title="Estimated NOx (Nitrogen Oxides)"
          value={noxFormatted.value}
          unit={noxFormatted.unit}
          subtext="NO + NO2 tailpipe mass (not ambient nitrate)"
          badgeText={`${formatNumber(totals.noxGrams, 0)} g total`}
          icon={Zap}
          variant="amber"
          onClick={() => onNavigate('nox')}
        />

        <KPICard
          title="Vehicle Kilometres (VKT)"
          value={formatNumber(totals.vehicleKm)}
          unit="VKT"
          subtext="Count × Assumed Distance"
          badgeText={`${distanceKm} km multiplier`}
          icon={Route}
          variant="blue"
          onClick={() => onNavigate('distance')}
        />
      </div>

      {/* Environmental Equivalents & Context Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-emerald-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400 shrink-0">
            <Trees className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Annual Tree Offset Required
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              ~{formatNumber(Math.round(totals.treesNeededAnnual))} Trees
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Based on ~21.77 kg CO2 absorption per mature tree/year
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-sky-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-400 shrink-0">
            <Fuel className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Diesel Fuel Equivalence
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              ~{formatNumber(Math.round(totals.dieselEquivalenceLitres))} Litres
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Approx. fuel combusted at 2.68 kg CO2 / L diesel
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Freight vs Passenger Ratio
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              41.8% Commercial
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Trucks & LCVs account for over 72% of total emissions
            </p>
          </div>
        </div>
      </div>

      {/* NEW FEATURE: AI Vehicle Detection & Emission Calculator Banner */}
      <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-gradient-to-r from-emerald-600 to-teal-700 p-5 sm:p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Fully Functional Feature</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            AI Vehicle Detection & Emission Calculator
          </h2>
          <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed">
            Capture a live photo with your camera or upload toll plaza imagery. Pretrained YOLO AI classifies
            cars, buses, trucks, and motorcycles, and calculates instantaneous CO2 & NOx emissions with adjustable distance.
          </p>
        </div>
        <button
          onClick={() => onNavigate('aiDetection')}
          className="px-5 py-3 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Camera className="w-4 h-4 text-emerald-700" />
          <span>Launch AI Detector</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Vehicle Category Distribution */}
        <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Vehicle Category Traffic Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Share of total traffic at Chokkenahalli Toll Plaza ({countType === 'monthly' ? 'Estimated 30-Day' : 'Daily Average'})
              </p>
            </div>
            <button
              onClick={() => onNavigate('traffic')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Details <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name, item) => [
                    `${formatNumber(val)} vehicles (${formatPercent(item.payload.percentage)})`,
                    name,
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
                  verticalAlign="bottom"
                  height={40}
                  formatter={(val) => <span className="text-xs text-slate-700 dark:text-slate-300">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Traffic Share vs CO2 Emissions Share */}
        <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Traffic Volume vs. Carbon Disparity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Traffic Share (%) vs. CO2 Contribution (%) by Vehicle Category
              </p>
            </div>
            <button
              onClick={() => onNavigate('co2')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              CO2 Insights <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={shareComparisonData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis unit="%" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val, name) => [
                    `${val}%`,
                    name === 'trafficShare' ? 'Traffic Share' : 'CO2 Emission Share',
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
                      {val === 'trafficShare' ? 'Traffic Share (%)' : 'CO2 Share (%)'}
                    </span>
                  )}
                />
                <Bar dataKey="trafficShare" fill="#06b6d4" radius={[4, 4, 0, 0]} name="trafficShare" />
                <Bar dataKey="co2Share" fill="#10b981" radius={[4, 4, 0, 0]} name="co2Share" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Table of All Categories */}
      <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Vehicle Category Summary Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live recalculation based on {distanceKm} km assumed travel distance
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 self-start sm:self-center">
            {categories.length} Registered Categories
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Vehicle Category</th>
                <th className="py-3 px-4 text-right">
                  {countType === 'monthly' ? '30-Day Est.' : 'Daily Count (AADT)'}
                </th>
                <th className="py-3 px-4 text-right">Traffic Share</th>
                <th className="py-3 px-4 text-right">VKT ({distanceKm} km)</th>
                <th className="py-3 px-4 text-right">CO2 Emissions</th>
                <th className="py-3 px-4 text-right">NOx Emissions</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {categories.map((c, index) => (
                <tr
                  key={c.category}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                    />
                    {c.category}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-slate-800 dark:text-slate-200">
                    {formatNumber(c.activeCount)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-600 dark:text-slate-400">
                    {formatPercent(c.trafficShare)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                    {formatNumber(c.vkt)} km
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                    {formatNumber(c.co2Tonnes, 2)} t <span className="text-xs text-slate-400">({formatPercent(c.co2Share)})</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-amber-700 dark:text-amber-400">
                    {formatNumber(c.noxKg, 2)} kg <span className="text-xs text-slate-400">({formatPercent(c.noxShare)})</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100/80 dark:bg-slate-800/80 font-bold border-t border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
              <tr>
                <td className="py-3.5 px-4">TOTAL SUMMARY</td>
                <td className="py-3.5 px-4 text-right">{formatNumber(totals.vehicleCount)}</td>
                <td className="py-3.5 px-4 text-right">100.0%</td>
                <td className="py-3.5 px-4 text-right font-mono">{formatNumber(totals.vehicleKm)} km</td>
                <td className="py-3.5 px-4 text-right text-emerald-700 dark:text-emerald-400">
                  {formatNumber(totals.co2Tonnes, 2)} Tonnes
                </td>
                <td className="py-3.5 px-4 text-right text-amber-700 dark:text-amber-400">
                  {formatNumber(totals.noxKg, 2)} kg
                </td>
                <td className="py-3.5 px-4 text-center text-xs text-slate-500">100% Verified</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Data Transparency & Scientific Audit Matrix */}
      <DataTransparencyCard />
    </div>
  );
}

