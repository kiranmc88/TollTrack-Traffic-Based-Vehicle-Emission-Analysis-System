import { DEFAULT_EMISSION_FACTORS, validateEmissionFactors } from './src/data/emissionFactors.js';
import { calculateEmissions, calculateDistanceComparison } from './src/utils/emissionCalculator.js';
import { validateTrafficData } from './src/utils/dataValidator.js';
import fs from 'fs';

console.log('--- TOLLTRACK CALCULATION ENGINE TEST ---');

// 1. Read CSV
const rawCsv = fs.readFileSync('./public/data/chokkenahalli_traffic.csv', 'utf8');
const lines = rawCsv.trim().split('\n');
const headers = lines[0].split(',');
const rows = lines.slice(1).map(line => {
  const values = line.split(',');
  const obj = {};
  headers.forEach((h, i) => obj[h.trim()] = values[i].trim());
  return obj;
});

const validated = validateTrafficData(rows);
console.log('1. Validation Check:');
console.log('   - Is Valid:', validated.isValid);
console.log('   - Records:', validated.data.length);
console.log('   - Errors:', validated.errors);
console.log('   - Warnings:', validated.warnings);

// 2. Emission Factors Validation
const factorCheck = validateEmissionFactors(DEFAULT_EMISSION_FACTORS);
console.log('2. Emission Factors Check:');
console.log('   - Factors Valid:', factorCheck.isValid);
console.log('   - Reason:', factorCheck.reason);

// 3. Daily Emissions at 50 km
const dailyResult = calculateEmissions(validated.data, DEFAULT_EMISSION_FACTORS, 50, 'daily');
console.log('3. Daily Calculations (50 km):');
console.log('   - Total Vehicles:', dailyResult.totals.vehicleCount, '(Expected: 37277)');
console.log('   - Total VKT:', dailyResult.totals.vehicleKm, 'km (Expected: 1863850)');
console.log('   - Total CO2:', dailyResult.totals.co2Tonnes.toFixed(2), 'Tonnes (~', Math.round(dailyResult.totals.co2Kg), 'kg )');
console.log('   - Total NOx:', dailyResult.totals.noxKg.toFixed(2), 'kg (~', Math.round(dailyResult.totals.noxGrams), 'g )');
console.log('   - Annual Trees Required:', Math.round(dailyResult.totals.treesNeededAnnual));

// 4. Monthly Derived at 50 km
const monthlyResult = calculateEmissions(validated.data, DEFAULT_EMISSION_FACTORS, 50, 'monthly');
console.log('4. Derived 30-Day Calculations (50 km):');
console.log('   - Total Vehicles:', monthlyResult.totals.vehicleCount, '(Expected: 1118310)');
console.log('   - Total CO2:', monthlyResult.totals.co2Tonnes.toFixed(2), 'Tonnes');
console.log('   - Total NOx:', monthlyResult.totals.noxKg.toFixed(2), 'kg');

// 5. Multi-Distance Comparison
const comparisons = calculateDistanceComparison(validated.data, DEFAULT_EMISSION_FACTORS, 'daily');
console.log('5. Distance Sensitivity Comparison:');
comparisons.forEach(c => {
  console.log(`   - ${c.label.padEnd(8)}: VKT = ${c.vehicleKm.toLocaleString()} km, CO2 = ${c.co2Tonnes.toFixed(2)} t, NOx = ${c.noxKg.toFixed(2)} kg`);
});

console.log('--- ALL CALCULATION ENGINE TESTS PASSED ---');
