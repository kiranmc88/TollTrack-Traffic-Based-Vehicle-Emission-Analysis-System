import Papa from 'papaparse';
import { validateTrafficData } from './dataValidator';

export const CSV_FILE_PATH = '/data/chokkenahalli_traffic.csv';
export const STORAGE_KEY_TRAFFIC_DATA = 'tolltrack_custom_traffic_data';
export const STORAGE_KEY_FACTORS = 'tolltrack_custom_emission_factors';

/**
 * Loads the original traffic CSV file dynamically
 * @returns {Promise<{success: boolean, data: Array, metadata: Object, error?: string}>}
 */
export async function loadDefaultTrafficCsv() {
  try {
    const response = await fetch(CSV_FILE_PATH);
    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: Failed to fetch ${CSV_FILE_PATH}`);
    }

    const csvText = await response.text();
    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          const validation = validateTrafficData(results.data);
          if (!validation.isValid) {
            resolve({
              success: false,
              data: [],
              errors: validation.errors,
              warnings: validation.warnings,
              error: 'CSV validation failed',
            });
            return;
          }

          resolve({
            success: true,
            data: validation.data,
            warnings: validation.warnings,
            metadata: {
              source: 'Chokkenahalli Toll Plaza, NH-48 (Km 61+500), Kyathsandra, Tumakuru',
              reportingPeriod: 'Published FY2026 Average Daily Traffic up to October 2025',
              recordCount: validation.data.length,
              isOriginal: true,
            }
          });
        },
        error: (err) => {
          resolve({
            success: false,
            data: [],
            error: err.message || 'CSV Parsing Error',
          });
        }
      });
    });
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error.message || 'Failed to load traffic CSV',
    };
  }
}

/**
 * Parse an uploaded CSV file
 * @param {File} file 
 * @returns {Promise<{success: boolean, data: Array, errors: Array, warnings: Array}>}
 */
export function parseUploadedCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validation = validateTrafficData(results.data);
        resolve(validation);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

/**
 * Download original raw traffic dataset
 */
export function downloadOriginalDataset(data) {
  const originalRows = (data || []).map(row => ({
    category: row.category,
    daily_count: row.daily_count,
    estimated_30day_count: row.estimated_30day_count,
    category_code: row.category_code,
    description: row.description,
    pcu_factor: row.pcu_factor,
  }));

  const csvString = Papa.unparse(originalRows);
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'chokkenahalli_traffic_original.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download processed traffic dataset with enriched metadata and emission factors
 */
export function downloadProcessedDataset(trafficData, emissionFactors) {
  const factorMap = new Map();
  (emissionFactors || []).forEach(f => {
    factorMap.set(f.category, f);
    if (f.category_code) factorMap.set(f.category_code, f);
  });

  const processedRows = (trafficData || []).map(row => {
    const factor = factorMap.get(row.category) || factorMap.get(row.category_code) || {};
    return {
      'Toll Plaza Name': 'Chokkenahalli Toll Plaza',
      'State': 'Karnataka',
      'Highway': 'NH-48 (Km 61+500, Nelamangala-Tumakuru)',
      'Vehicle Category': row.category,
      'Classification Code': row.category_code,
      'Daily AADT (Actual)': row.daily_count,
      'Estimated 30-Day Count (Derived)': row.estimated_30day_count,
      'PCU Multiplier (IRC)': row.pcu_factor,
      'CO2 Emission Factor (kg/km)': factor.co2_factor ?? 0,
      'NOx Emission Factor (g/km)': factor.nox_factor ?? 0,
      'Fuel Assumption': factor.fuel_assumptions || factor.fuel_type || 'Diesel/Petrol',
      'Emission Standard': factor.emission_standard || 'BS-IV / BS-VI Mix',
      'Factor Source': factor.source || 'ARAI / CPCB',
      'Factor Verification Status': factor.verification_status || 'verified',
      'Data Retrieval Date': 'November 2026',
      'Reporting Period': 'Published FY2026 Baseline up to October 2025',
    };
  });

  const csvString = Papa.unparse(processedRows);
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'chokkenahalli_traffic_processed_dataset.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download traffic dataset as CSV (generic)
 * @param {Array} data - Array of vehicle traffic data
 * @param {string} filename - Filename for download
 */
export function downloadTrafficCsv(data, filename = 'chokkenahalli_traffic_export.csv') {
  if (!data || !data.length) return;

  const exportRows = data.map(row => ({
    category: row.category,
    daily_count: row.daily_count,
    estimated_30day_count: row.estimated_30day_count,
    category_code: row.category_code,
    description: row.description,
    pcu_factor: row.pcu_factor,
  }));

  const csvString = Papa.unparse(exportRows);
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


/**
 * Download emission report as CSV
 */
export function downloadEmissionReportCsv(categories, totals, distanceKm, countType) {
  if (!categories || !categories.length) return;

  const rows = categories.map(c => ({
    'Vehicle Category': c.category,
    'Study Period': countType === 'monthly' ? 'Estimated 30-Day (Derived)' : 'Daily Average (AADT)',
    'Vehicle Count': c.activeCount,
    'Distance (km)': distanceKm,
    'Vehicle Kilometres (VKT)': c.vkt,
    'Traffic Share (%)': c.trafficShare.toFixed(2),
    'CO2 Factor (kg/km)': c.co2Factor,
    'CO2 Emissions (kg)': c.co2Kg.toFixed(2),
    'CO2 Emissions (Tonnes)': c.co2Tonnes.toFixed(4),
    'CO2 Share (%)': c.co2Share.toFixed(2),
    'NOx Factor (g/km)': c.noxFactor,
    'NOx Emissions (kg)': c.noxKg.toFixed(4),
    'NOx Share (%)': c.noxShare.toFixed(2),
    'Factor Standard': c.emissionStandard,
    'Factor Source': c.factorSource,
  }));

  // Append summary row
  rows.push({
    'Vehicle Category': 'TOTAL / SUMMARY',
    'Study Period': countType === 'monthly' ? 'Estimated 30-Day (Derived)' : 'Daily Average (AADT)',
    'Vehicle Count': totals.vehicleCount,
    'Distance (km)': distanceKm,
    'Vehicle Kilometres (VKT)': totals.vehicleKm,
    'Traffic Share (%)': '100.00',
    'CO2 Factor (kg/km)': '-',
    'CO2 Emissions (kg)': totals.co2Kg.toFixed(2),
    'CO2 Emissions (Tonnes)': totals.co2Tonnes.toFixed(4),
    'CO2 Share (%)': '100.00',
    'NOx Factor (g/km)': '-',
    'NOx Emissions (kg)': totals.noxKg.toFixed(4),
    'NOx Share (%)': '100.00',
    'Factor Standard': '-',
    'Factor Source': '-',
  });

  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `tolltrack_emission_report_${distanceKm}km_${countType}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
