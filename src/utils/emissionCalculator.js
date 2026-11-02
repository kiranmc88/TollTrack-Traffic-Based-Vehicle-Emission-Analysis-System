/**
 * Emission Calculator Utility for TollTrack
 * 
 * Implements scientific calculation models:
 * 1. Vehicle Kilometres (VKT) = Vehicle Count × Assumed Distance (km)
 * 2. CO2 (kg) = VKT × CO2 Emission Factor (kg/km)
 * 3. NOx (kg) = VKT × NOx Emission Factor (g/km) / 1000
 */

/**
 * Calculate emission results for all categories
 * @param {Array} trafficData - Array of vehicle traffic objects
 * @param {Array} emissionFactors - Array of emission factor definitions
 * @param {number} distanceKm - Assumed travel distance in km
 * @param {string} countType - 'daily' | 'monthly' (30-day derived)
 * @returns {Object} Comprehensive calculation results
 */
export function calculateEmissions(trafficData, emissionFactors, distanceKm = 50, countType = 'daily') {
  if (!trafficData || !trafficData.length || !emissionFactors || !emissionFactors.length) {
    return {
      categories: [],
      totals: {
        vehicleCount: 0,
        vehicleKm: 0,
        co2Kg: 0,
        co2Tonnes: 0,
        noxKg: 0,
        noxGrams: 0,
      },
      summaryByFuel: {},
      isValid: false,
    };
  }

  const factorMap = new Map();
  emissionFactors.forEach(factor => {
    factorMap.set(factor.category, factor);
    if (factor.category_code) factorMap.set(factor.category_code, factor);
  });

  let totalVehicles = 0;
  let totalVkt = 0;
  let totalCo2Kg = 0;
  let totalNoxKg = 0;

  const categoryResults = trafficData.map(item => {
    const factor = factorMap.get(item.category) || factorMap.get(item.category_code) || {
      co2_factor: 0,
      nox_factor: 0,
      verification_status: 'pending_verification',
      source: 'Unknown',
      emission_standard: 'N/A'
    };

    const count = countType === 'monthly' ? Number(item.estimated_30day_count || 0) : Number(item.daily_count || 0);
    const vkt = count * Number(distanceKm);
    
    // Formula: CO2 (kg) = Vehicle Kilometres × CO2 factor (kg/km)
    const co2Kg = vkt * (factor.co2_factor || 0);
    const co2Tonnes = co2Kg / 1000;

    // Formula: NOx (kg) = Vehicle Kilometres × NOx factor (g/km) / 1000
    const noxGrams = vkt * (factor.nox_factor || 0);
    const noxKg = noxGrams / 1000;

    totalVehicles += count;
    totalVkt += vkt;
    totalCo2Kg += co2Kg;
    totalNoxKg += noxKg;

    return {
      category: item.category,
      category_code: item.category_code || item.category,
      daily_count: Number(item.daily_count || 0),
      estimated_30day_count: Number(item.estimated_30day_count || 0),
      activeCount: count,
      distanceKm: Number(distanceKm),
      vkt,
      pcu_factor: Number(item.pcu_factor || 1.0),
      totalPcu: count * Number(item.pcu_factor || 1.0),
      // Emission factors applied
      co2Factor: factor.co2_factor || 0,
      noxFactor: factor.nox_factor || 0,
      co2Unit: factor.co2_unit || 'kg/km',
      noxUnit: factor.nox_unit || 'g/km',
      verification_status: factor.verification_status || 'pending_verification',
      factorSource: factor.source || 'N/A',
      emissionStandard: factor.emission_standard || 'N/A',
      fuelType: factor.fuel_type || 'N/A',
      // Calculated outputs
      co2Kg,
      co2Tonnes,
      noxKg,
      noxGrams,
      // Percentage contributions (will be computed below once totals are aggregated)
      trafficShare: 0,
      co2Share: 0,
      noxShare: 0,
    };
  });

  // Calculate percentages
  categoryResults.forEach(cat => {
    cat.trafficShare = totalVehicles > 0 ? (cat.activeCount / totalVehicles) * 100 : 0;
    cat.co2Share = totalCo2Kg > 0 ? (cat.co2Kg / totalCo2Kg) * 100 : 0;
    cat.noxShare = totalNoxKg > 0 ? (cat.noxKg / totalNoxKg) * 100 : 0;
  });

  // Environmental context metrics:
  // 1 mature urban tree absorbs ~21.77 kg of CO2 per year (~0.0596 kg/day)
  // For daily analysis: trees needed to offset daily emissions for 1 year = co2Kg / 21.77
  const treesNeededAnnual = totalCo2Kg / 21.77;
  
  // Diesel fuel equivalence: ~2.68 kg CO2 per litre of diesel burned
  const dieselEquivalenceLitres = totalCo2Kg / 2.68;

  return {
    categories: categoryResults,
    totals: {
      vehicleCount: totalVehicles,
      vehicleKm: totalVkt,
      co2Kg: totalCo2Kg,
      co2Tonnes: totalCo2Kg / 1000,
      noxKg: totalNoxKg,
      noxGrams: totalNoxKg * 1000,
      treesNeededAnnual,
      dieselEquivalenceLitres,
    },
    distanceKm: Number(distanceKm),
    countType,
    isValid: true,
  };
}

/**
 * Calculate multi-distance comparison matrix
 * Distances: 10 km, 25 km, 50 km, 75 km, 100 km, and optional custom distance
 */
export function calculateDistanceComparison(trafficData, emissionFactors, countType = 'daily', customDistance = null) {
  const standardDistances = [10, 25, 50, 75, 100];
  const distances = customDistance && !standardDistances.includes(Number(customDistance)) && Number(customDistance) > 0
    ? [...standardDistances, Number(customDistance)].sort((a, b) => a - b)
    : standardDistances;

  return distances.map(dist => {
    const result = calculateEmissions(trafficData, emissionFactors, dist, countType);
    return {
      distance: dist,
      label: `${dist} km`,
      isCustom: dist === Number(customDistance) && !standardDistances.includes(dist),
      vehicleCount: result.totals.vehicleCount,
      vehicleKm: result.totals.vehicleKm,
      co2Kg: result.totals.co2Kg,
      co2Tonnes: result.totals.co2Tonnes,
      noxKg: result.totals.noxKg,
      treesNeeded: result.totals.treesNeededAnnual,
      categoryBreakdown: result.categories.map(c => ({
        category: c.category,
        co2Kg: c.co2Kg,
        co2Tonnes: c.co2Tonnes,
        noxKg: c.noxKg,
      })),
    };
  });
}
