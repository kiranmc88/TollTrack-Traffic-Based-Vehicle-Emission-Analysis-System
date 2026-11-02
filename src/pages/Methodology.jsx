import React from 'react';
import {
  BookOpen,
  MapPin,
  Database,
  Calculator,
  AlertCircle,
  ShieldCheck,
  FileText,
  Route,
  Cloud,
  Zap,
  Atom,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import NoticeBanner from '../components/NoticeBanner';
import DataTransparencyCard from '../components/DataTransparencyCard';

export default function Methodology({ onNavigate }) {
  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 m-0">
          Methodology & Scientific Principles
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Technical specifications, mathematical formulation, emission factor sources, and regulatory framework
        </p>
      </div>

      <NoticeBanner countType="daily" onNavigate={onNavigate} />

      {/* Data Transparency Card */}
      <DataTransparencyCard />

      {/* 1. Study Location */}
      <section className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400">
          <MapPin className="w-5 h-5 shrink-0" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 m-0">
            1. Study Location & Corridor Characteristics
          </h2>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
          <p>
            The spatial focus of this analysis is the <strong>Chokkenahalli Toll Plaza</strong>, situated at <strong>Chainage Km 61+500</strong> on National Highway 48 (NH-48, Nelamangala – Tumakuru section) near <strong>Kyathsandra, Tumakuru District, Karnataka</strong>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">
                Corridor Significance
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                NH-48 forms a critical artery of the Golden Quadrilateral, serving heavy commuter transit exiting Bengaluru towards Tumakuru as well as high-tonnage interstate freight connecting Karnataka and Maharashtra.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">
                Traffic Morphology
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                The plaza registers heavy throughput (~37,277 vehicles/day), characterized by high passenger car volumes (~58.2%) combined with significant medium-to-heavy commercial freight trucks and buses (~41.8%).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Source of Traffic Data & Lineage */}
      <section className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400">
          <Database className="w-5 h-5 shrink-0" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 m-0">
            2. Source of Traffic Data, Target Period & Lineage
          </h2>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
          <p>
            The project architecture is built to ingest monthly Electronic Toll Collection (ETC) FASTag reports from the <strong>Indian Highways Management Company Limited (IHMCL)</strong> and the <strong>Ministry of Road Transport and Highways (MoRTH)</strong>.
          </p>
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 leading-relaxed space-y-2">
            <p>
              <strong>Data Lineage & Scientific Protocol:</strong> Target reporting month is <strong>September 2026</strong>. In accordance with strict academic guidelines against fabricating counts:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Granular category-wise IHMCL FASTag data for September 2026 is currently pending official public compilation.</li>
              <li>The system retains the published <strong>FY2026 Average Daily Traffic (AADT) baseline up to October 2025</strong> strictly as a clearly labelled historical reference dataset.</li>
              <li>Historical baseline data is NEVER presented or misidentified as September 2026 data. Researchers with proprietary or updated IHMCL monthly CSV files can upload them directly into the system for instant recalculation.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. AADT-Based 30-Day Estimation */}
      <section className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400">
          <Calculator className="w-5 h-5 shrink-0" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 m-0">
            3. AADT-Based 30-Day Estimation vs Observed Monthly Counts
          </h2>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
          <p>
            A crucial methodological distinction is enforced across all dashboard cards and charts:
          </p>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 space-y-2">
            <p>
              <strong>Derived Monthly Projection:</strong> 30-day traffic numbers in the historical baseline are derived estimates:
            </p>
            <div className="p-2.5 bg-white dark:bg-slate-900 rounded font-mono font-bold text-emerald-700 dark:text-emerald-400 text-xs">
              Estimated 30-Day Count (i) = Average Daily Traffic (AADT_i) × 30
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              This mathematical extrapolation smooths transient day-to-day fluctuations to estimate a 30-day standard operating cycle, distinct from empirical continuous single-month counts.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Vehicle Kilometres Traveled & Distance Modelling Assumption */}
      <section className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400">
          <Route className="w-5 h-5 shrink-0" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 m-0">
            4. Vehicle Kilometres & Distance Modelling Assumption (Crucial Note)
          </h2>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
          <p>
            Activity across the corridor is evaluated via the standard transport metric:
          </p>
          <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 font-mono text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 font-bold">
            Vehicle Kilometres (VKT) = Vehicle Count × Assumed Distance (km)
          </div>

          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            <strong className="block text-sm font-bold mb-1">
              ⚠️ Critical Modelling Assumption vs. Measured Journey Distance:
            </strong>
            A toll plaza operates as a cross-sectional point sensor (Km 61+500) logging vehicles at a fixed geographical coordinate. Individual vehicles passing the plaza travel widely differing journey lengths—some travel 12 km to regional industrial zones, while others travel 150+ km between Hubballi and Bengaluru.
            <br /><br />
            <strong>The selected distance (default: 50 km) is a modeling assumption applied uniformly to every counted vehicle to evaluate corridor-level emissions, NOT an individually measured origin-to-destination journey distance.</strong>
          </div>
        </div>
      </section>

      {/* 5. CO2 Emission Quantification */}
      <section className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400">
          <Cloud className="w-5 h-5 shrink-0" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 m-0">
            5. CO2 Emission Quantification
          </h2>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
          <p>
            Carbon dioxide is computed per vehicle category using verified fuel economy emission indices:
          </p>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-bold">
            CO2 (kg) = Vehicle Count × Assumed Distance (km) × CO2 Factor (kg/km)
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded font-mono text-xs text-slate-700 dark:text-slate-300">
            Total CO2 (Metric Tonnes) = ∑ [ CO2 (kg) ] / 1,000
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Emission factors are sourced from ARAI type-approval tests and the India GHG Program road transport guidelines (0.148 kg/km for cars up to 1.250 kg/km for multi-axle freight trailers).
          </p>
        </div>
      </section>

      {/* 6. NOx Terminology, Formulation & Atmospheric Chemistry */}
      <section className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-amber-700 dark:text-amber-400">
          <Zap className="w-5 h-5 shrink-0" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 m-0">
            6. NOx (Nitrogen Oxides) Formulation & Chemical Boundary
          </h2>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
          <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 font-mono text-xs sm:text-sm text-amber-900 dark:text-amber-200 font-bold">
            NOx (kg) = Vehicle Count × Assumed Distance (km) × NOx Factor (g/km) / 1000
          </div>

          <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/60 text-xs text-slate-800 dark:text-slate-200 space-y-2">
            <h4 className="font-bold text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
              <Atom className="w-4 h-4 text-sky-600" />
              Nomenclature & Chemical Distinction (NOx vs. Ambient Nitrate):
            </h4>
            <p>
              • <strong>NOx Composition:</strong> The term <strong>NOx</strong> encompasses reactive oxides of nitrogen emitted directly from high-temperature engine combustion, comprising predominantly <strong>nitric oxide (NO)</strong> (~90-95%) and <strong>nitrogen dioxide (NO2)</strong> (~5-10%).
            </p>
            <p>
              • <strong>Ambient Nitrate Concentration Boundary:</strong> This application calculates <strong>tailpipe mass emissions</strong> (in kilograms of NOx). 
              <strong> Vehicle counts and emission factors alone do NOT measure ambient atmospheric nitrate (NO3⁻) concentration or volumetric air quality (µg/m³).</strong> Ambient nitrate forms via complex secondary atmospheric oxidation reactions with airborne moisture, sunlight, and ammonia, requiring field Continuous Ambient Air Quality Monitoring Stations (CAAQMS) for physical measurement.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Assumptions & Limitations */}
      <section className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 m-0">
            7. Assumptions and Limitations
          </h2>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-300 space-y-2.5 leading-relaxed text-xs sm:text-sm">
          <p>
            • <strong>Uniform Distance Multiplier:</strong> Assumed distance is applied as a bulk corridor parameter across each vehicle in a category.
          </p>
          <p>
            • <strong>Fleet-Averaged Standards:</strong> Factors model the representative on-road Indian highway vehicle mix (BS-IV dominant with transitioning BS-VI share).
          </p>
          <p>
            • <strong>Steady-State Highway Driving:</strong> Dynamometer factors correspond to continuous cruise cycles on rural highways; micro-level queue idling at toll lanes is averaged out.
          </p>
          <p>
            • <strong>Cold-Start Exclusion:</strong> Highway observations assume engines are running at stabilized operating thermal conditions.
          </p>
        </div>
      </section>
    </div>
  );
}
