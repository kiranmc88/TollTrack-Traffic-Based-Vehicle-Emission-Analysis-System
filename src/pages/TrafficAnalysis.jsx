import React, { useState } from 'react';
import {
  ArrowUpDown,
  BarChart2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { useTraffic } from '../hooks/useTrafficData';
import { formatNumber, formatPercent } from '../utils/formatters';
import NoticeBanner from '../components/NoticeBanner';
import InteractivePieChart from '../components/InteractivePieChart';

const COLORS = [
  '#10b981', // Car (Emerald)
  '#06b6d4', // Mini LCV (Cyan)
  '#3b82f6', // LCV (Blue)
  '#8b5cf6', // Bus (Purple)
  '#f59e0b', // 2-Axle (Amber)
  '#f97316', // 3-Axle (Orange)
  '#ef4444', // Multi-Axle (Red)
];

export default function TrafficAnalysis({ onNavigate }) {
  const { trafficData, countType, setCountType, emissions } = useTraffic();
  const [sortField, setSortField] = useState('daily_count');
  const [sortAsc, setSortAsc] = useState(false);

  const { categories } = emissions;

  // Sorting
  const sortedCategories = [...categories].sort((a, b) => {
    let aVal = a[sortField] ?? a.daily_count;
    let bVal = b[sortField] ?? b.daily_count;
    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Bar Chart Data: Daily vs 30-Day Estimated
  const barData = categories.map((c) => ({
    name: c.category.length > 12 ? c.category.split('/')[0].trim() : c.category,
    fullName: c.category,
    daily: c.daily_count,
    monthly: c.estimated_30day_count,
    share: Number(c.trafficShare.toFixed(1)),
  }));

  // Pie Data
  const pieData = categories.map((c, i) => ({
    name: c.category,
    value: countType === 'monthly' ? c.estimated_30day_count : c.daily_count,
    share: c.trafficShare,
    color: COLORS[i % COLORS.length],
  }));

  // Total daily and total 30-day
  const totalDaily = trafficData.reduce((acc, r) => acc + Number(r.daily_count || 0), 0);
  const totalMonthly = trafficData.reduce((acc, r) => acc + Number(r.estimated_30day_count || 0), 0);
  const totalPcu = categories.reduce((acc, r) => acc + Number(r.totalPcu || 0), 0);

  // Passenger vs Freight
  const passengerCount = (trafficData.find(t => t.category.toLowerCase().includes('car'))?.daily_count || 0);
  const freightCount = totalDaily - passengerCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 m-0">
            Vehicle Traffic Analysis
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Category-wise traffic volume distributions from Chokkenahalli Toll Plaza (FY2026 published baseline)
          </p>
        </div>

        {/* Toggle Daily vs 30-day */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Displaying:</span>
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setCountType('daily')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                countType === 'daily'
                  ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-900 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Daily Average (AADT)
            </button>
            <button
              onClick={() => setCountType('monthly')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                countType === 'monthly'
                  ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-900 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Estimated 30-Day
            </button>
          </div>
        </div>
      </div>

      <NoticeBanner countType={countType} onNavigate={onNavigate} />

      {/* Highlights / Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-emerald-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Average Daily Traffic (AADT)
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {formatNumber(totalDaily)}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Vehicles/day
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Published FY2026 data up to Oct 2025
          </p>
        </div>

        <div className="rounded-xl border border-sky-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Derived 30-Day Estimate
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {formatNumber(totalMonthly)}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
              Vehicles / 30d
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Mathematical projection (AADT × 30)
          </p>
        </div>

        <div className="rounded-xl border border-amber-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Passenger Car Units (PCU)
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {formatNumber(Math.round(totalPcu))}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              PCU
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Weighted highway capacity impact (IRC)
          </p>
        </div>

        <div className="rounded-xl border border-purple-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Freight & Commercial Share
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {formatPercent((freightCount / totalDaily) * 100)}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              {formatNumber(freightCount)} / day
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Trucks, LCVs & multi-axle freight
          </p>
        </div>
      </div>

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Vehicle Counts */}
        <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Vehicle Volume by Category
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {countType === 'monthly' ? 'Estimated 30-Day Vehicle Counts' : 'Average Daily Traffic (AADT)'}
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
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                />
                <Tooltip
                  formatter={(val, name, item) => [
                    `${formatNumber(val)} vehicles (${item.payload.share}%)`,
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
                <Bar
                  dataKey={countType === 'monthly' ? 'monthly' : 'daily'}
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                >
                  {barData.map((entry, index) => (
                    <Cell key={`bar-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interactive Pie Chart: Percentage Distribution */}
        <InteractivePieChart
          initialData={pieData}
          defaultTitle="Percentage Contribution by Category"
          defaultSubtitle="Proportional share of total vehicle movements"
          unit="vehicles"
          badgeColor="cyan"
        />
      </div>

      {/* Comprehensive Traffic Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Vehicle Classification & Traffic Counts
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click table headers to sort. Daily counts are source AADT; 30-day counts are derived.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Source: NHAI FY2026
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
              <tr>
                <th
                  onClick={() => handleSort('category')}
                  className="py-3 px-4 cursor-pointer hover:text-emerald-600 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    Vehicle Category <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('daily_count')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-emerald-600 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    Daily AADT <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('estimated_30day_count')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-emerald-600 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    Estimated 30-Day <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Traffic Share</th>
                <th className="py-3 px-4 text-right">PCU Factor</th>
                <th className="py-3 px-4 text-right">Total PCU</th>
                <th className="py-3 px-4">Vehicle Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedCategories.map((c, index) => (
                <tr
                  key={c.category}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    {c.category}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-slate-800 dark:text-slate-200">
                    {formatNumber(c.daily_count)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-emerald-700 dark:text-emerald-400">
                    {formatNumber(c.estimated_30day_count)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                    {formatPercent(c.trafficShare)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                    {c.pcu_factor.toFixed(1)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-800 dark:text-slate-200">
                    {formatNumber(Math.round(c.totalPcu))}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                    {c.fuelType} – {c.emissionStandard}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100/80 dark:bg-slate-800/80 font-bold border-t border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
              <tr>
                <td className="py-3.5 px-4">TOTAL / FLEET SUM</td>
                <td className="py-3.5 px-4 text-right">{formatNumber(totalDaily)}</td>
                <td className="py-3.5 px-4 text-right text-emerald-700 dark:text-emerald-400">
                  {formatNumber(totalMonthly)}
                </td>
                <td className="py-3.5 px-4 text-right">100.0%</td>
                <td className="py-3.5 px-4 text-right">-</td>
                <td className="py-3.5 px-4 text-right">{formatNumber(Math.round(totalPcu))}</td>
                <td className="py-3.5 px-4 text-xs text-slate-500">7 Vehicle Categories</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
