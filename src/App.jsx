import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { TrafficProvider, useTraffic } from './context/TrafficContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import OverviewDashboard from './pages/OverviewDashboard';
import TrafficAnalysis from './pages/TrafficAnalysis';
import DistanceSimulator from './pages/DistanceSimulator';
import CO2Analysis from './pages/CO2Analysis';
import NOxAnalysis from './pages/NOxAnalysis';
import ComparisonAnalysis from './pages/ComparisonAnalysis';
import DataManagement from './pages/DataManagement';
import Methodology from './pages/Methodology';
import RealDataResearchMethodology from './pages/RealDataResearchMethodology';
import AiVehicleDetection from './pages/AiVehicleDetection';
import { AlertTriangle, Loader2 } from 'lucide-react';


function DashboardLayout() {
  const [activePage, setActivePage] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isLoading, error } = useTraffic();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Container */}
      <div className="flex-1 flex">
        {/* Navigation Sidebar */}
        <Sidebar
          activePage={activePage}
          onSelectPage={setActivePage}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
        />

        {/* Content Area */}
        <main className="flex-1 lg:pl-72 flex flex-col min-h-[calc(100vh-4rem)]">
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {isLoading ? (
              <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Loading Chokkenahalli Toll Plaza dataset...
                </p>
              </div>
            ) : error ? (
              <div className="p-6 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-base">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span>Failed to Load Traffic Data</span>
                </div>
                <p className="text-sm">{error}</p>
              </div>
            ) : (
              <>
                {activePage === 'overview' && (
                  <OverviewDashboard onNavigate={setActivePage} />
                )}
                {activePage === 'aiDetection' && (
                  <AiVehicleDetection onNavigate={setActivePage} />
                )}
                {activePage === 'realData' && (
                  <RealDataResearchMethodology onNavigate={setActivePage} />
                )}
                {activePage === 'traffic' && (
                  <TrafficAnalysis onNavigate={setActivePage} />
                )}
                {activePage === 'distance' && (
                  <DistanceSimulator onNavigate={setActivePage} />
                )}
                {activePage === 'co2' && (
                  <CO2Analysis onNavigate={setActivePage} />
                )}
                {activePage === 'nox' && (
                  <NOxAnalysis onNavigate={setActivePage} />
                )}
                {activePage === 'comparison' && (
                  <ComparisonAnalysis onNavigate={setActivePage} />
                )}
                {activePage === 'data' && (
                  <DataManagement onNavigate={setActivePage} />
                )}
                {activePage === 'methodology' && (
                  <Methodology onNavigate={setActivePage} />
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 py-6 px-4 sm:px-8 text-center text-xs text-slate-500 dark:text-slate-400">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  TollTrack
                </span>
                <span>•</span>
                <span>Traffic-Based Vehicle Emission Analysis System</span>
              </div>
              <div>
                <span>Chokkenahalli Toll Plaza, NH-48 (Km 61+500), Kyathsandra, Tumakuru, Karnataka</span>
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500">
                Data: Published FY2026 AADT (up to Oct 2025) • 30-Day counts derived
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <TrafficProvider>
        <DashboardLayout />
      </TrafficProvider>
    </ThemeProvider>
  );
}
