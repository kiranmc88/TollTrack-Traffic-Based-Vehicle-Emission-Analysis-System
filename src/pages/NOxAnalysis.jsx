import React from 'react';
import {
  Zap,
  AlertTriangle,
  Wind,
  Activity,
  TrendingUp,
  BarChart2,
  PieChart as PieIcon,
  ShieldCheck,
  HeartPulse,
  Info,
  Atom,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useTraffic } from '../hooks/useTrafficData';
import { formatNumber, formatNox, formatPercent } from '../utils/formatters';
import DistanceControl from '../components/DistanceControl';
import NoticeBanner from '../components/NoticeBanner';
import KPICard from '../components/KPICard';
import DataTransparencyCard from '../components/DataTransparencyCard';

const COLORS = [
  '#10b981', // Car (Emerald)
  '#06b6d4', // Mini LCV (Cyan)
  '#3b82f6', // LCV (Blue)
  '#8b5cf6', // Bus (Purple)
  '#f59e0b', // 2-Axle (Amber)
  '#f97316', // 3-Axle (Orange)
  '#ef4444', // Multi-Axle (Red)
];

export default function NOxAnalysis({ onNavigate }) {
  const { emissions, distanceKm, countType } = useTraffic();
  const { totals, categories } = emissions;

  const noxFormatted = formatNox(totals.noxKg);

  // Bar Chart Data
  const barData = categories.map((c) => ({
    name: c.category.length > 12 ? c.category.split('/')[0].trim() : c.category,
    fullName: c.category,
    noxKg: Number(c.noxKg.toFixed(2)),
    noxGrams: Number(c.noxGrams.toFixed(0)),
    share: Number(c.noxShare.toFixed(1)),
  }));

  // Pie Chart Data
  const pieData = categories.map((c, i) => ({
    name: c.category,
    value: Number(c.noxKg.toFixed(2)),
    share: c.noxShare,
    color: COLORS[i % COLORS.length],
  }));

  // Highest NOx emitter
  const highestNoxEmitter = [...categories].sort((a, b) => b.noxKg - a.noxKg)[0];

  // Heavy Commercial Vehicles NOx Share (Buses + 2-Axle + 3-Axle + Multi-Axle)
  const heavyNoxShare = categories
    .filter(c => ['Bus', '2-Axle Truck', '3-Axle Truck', 'Multi-Axle Vehicle / OSV'].includes(c.category))
    .reduce((sum, c) => sum + c.noxShare, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 m-0">
          NOx (Nitrogen Oxides) Emission Analysis
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Tailpipe quantification of reactive nitrogen oxides (NO + NO2) emitted by highway traffic at Chokkenahalli Toll Plaza
        </p>
      </div>

      <NoticeBanner countType={countType} onNavigate={onNavigate} />

      {/* Distance Simulator Bar */}
      <DistanceControl />

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total NOx (Nitrogen Oxides)"
          value={noxFormatted.value}
          unit={noxFormatted.unit}
          subtext={`Total mass: ${formatNumber(totals.noxGrams, 0)} grams`}
          badgeText={`${distanceKm} km assumed`}
          icon={Zap}
          variant="amber"
        />

        <KPICard
          title="Top NOx Contributor"
          value={highestNoxEmitter ? highestNoxEmitter.category : 'N/A'}
          unit={`${formatPercent(highestNoxEmitter?.noxShare || 0)}`}
          subtext={`${formatNumber(highestNoxEmitter?.noxKg || 0, 2)} kg NOx`}
          badgeText="Peak Toxicity Source"
          icon={TrendingUp}
          variant="rose"
        />

        <KPICard
          title="Heavy Freight Share"
          value={formatPercent(heavyNoxShare)}
          unit="of Fleet NOx"
          subtext="Produced by commercial trucks & buses"
          badgeText="High Combustion Temps"
          icon={Wind}
          variant="slate"
        />

        <KPICard
          title="Conversion Formula"
          value="/ 1000"
          unit="g → kg"
          subtext="SI metric conversion standard"
          badgeText="g/km to kg/km"
          icon={Activity}
          variant="teal"
        />
      </div>

      {/* CRITICAL SCIENTIFIC DISTINCTION CARD (Item 2 & 3 Requirements) */}
      <div className="rounded-xl border border-sky-300 dark:border-sky-800 bg-gradient-to-r from-sky-50 via-indigo-50/40 to-white dark:from-slate-900 dark:via-sky-950/30 dark:to-slate-900 p-5 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-sky-600 text-white shrink-0 mt-0.5 shadow-sm">
            <Atom className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Scientific Terminology & Atmospheric Chemistry: NOx vs. Ambient Nitrate
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                Peer-Reviewed Standard
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>1. Precise Nomenclature:</strong> This analysis strictly evaluates <strong>NOx (nitrogen oxides)</strong>, which consists predominantly of <strong>nitric oxide (NO)</strong> and <strong>nitrogen dioxide (NO2)</strong> generated in internal combustion cylinders under high thermal conditions.
            </p>

            <div className="p-3 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-sky-200 dark:border-sky-900/60 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
              <p>
                <strong>2. Tailpipe Mass vs. Ambient Concentration Boundary:</strong> TollTrack calculates the <strong>direct tailpipe mass emission (in kg of NOx)</strong> produced along the highway corridor.
              </p>
              <p className="text-amber-800 dark:text-amber-300 font-medium">
                ⚠️ Important Scientific Distinction: Traffic counts alone do NOT measure ambient atmospheric nitrate (NO3⁻) concentration or ground-level air quality (µg/m³). Ambient nitrate formation requires secondary photochemical oxidation with atmospheric moisture, ammonia, and solar radiation, which can only be determined by dedicated Continuous Ambient Air Quality Monitoring Stations (CAAQMS) and chemical transport models.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formula & Health Impact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50/60 to-orange-50/30 dark:border-amber-900/40 dark:from-amber-950/20 dark:to-slate-900/60 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-600 text-white shrink-0 mt-0.5">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                NOx Scientific Formulation
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Calculated separately for every vehicle category:
              </p>
              <div className="mt-2.5 p-3 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-800 font-mono text-xs text-amber-800 dark:text-amber-300 font-bold">
                NOx (kg) = Vehicle Count × Assumed Distance (km) × NOx Factor (g/km) / 1000
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                Active distance: <strong>{distanceKm} km</strong> • Division by 1000 converts grams into kilograms.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-rose-200/80 bg-gradient-to-br from-rose-50/60 to-red-50/30 dark:border-rose-900/40 dark:from-rose-950/20 dark:to-slate-900/60 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-600 text-white shrink-0 mt-0.5">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Environmental & Human Health Hazards
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Nitrogen oxides (NO + NO2) are primary precursors to ground-level ozone and fine secondary particulate matter (PM2.5). Prolonged exposure along highway corridors exacerbates asthma, diminishes lung capacity, and causes respiratory tract inflammation in urban and semi-urban populations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Category-wise NOx */}
        <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Category-Wise NOx Emissions (kg)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Mass of nitrogen oxides produced at {distanceKm} km assumed transit
              </p>
            </div>
            <BarChart2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 10, right: 10, left: 0, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis unit=" kg" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val, name, item) => [
                    `${val} kg NOx (${formatNumber(item.payload.noxGrams)} g, ${item.payload.share}%)`,
                    item.payload.fullName,
                  ]}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    color: '#f8fafc',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="noxKg" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`nox-bar-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Percentage Contribution of NOx */}
        <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                NOx Contribution Percentage by Category
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Multi-axle trucks and heavy freight drive the vast majority of NOx pollution
              </p>
            </div>
            <PieIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`nox-pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name, item) => [
                    `${formatNumber(val, 2)} kg (${formatPercent(item.payload.share)})`,
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
                  height={36}
                  formatter={(val) => <span className="text-xs text-slate-700 dark:text-slate-300">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Category-wise NOx Emission Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Category-Wise NOx Emission Factor & Calculation Table
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified emission factors (g/km), mass in grams, and total in kg
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            Distance: {distanceKm} km
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Vehicle Category</th>
                <th className="py-3 px-4 text-right">Count</th>
                <th className="py-3 px-4 text-right">VKT ({distanceKm} km)</th>
                <th className="py-3 px-4 text-right">NOx Factor (g/km)</th>
                <th className="py-3 px-4 text-right">Total NOx (g)</th>
                <th className="py-3 px-4 text-right">Total NOx (kg)</th>
                <th className="py-3 px-4 text-right">NOx Share (%)</th>
                <th className="py-3 px-4">Standard & Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {categories.map((c, index) => (
                <tr key={c.category} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    {c.category}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-slate-800 dark:text-slate-200">
                    {formatNumber(c.activeCount)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                    {formatNumber(c.vkt)} km
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-amber-700 dark:text-amber-400">
                    {c.noxFactor.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-800 dark:text-slate-200">
                    {formatNumber(c.noxGrams, 0)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-amber-700 dark:text-amber-400">
                    {formatNumber(c.noxKg, 3)} kg
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-900 dark:text-slate-100">
                    {formatPercent(c.noxShare)}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-700 dark:text-slate-300 block">{c.factorSource}</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">{c.emissionStandard}</span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100/80 dark:bg-slate-800/80 font-bold border-t border-slate-200 dark:border-slate-700">
              <tr>
                <td className="py-3.5 px-4">FLEET TOTAL</td>
                <td className="py-3.5 px-4 text-right">{formatNumber(totals.vehicleCount)}</td>
                <td className="py-3.5 px-4 text-right font-mono">{formatNumber(totals.vehicleKm)} km</td>
                <td className="py-3.5 px-4 text-right">-</td>
                <td className="py-3.5 px-4 text-right">{formatNumber(totals.noxGrams, 0)} g</td>
                <td className="py-3.5 px-4 text-right text-amber-700 dark:text-amber-400">
                  {formatNumber(totals.noxKg, 3)} kg
                </td>
                <td className="py-3.5 px-4 text-right">100.0%</td>
                <td className="py-3.5 px-4 text-xs text-slate-500">All 7 Categories Verified</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Audit Matrix */}
      <DataTransparencyCard />
    </div>
  );
}
