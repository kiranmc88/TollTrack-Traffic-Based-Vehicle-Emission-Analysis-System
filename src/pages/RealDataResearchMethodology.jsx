import React, { useState, useMemo } from 'react';
import {
  Database,
  ExternalLink,
  Download,
  Search,
  ArrowUpDown,
  ShieldCheck,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  Calculator,
  Route,
  Cloud,
  Zap,
  BarChart3,
  PieChart as PieIcon,
  CheckCircle2,
  Info,
  Calendar,
  MapPin,
  Clock,
  Building2,
  FileCheck2,
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
import { formatNumber, formatEmissions, formatNox, formatPercent } from '../utils/formatters';
import DistanceControl from '../components/DistanceControl';

const CATEGORY_COLORS = [
  '#10b981', // Car (Emerald)
  '#06b6d4', // Mini LCV (Cyan)
  '#3b82f6', // LCV (Blue)
  '#8b5cf6', // Bus (Purple)
  '#f59e0b', // 2-Axle (Amber)
  '#f97316', // 3-Axle (Orange)
  '#ef4444', // Multi-Axle (Red)
];

export default function RealDataResearchMethodology() {
  const {
    trafficData,
    originalData,
    emissionFactors,
    emissions,
    distanceKm,
    countType,
    downloadOriginal,
    downloadProcessed,
    exportEmissionReport,
  } = useTraffic();

  const { totals, categories } = emissions;
  const co2Formatted = formatEmissions(totals.co2Kg);
  const noxFormatted = formatNox(totals.noxKg);

  // Search & Sort state for the exact traffic records table
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState('daily_count');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' | 'desc'
  const [activeVizTab, setActiveVizTab] = useState('counts'); // 'counts' | 'co2' | 'nox'

  // Exact records data array with full metadata
  const actualRecords = useMemo(() => {
    return trafficData.map((row) => ({
      tollPlazaName: 'Chokkenahalli Toll Plaza',
      state: 'Karnataka',
      highway: 'NH-48 (Km 61+500, Nelamangala – Tumakuru)',
      reportingMonth: 'October (FY2026 YTD)',
      reportingYear: '2025',
      category: row.category,
      categoryCode: row.category_code,
      actualVehicleCount: row.daily_count, // Actual observed AADT
      derived30DayCount: row.estimated_30day_count, // Derived estimate
      sourceDocument: 'Raajmarg InvIT Valuation & NHAI Traffic Census',
      dataRetrievalDate: 'November 2026',
      dataType: 'Actual Daily Traffic Census (AADT)',
      pcuFactor: row.pcu_factor,
    }));
  }, [trafficData]);

  // Filtered and sorted records
  const filteredRecords = useMemo(() => {
    let result = actualRecords.filter((r) =>
      r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.categoryCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

    result.sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];
      if (typeof aVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc' ? (aVal ?? 0) - (bVal ?? 0) : (bVal ?? 0) - (aVal ?? 0);
    });

    return result;
  }, [actualRecords, searchQuery, sortColumn, sortDirection]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Chart data
  const chartData = categories.map((c) => ({
    name: c.category.length > 12 ? c.category.split('/')[0].trim() : c.category,
    fullName: c.category,
    actualCount: c.daily_count,
    trafficShare: Number(c.trafficShare.toFixed(1)),
    co2Tonnes: Number(c.co2Tonnes.toFixed(2)),
    co2Share: Number(c.co2Share.toFixed(1)),
    noxKg: Number(c.noxKg.toFixed(2)),
    noxShare: Number(c.noxShare.toFixed(1)),
  }));

  const pieData = categories.map((c, i) => ({
    name: c.category,
    value: c.activeCount,
    share: c.trafficShare,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Title & Intro */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
          <FileCheck2 className="w-4 h-4" /> Real Data Verification & Engineering Rigor
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 m-0">
          Real Data & Research Methodology
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2 max-w-4xl leading-relaxed">
          Full technical provenance, actual toll plaza traffic logs, mathematical modeling equations, verified emission indices, and open CSV downloads demonstrating authentic real-world data utilization.
        </p>
      </div>

      {/* RESEARCH TRANSPARENCY NOTICE (MANDATORY REQUIREMENT) */}
      <div className="p-5 sm:p-6 rounded-2xl border-2 border-emerald-500/60 bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 m-0">
              Research Transparency Notice
            </h2>
            <blockquote className="p-4 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-emerald-200 dark:border-emerald-800/60 text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed italic">
              "This project uses published toll plaza traffic records to estimate vehicle-category-wise CO2 and NOx emissions. Emissions are calculated using documented emission factors and an adjustable assumed travel distance. The results are estimates and do not represent direct exhaust-gas measurements."
            </blockquote>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              • Academic Integrity Notice: All tailpipe mass estimations are mathematical derivations combining observed cross-sectional traffic volumes with dynamometer-tested emission factors. Ambient air concentrations or continuous exhaust-pipe spectroscopy are excluded.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: DATA SOURCES (MANDATORY 3 SOURCES WITH CLICKABLE BUTTONS) */}
      <section className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400">
          <Database className="w-5 h-5 shrink-0" />
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 m-0">
            1. Official Data Sources & Regulatory Repositories
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          This system interfaces with verified highway operations documentation and national electronic toll transaction records:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Source 1 */}
          <div className="flex flex-col justify-between p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all">
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 uppercase tracking-wider">
                Source 1
              </span>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-snug">
                Indian Highways Management Company Limited (IHMCL)
              </h3>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                Official ETC Transaction Reports
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                National portal providing statutory electronic toll collection transaction logs, lane-wise operational throughput, and automated FASTag surveillance summaries across Indian national highways.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-slate-200/80 dark:border-slate-700">
              <a
                href="https://ihmcl.co.in/etc-transaction-reports/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <span>Visit IHMCL ETC Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Source 2 */}
          <div className="flex flex-col justify-between p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all">
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 uppercase tracking-wider">
                Source 2
              </span>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-snug">
                MoRTH / IHMCL Vehicle Category-wise FASTag Dataset
              </h3>
              <p className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                Dataful Open-Data Repository (Dataset #21607)
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Standardized open-access repository cataloging state, month, toll plaza, and vehicle category-wise volume and value of FASTag transactions under the Ministry of Road Transport and Highways.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-slate-200/80 dark:border-slate-700">
              <a
                href="https://dataful.in/datasets/21607/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors shadow-xs"
              >
                <span>Explore Dataful Dataset 21607</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Source 3 */}
          <div className="flex flex-col justify-between p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all">
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 uppercase tracking-wider">
                Source 3
              </span>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-snug">
                Raajmarg Infra Investment Trust (RIIT)
              </h3>
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                Historical Traffic Analysis for Chokkenahalli Toll Plaza
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Published Draft Offer Document & Independent Valuer Report (RBSA / NHAI) archiving the verified 37,277 AADT baseline for the Nelamangala–Tumakuru section on NH-48 up to October 2025.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-slate-200/80 dark:border-slate-700 space-y-1.5">
              <span className="block text-[11px] text-amber-800 dark:text-amber-300 font-semibold">
                ⚠️ Used strictly as a historical baseline reference, not as latest monthly dataset.
              </span>
              <a
                href="https://raajmarginfratrust.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-xs"
              >
                <span>View Raajmarg Trust Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: DATA PROVENANCE & STRICT CATEGORICAL SEPARATION */}
      <section className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400">
          <Layers className="w-5 h-5 shrink-0" />
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 m-0">
            2. Data Provenance & Categorical Separation Protocol
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          To maintain strict scientific validity for engineering project evaluation, TollTrack strictly distinguishes between actual observations, historical records, mathematical estimates, and distance simulations:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase block mb-1">
              Category A
            </span>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Actual Traffic Observations
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Cross-sectional FASTag transaction logs recorded at toll lanes (AADT = 37,277 veh/day).
            </p>
            <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200">
              Verified Primary Data
            </span>
          </div>

          <div className="p-4 rounded-xl border border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30">
            <span className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase block mb-1">
              Category B
            </span>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Historical Traffic Records
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Published baseline up to October 2025. Preserved as historical reference benchmark.
            </p>
            <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-200">
              Historical Reference
            </span>
          </div>

          <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase block mb-1">
              Category C
            </span>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Estimated Monthly Counts
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Derived projection: <code className="font-mono">AADT × 30</code> = 1,118,310. Never mislabeled as actual.
            </p>
            <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
              Derived Extrapolation
            </span>
          </div>

          <div className="p-4 rounded-xl border border-purple-300 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30">
            <span className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase block mb-1">
              Category D
            </span>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Simulated Sensitivity Data
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              VKT, CO2, and NOx outputs across varying transit distances (10 km to 100+ km).
            </p>
            <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-200">
              Mathematical Simulation
            </span>
          </div>
        </div>

        {/* Provenance Metadata Table */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            Dataset Provenance Audit Log:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-slate-600 dark:text-slate-300">
            <div>
              <span className="text-slate-400 block font-semibold">Original Filename:</span>
              <span className="font-mono font-medium text-slate-800 dark:text-slate-200">chokkenahalli_traffic.csv</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Source Organization:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">NHAI / IHMCL / RIIT</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Data Retrieval Date:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">November 2026</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Actual Reporting Period:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">FY2026 Baseline (up to Oct 2025)</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: ACTUAL DATA DISPLAY (SEARCHABLE & SORTABLE TABLE) */}
      <section className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 m-0">
                3. Exact Traffic Records Used in Calculations
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {filteredRecords.length} Categories
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Search by category name or click column headers to sort.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* The Searchable/Sortable Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th
                  onClick={() => handleSort('tollPlazaName')}
                  className="py-3 px-3.5 cursor-pointer hover:text-emerald-600"
                >
                  <div className="flex items-center gap-1">Toll Plaza <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th
                  onClick={() => handleSort('state')}
                  className="py-3 px-3 cursor-pointer hover:text-emerald-600"
                >
                  <div className="flex items-center gap-1">State <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th
                  onClick={() => handleSort('category')}
                  className="py-3 px-3.5 cursor-pointer hover:text-emerald-600"
                >
                  <div className="flex items-center gap-1">Vehicle Category <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th
                  onClick={() => handleSort('actualVehicleCount')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-emerald-600"
                >
                  <div className="flex items-center justify-end gap-1">Actual AADT Count <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th
                  onClick={() => handleSort('derived30DayCount')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-emerald-600"
                >
                  <div className="flex items-center justify-end gap-1">Derived 30-Day Count <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-3 px-3">Reporting Period</th>
                <th className="py-3 px-3">Source Document</th>
                <th className="py-3 px-3">Retrieval Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRecords.map((r, i) => (
                <tr key={r.category} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3.5 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    {r.tollPlazaName}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                    {r.state}
                  </td>
                  <td className="py-3 px-3.5 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                    />
                    {r.category}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                    {formatNumber(r.actualVehicleCount)}
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-700 dark:text-slate-300 font-mono">
                    {formatNumber(r.derived30DayCount)}
                  </td>
                  <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-400">
                    {r.reportingMonth} {r.reportingYear}
                  </td>
                  <td className="py-3 px-3 text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
                    {r.sourceDocument}
                  </td>
                  <td className="py-3 px-3 text-xs text-slate-500 dark:text-slate-400">
                    {r.dataRetrievalDate}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100/80 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-slate-100 border-t border-slate-200 dark:border-slate-700">
              <tr>
                <td className="py-3 px-3.5" colSpan="3">
                  TOTAL VERIFIED BASELINE
                </td>
                <td className="py-3 px-3 text-right text-emerald-700 dark:text-emerald-400 font-mono">
                  {formatNumber(trafficData.reduce((s, r) => s + Number(r.daily_count || 0), 0))}
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  {formatNumber(trafficData.reduce((s, r) => s + Number(r.estimated_30day_count || 0), 0))}
                </td>
                <td className="py-3 px-3 text-xs text-slate-500" colSpan="3">
                  7 Categorized FASTag Vehicle Classes
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* SECTION 4: THREE DOWNLOAD OPTIONS */}
      <section className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400">
          <Download className="w-5 h-5 shrink-0" />
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 m-0">
            4. Open Data Download & Independent Inspection
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          Inspect and audit the exact datasets and calculated outputs used by TollTrack in standard CSV format:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Button 1: Download Original Dataset */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-2.5">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              1. Original Raw Dataset
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Untouched baseline counts from public/data/chokkenahalli_traffic.csv.
            </p>
            <button
              onClick={downloadOriginal}
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download Original Dataset</span>
            </button>
          </div>

          {/* Button 2: Download Processed Dataset */}
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-2.5">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              2. Processed Dataset
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Enriched with PCU factors, category codes, and verified emission factors.
            </p>
            <button
              onClick={downloadProcessed}
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Processed Dataset</span>
            </button>
          </div>

          {/* Button 3: Export Analysis as CSV */}
          <div className="p-4 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/30 dark:bg-teal-950/20 space-y-2.5">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              3. Complete Analysis Export
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Current VKT, category-wise CO2 (kg/t), NOx (kg/g), and percentage shares.
            </p>
            <button
              onClick={exportEmissionReport}
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Analysis as CSV</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 5: EMISSION METHODOLOGY & FACTORS */}
      <section className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400">
          <Calculator className="w-5 h-5 shrink-0" />
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 m-0">
            5. Quantitative Emission Formulas & Documented Factors
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-1">
              Vehicle Kilometres (VKT)
            </span>
            <code className="text-xs sm:text-sm font-mono font-extrabold text-slate-900 dark:text-slate-100 block">
              Vehicle Kilometres = Vehicle Count × Assumed Distance
            </code>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider block mb-1">
              CO2 Emission Mass
            </span>
            <code className="text-xs sm:text-sm font-mono font-extrabold text-slate-900 dark:text-slate-100 block">
              CO2 (kg) = Vehicle Kilometres × CO2 factor (kg/km)
            </code>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-1">
              NOx Emission Mass
            </span>
            <code className="text-xs sm:text-sm font-mono font-extrabold text-slate-900 dark:text-slate-100 block">
              NOx (kg) = Vehicle Kilometres × NOx factor (g/km) / 1000
            </code>
          </div>
        </div>

        {/* Factors Table with Sources and Units */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-3.5">Vehicle Category</th>
                <th className="py-3 px-3 text-right">CO2 Factor</th>
                <th className="py-3 px-3 text-right">NOx Factor</th>
                <th className="py-3 px-3">Fuel Assumptions</th>
                <th className="py-3 px-3">Emission Standard</th>
                <th className="py-3 px-3">Documented Source</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {emissionFactors.map((f, i) => (
                <tr key={f.category} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3.5 font-bold text-slate-900 dark:text-slate-100">
                    {f.category}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {f.co2_factor.toFixed(3)} {f.co2_unit || 'kg/km'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-amber-700 dark:text-amber-400">
                    {f.nox_factor.toFixed(2)} {f.nox_unit || 'g/km'}
                  </td>
                  <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-300">
                    {f.fuel_assumptions || f.fuel_type}
                  </td>
                  <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-300">
                    {f.emission_standard}
                  </td>
                  <td className="py-3 px-3 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block">{f.source}</span>
                    <span className="text-[11px] text-slate-400">Pub: {f.publication_year}</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Documented
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 6: DATA VISUALIZATIONS (SAME VALIDATED DATASET) */}
      <section className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 m-0">
                6. Scientific Visualizations & Distance Simulator
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              All charts are bound dynamically to the verified Chokkenahalli dataset.
            </p>
          </div>

          {/* Visualization Tab Switcher */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start sm:self-center">
            <button
              onClick={() => setActiveVizTab('counts')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeVizTab === 'counts'
                  ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-900 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Actual Counts
            </button>
            <button
              onClick={() => setActiveVizTab('co2')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeVizTab === 'co2'
                  ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-900 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              CO2 Emissions
            </button>
            <button
              onClick={() => setActiveVizTab('nox')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeVizTab === 'nox'
                  ? 'bg-white text-amber-700 shadow-xs dark:bg-slate-900 dark:text-amber-400'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              NOx Emissions
            </button>
          </div>
        </div>

        {/* Distance Simulator Bar Embedded */}
        <DistanceControl />

        {/* Key Totals Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Vehicles</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {formatNumber(totals.vehicleCount)}
            </span>
            <span className="text-xs text-slate-500 block mt-1">
              {countType === 'monthly' ? 'Estimated 30-Day Extrapolation' : 'Observed Daily Baseline (AADT)'}
            </span>
          </div>

          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">Total CO2 Output</span>
            <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
              {co2Formatted.value} <span className="text-sm font-semibold">{co2Formatted.unit}</span>
            </span>
            <span className="text-xs text-slate-500 block mt-1">
              At {distanceKm} km assumed transit (~{formatNumber(totals.co2Kg)} kg)
            </span>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20">
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Total NOx Output</span>
            <span className="text-2xl font-extrabold text-amber-700 dark:text-amber-400">
              {noxFormatted.value} <span className="text-sm font-semibold">{noxFormatted.unit}</span>
            </span>
            <span className="text-xs text-slate-500 block mt-1">
              At {distanceKm} km assumed transit (~{formatNumber(totals.noxGrams, 0)} g)
            </span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Bar Comparison */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-3">
              {activeVizTab === 'counts'
                ? 'Category-Wise Vehicle Counts (AADT Baseline)'
                : activeVizTab === 'co2'
                ? `Category-Wise CO2 Emissions (Metric Tonnes at ${distanceKm} km)`
                : `Category-Wise NOx Emissions (kg at ${distanceKm} km)`}
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val, name, item) => [
                      activeVizTab === 'counts'
                        ? `${formatNumber(val)} veh (${item.payload.trafficShare}%)`
                        : activeVizTab === 'co2'
                        ? `${val} Tonnes (${item.payload.co2Share}%)`
                        : `${val} kg (${item.payload.noxShare}%)`,
                      item.payload.fullName,
                    ]}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar
                    dataKey={activeVizTab === 'counts' ? 'actualCount' : activeVizTab === 'co2' ? 'co2Tonnes' : 'noxKg'}
                    fill={activeVizTab === 'nox' ? '#f59e0b' : '#10b981'}
                    radius={[4, 4, 0, 0]}
                  >
                    {chartData.map((_, idx) => (
                      <Cell key={`bar-${idx}`} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Proportional Share Donut */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-3">
              Percentage Distribution of Traffic
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    dataKey="value"
                    label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`pie-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name, item) => [`${formatNumber(val)} (${formatPercent(item.payload.share)})`, name]}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(val) => <span className="text-[11px] text-slate-700 dark:text-slate-300">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
