import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  loadDefaultTrafficCsv,
  downloadTrafficCsv,
  downloadEmissionReportCsv,
  downloadOriginalDataset,
  downloadProcessedDataset,
  STORAGE_KEY_TRAFFIC_DATA,
  STORAGE_KEY_FACTORS,
} from '../utils/csvLoader';

import {
  DEFAULT_EMISSION_FACTORS,
  BS6_OPTIMISTIC_FACTORS,
  PRE_BS4_LEGACY_FACTORS,
  EMISSION_FACTOR_PRESETS,
  validateEmissionFactors,
} from '../data/emissionFactors';
import {
  calculateEmissions,
  calculateDistanceComparison,
} from '../utils/emissionCalculator';

const TrafficContext = createContext(null);

export function TrafficProvider({ children }) {
  const [trafficData, setTrafficData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [emissionFactors, setEmissionFactors] = useState(DEFAULT_EMISSION_FACTORS);
  const [activePreset, setActivePreset] = useState('ARAI_CPCB_STANDARD');
  const [distanceKm, setDistanceKm] = useState(50);
  const [countType, setCountType] = useState('daily'); // 'daily' or 'monthly'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [isCustomDataActive, setIsCustomDataActive] = useState(false);

  // Initialize: Load CSV dynamically
  useEffect(() => {
    async function initData() {
      setIsLoading(true);
      setError(null);

      // Check if user had stored custom data
      const storedTraffic = localStorage.getItem(STORAGE_KEY_TRAFFIC_DATA);
      const storedFactors = localStorage.getItem(STORAGE_KEY_FACTORS);

      // Load original CSV first
      const defaultRes = await loadDefaultTrafficCsv();
      if (!defaultRes.success) {
        setError(defaultRes.error || 'Failed to load traffic CSV.');
        setIsLoading(false);
        return;
      }

      setOriginalData(defaultRes.data);

      if (storedTraffic) {
        try {
          const parsed = JSON.parse(storedTraffic);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTrafficData(parsed);
            setIsCustomDataActive(true);
          } else {
            setTrafficData(defaultRes.data);
          }
        } catch {
          setTrafficData(defaultRes.data);
        }
      } else {
        setTrafficData(defaultRes.data);
      }

      if (storedFactors) {
        try {
          const parsedFactors = JSON.parse(storedFactors);
          if (Array.isArray(parsedFactors) && parsedFactors.length > 0) {
            setEmissionFactors(parsedFactors);
            setActivePreset('CUSTOM');
          }
        } catch {
          // fallback to default
        }
      }

      if (defaultRes.warnings) {
        setWarnings(defaultRes.warnings);
      }

      setIsLoading(false);
    }

    initData();
  }, []);

  // Validate emission factors
  const factorValidation = useMemo(() => {
    return validateEmissionFactors(emissionFactors);
  }, [emissionFactors]);

  // Recalculate emissions dynamically whenever trafficData, emissionFactors, distanceKm, or countType change
  const emissions = useMemo(() => {
    return calculateEmissions(trafficData, emissionFactors, distanceKm, countType);
  }, [trafficData, emissionFactors, distanceKm, countType]);

  // Distance comparison matrix
  const distanceComparison = useMemo(() => {
    return calculateDistanceComparison(trafficData, emissionFactors, countType, distanceKm);
  }, [trafficData, emissionFactors, countType, distanceKm]);

  // Handlers
  const handleSetDistance = (dist) => {
    const num = Math.max(1, Math.min(1000, Number(dist) || 1));
    setDistanceKm(num);
  };

  const handleSetCountType = (type) => {
    if (type === 'daily' || type === 'monthly') {
      setCountType(type);
    }
  };

  const handleApplyPreset = (presetKey) => {
    setActivePreset(presetKey);
    let newFactors = DEFAULT_EMISSION_FACTORS;

    if (presetKey === 'BS6_OPTIMISTIC') {
      newFactors = BS6_OPTIMISTIC_FACTORS;
    } else if (presetKey === 'PRE_BS4_LEGACY') {
      newFactors = PRE_BS4_LEGACY_FACTORS;
    } else if (presetKey === 'ARAI_CPCB_STANDARD') {
      newFactors = DEFAULT_EMISSION_FACTORS;
    }

    setEmissionFactors(newFactors);
    localStorage.removeItem(STORAGE_KEY_FACTORS);
  };

  const handleUpdateFactor = (categoryCode, field, value) => {
    setEmissionFactors((prev) => {
      const updated = prev.map((item) => {
        if (item.category_code === categoryCode || item.category === categoryCode) {
          const parsedVal = field === 'co2_factor' || field === 'nox_factor' ? Number(value) : value;
          return {
            ...item,
            [field]: parsedVal,
            verification_status: field === 'co2_factor' || field === 'nox_factor' ? 'custom' : item.verification_status,
          };
        }
        return item;
      });
      localStorage.setItem(STORAGE_KEY_FACTORS, JSON.stringify(updated));
      return updated;
    });
    setActivePreset('CUSTOM');
  };

  const handleResetFactors = () => {
    setEmissionFactors(DEFAULT_EMISSION_FACTORS);
    setActivePreset('ARAI_CPCB_STANDARD');
    localStorage.removeItem(STORAGE_KEY_FACTORS);
  };

  const handleUploadData = (validatedData) => {
    setTrafficData(validatedData);
    setIsCustomDataActive(true);
    localStorage.setItem(STORAGE_KEY_TRAFFIC_DATA, JSON.stringify(validatedData));
  };

  const handleResetTrafficData = () => {
    setTrafficData(originalData);
    setIsCustomDataActive(false);
    localStorage.removeItem(STORAGE_KEY_TRAFFIC_DATA);
  };

  const handleExportCsv = () => {
    downloadTrafficCsv(trafficData, isCustomDataActive ? 'chokkenahalli_traffic_custom.csv' : 'chokkenahalli_traffic_original.csv');
  };

  const handleDownloadOriginal = () => {
    downloadOriginalDataset(originalData.length ? originalData : trafficData);
  };

  const handleDownloadProcessed = () => {
    downloadProcessedDataset(trafficData, emissionFactors);
  };

  const handleExportEmissionReport = () => {
    downloadEmissionReportCsv(emissions.categories, emissions.totals, distanceKm, countType);
  };

  const value = {
    trafficData,
    originalData,
    emissionFactors,
    activePreset,
    presets: EMISSION_FACTOR_PRESETS,
    distanceKm,
    countType,
    isLoading,
    error,
    warnings,
    isCustomDataActive,
    factorValidation,
    emissions,
    distanceComparison,
    // Actions
    setDistance: handleSetDistance,
    setCountType: handleSetCountType,
    applyPreset: handleApplyPreset,
    updateFactor: handleUpdateFactor,
    resetFactors: handleResetFactors,
    uploadData: handleUploadData,
    resetTrafficData: handleResetTrafficData,
    exportCsv: handleExportCsv,
    downloadOriginal: handleDownloadOriginal,
    downloadProcessed: handleDownloadProcessed,
    exportEmissionReport: handleExportEmissionReport,
  };


  return (
    <TrafficContext.Provider value={value}>
      {children}
    </TrafficContext.Provider>
  );
}

export function useTraffic() {
  const context = useContext(TrafficContext);
  if (!context) {
    throw new Error('useTraffic must be used within a TrafficProvider');
  }
  return context;
}
