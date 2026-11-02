/**
 * Data Validation Utility for TollTrack
 * Validates traffic dataset schema, data types, and required categories.
 */

export const REQUIRED_CATEGORIES = [
  'Car / Jeep / Van',
  'Mini LCV',
  'LCV',
  'Bus',
  '2-Axle Truck',
  '3-Axle Truck',
  'Multi-Axle Vehicle / OSV'
];

/**
 * Validate imported or edited traffic data
 * @param {Array} rows - Array of objects from CSV parsing
 * @returns {Object} Validation summary with status, errors, warnings, and sanitized data
 */
export function validateTrafficData(rows) {
  const errors = [];
  const warnings = [];
  const sanitized = [];

  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      isValid: false,
      errors: ['The CSV dataset is empty or could not be parsed.'],
      warnings: [],
      data: [],
    };
  }

  // Check column presence in first row
  const firstRow = rows[0];
  const keys = Object.keys(firstRow).map(k => k.trim().toLowerCase());
  
  const hasCategory = keys.includes('category') || keys.includes('vehicle_category') || keys.includes('type');
  const hasDailyCount = keys.includes('daily_count') || keys.includes('aadt') || keys.includes('count') || keys.includes('daily');

  if (!hasCategory) {
    errors.push("Missing required column: 'category' (vehicle class name).");
  }
  if (!hasDailyCount) {
    errors.push("Missing required column: 'daily_count' (Average Daily Traffic count).");
  }

  if (errors.length > 0) {
    return { isValid: false, errors, warnings, data: [] };
  }

  const foundCategories = new Set();

  rows.forEach((row, index) => {
    // Resolve column names flexibly
    const categoryRaw = row.category || row.Category || row.vehicle_category || row.type;
    const dailyRaw = row.daily_count ?? row.Daily_Count ?? row.aadt ?? row.count ?? row.daily;
    const monthlyRaw = row.estimated_30day_count ?? row.Estimated_30day_Count ?? row.monthly_count ?? row.monthly;
    const pcuRaw = row.pcu_factor ?? row.PCU_Factor ?? row.pcu;

    if (!categoryRaw || String(categoryRaw).trim() === '') {
      warnings.push(`Row ${index + 1}: Skipped row with empty category.`);
      return;
    }

    const category = String(categoryRaw).trim();
    foundCategories.add(category);

    const dailyCount = Number(dailyRaw);
    if (isNaN(dailyCount) || dailyCount < 0) {
      errors.push(`Row ${index + 1} (${category}): 'daily_count' must be a non-negative number. Received: "${dailyRaw}"`);
      return;
    }

    // Calculate or validate 30-day derived estimate
    let estimated30Day = Number(monthlyRaw);
    if (isNaN(estimated30Day) || estimated30Day <= 0) {
      estimated30Day = Math.round(dailyCount * 30);
    }

    // Validate PCU factor
    let pcuFactor = Number(pcuRaw);
    if (isNaN(pcuFactor) || pcuFactor <= 0) {
      pcuFactor = getDefaultPcu(category);
    }

    sanitized.push({
      category,
      category_code: row.category_code || getCategoryCode(category),
      daily_count: dailyCount,
      estimated_30day_count: estimated30Day,
      description: row.description || `${category} on NH-48`,
      pcu_factor: pcuFactor,
    });
  });

  // Check for required categories
  const missingCategories = REQUIRED_CATEGORIES.filter(cat => !foundCategories.has(cat));
  if (missingCategories.length > 0) {
    warnings.push(`Dataset is missing standard categories: ${missingCategories.join(', ')}.`);
  }

  const isValid = errors.length === 0 && sanitized.length > 0;

  return {
    isValid,
    errors,
    warnings,
    data: sanitized,
    totalRecords: sanitized.length,
    missingCategories,
  };
}

export function getDefaultPcu(category) {
  const cat = category.toLowerCase();
  if (cat.includes('car') || cat.includes('jeep') || cat.includes('van')) return 1.0;
  if (cat.includes('mini lcv')) return 1.4;
  if (cat.includes('lcv')) return 1.5;
  if (cat.includes('bus')) return 3.0;
  if (cat.includes('2-axle')) return 3.0;
  if (cat.includes('3-axle')) return 3.0;
  if (cat.includes('multi-axle') || cat.includes('osv')) return 4.5;
  return 1.0;
}

export function getCategoryCode(category) {
  const cat = category.toLowerCase();
  if (cat.includes('car')) return 'CAR';
  if (cat.includes('mini lcv')) return 'MINI_LCV';
  if (cat.includes('lcv')) return 'LCV';
  if (cat.includes('bus')) return 'BUS';
  if (cat.includes('2-axle')) return 'TRUCK_2AXLE';
  if (cat.includes('3-axle')) return 'TRUCK_3AXLE';
  if (cat.includes('multi-axle') || cat.includes('osv')) return 'MAV_OSV';
  return category.toUpperCase().replace(/[^A-Z0-9]/g, '_');
}
