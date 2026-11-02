import React from 'react';
import {
  Cloud,
  Trees,
  Fuel,
  Info,
  TrendingUp,
  PieChart as PieIcon,
  BarChart2,
  Leaf,
  ShieldCheck,
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
import { formatNumber, formatEmissions, formatPercent } from '../utils/formatters';
import DistanceControl from '../components/DistanceControl';
import NoticeBanner from '../components/NoticeBanner';
import KPICard from '../components/KPICard';

const COLORS = [
  '#10b981', // Car (Emerald)
  '#06b6d4', // Mini LCV (Cyan)
  '#3b82f6', // LCV (Blue)
  '#8b5cf6', // Bus (Purple)
  '#f59e0b', // 2-Axle (Amber)
  '#f97316', // 3-Axle (Orange)
  '#ef4444', // Multi-Axle (Red)
];

export default function CO2Analysis({ onNavigate }) {
  const { emissions, distanceKm, countType } = useTraffic();
  const { totals, categories } = emissions;

  const co2Formatted = formatEmissions(totals.co2Kg);

  // Bar Chart Data (Tonnes by category)
  const barData = categories.map((c) => ({
    name: c.category.length > 12 ? c.category.split('/')[0].trim() : c.category,
    fullName: c.category,
    co2Tonnes: Number(c.co2Tonnes.toFixed(2)),
    co2Kg: Number(c.co2Kg.toFixed(1)),
    share: Number(c.co2Share.toFixed(1)),
  }));

  // Pie Chart Data (Share of CO2 emissions)
  const pieData = categories.map((c, i) => ({
    name: c.category,
    value: Number(c.co2Kg.toFixed(1)),
    share: c.co2Share,
    color: COLORS[i % COLORS.length],
  }));

  // Find biggest emitter
  const biggestEmitter = [...categories].sort((a, b) => b.co2Kg - a.co2Kg)[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 m-0">
          CO2 Emission Analysis
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Quantitative carbon dioxide footprint assessment based on ARAI/CPCB fuel consumption and emission indices
        </p>
      </div>

      <NoticeBanner countType={countType} onNavigate={onNavigate} />

      {/* Distance Simulator Bar */}
      <DistanceControl />

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total CO2 Emissions"
          value={co2Formatted.value}
          unit={co2Formatted.unit}
          subtext={`Cumulative: ${formatNumber(totals.co2Kg)} kg CO2`}
          badgeText={`${distanceKm} km assumed`}
          icon={Cloud}
          variant="emerald"
        />

        <KPICard
          title="Highest Carbon Emitter"
          value={biggestEmitter ? biggestEmitter.category : 'N/A'}
          unit={`${formatPercent(biggestEmitter?.co2Share || 0)}`}
          subtext={`${formatNumber(biggestEmitter?.co2Tonnes || 0, 2)} Tonnes CO2`}
          badgeText="Largest Share"
          icon={TrendingUp}
          variant="rose"
        />

        <KPICard
          title="Annual Trees Required"
          value={`~${formatNumber(Math.round(totals.treesNeededAnnual))}`}
          unit="Trees"
          subtext="To offset this carbon footprint for 1 year"
          badgeText="Carbon Sequestration"
          icon={Trees}
          variant="teal"
        />

        <KPICard
          title="Fuel Combusted Equiv."
          value={`~${formatNumber(Math.round(totals.dieselEquivalenceLitres))}`}
          unit="Litres"
          subtext="Standard diesel carbon density (~2.68 kg/L)"
          badgeText="Hydrocarbon Energy"
          icon={Fuel}
          variant="blue"
        />
      </div>

      {/* Scientific Formula Card */}
      <div className="rounded-xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 to-teal-50/30 dark:border-emerald-900/40 dark:from-emerald-950/20 dark:to-slate-900/60 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0 mt-0.5">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Scientific Emission Estimation Formulation
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
              Carbon emissions for each category are derived strictly using verified fuel consumption indices under the Indian Modified Driving Cycle (MIDC):
            </p>
            <div className="mt-2.5 p-3 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-slate-800 inline-block font-mono text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 font-bold">
              CO2 (kg) = Vehicle Count × Assumed Distance (km) × CO2 Factor (kg/km)
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              Note: The {distanceKm} km assumed distance is a uniform corridor modeling parameter applied across each category, not an individual vehicle journey tracker.
            </p>
          </div>
        </div>
      </div>


      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Category-wise CO2 */}
        <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Category-Wise CO2 Emissions (Metric Tonnes)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Absolute carbon footprint at {distanceKm} km assumed transit
              </p>
            </div>
            <BarChart2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
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
                <YAxis unit=" t" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val, name, item) => [
                    `${val} Tonnes (${formatNumber(item.payload.co2Kg)} kg, ${item.payload.share}%)`,
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
                <Bar dataKey="co2Tonnes" fill="#10b981" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`co2-bar-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Percentage Contribution of CO2 */}
        <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                CO2 Emission Percentage Contribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Proportionate contribution of each category to total carbon output
              </p>
            </div>
            <PieIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
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
                    <Cell key={`co2-pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name, item) => [
                    `${formatNumber(val)} kg (${formatPercent(item.payload.share)})`,
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

      {/* Detailed Category-wise CO2 Emission Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Category-Wise CO2 Emission Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified emission factors, fuel assumptions, and calculated carbon output
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
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
                <th className="py-3 px-4 text-right">CO2 Factor (kg/km)</th>
                <th className="py-3 px-4 text-right">CO2 (kg)</th>
                <th className="py-3 px-4 text-right">CO2 (Tonnes)</th>
                <th className="py-3 px-4 text-right">Contribution (%)</th>
                <th className="py-3 px-4">Source & Standard</th>
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
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                    {c.co2Factor.toFixed(3)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-slate-800 dark:text-slate-200">
                    {formatNumber(c.co2Kg, 1)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-700 dark:text-emerald-400">
                    {formatNumber(c.co2Tonnes, 3)} t
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-900 dark:text-slate-100">
                    {formatPercent(c.co2Share)}
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
                <td className="py-3.5 px-4 text-right">{formatNumber(totals.co2Kg, 1)} kg</td>
                <td className="py-3.5 px-4 text-right text-emerald-700 dark:text-emerald-400">
                  {formatNumber(totals.co2Tonnes, 3)} Tonnes
                </td>
                <td className="py-3.5 px-4 text-right">100.0%</td>
                <td className="py-3.5 px-4 text-xs text-slate-500">All 7 Categories Verified</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
