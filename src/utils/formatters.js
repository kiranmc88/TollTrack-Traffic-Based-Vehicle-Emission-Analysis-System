/**
 * Formatting utilities for numbers, emissions, and units
 */

export function formatNumber(val, decimals = 0) {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return Number(val).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatEmissions(kgVal, preferredUnit = 'auto') {
  if (kgVal === null || kgVal === undefined || isNaN(kgVal)) return { value: '0', unit: 'kg' };

  const num = Number(kgVal);

  if (preferredUnit === 'tonnes' || (preferredUnit === 'auto' && num >= 1000)) {
    return {
      value: (num / 1000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      unit: 'Tonnes (t)',
      rawTonnes: num / 1000,
      rawKg: num,
    };
  }

  return {
    value: num.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    unit: 'kg',
    rawTonnes: num / 1000,
    rawKg: num,
  };
}

export function formatNox(kgVal) {
  if (kgVal === null || kgVal === undefined || isNaN(kgVal)) return { value: '0', unit: 'kg' };
  const num = Number(kgVal);
  if (num < 1 && num > 0) {
    return {
      value: (num * 1000).toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
      unit: 'grams (g)',
      rawKg: num,
    };
  }
  return {
    value: num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    unit: 'kg',
    rawKg: num,
  };
}

export function formatPercent(val, decimals = 1) {
  if (val === null || val === undefined || isNaN(val)) return '0.0%';
  return `${Number(val).toFixed(decimals)}%`;
}
