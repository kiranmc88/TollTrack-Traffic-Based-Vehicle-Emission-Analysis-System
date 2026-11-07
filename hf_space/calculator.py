"""
Emission Calculation Module for TollTrack AI Detection (Hugging Face Space)
Uses verified ARAI / CPCB on-road emission factor registry.
Formulas:
  1. Vehicle Kilometres Traveled (VKT) = Vehicle Count × Assumed Distance (km)
  2. CO2 (kg) = VKT × CO2 Emission Factor (kg/km)
  3. CO2 (Tonnes) = CO2 (kg) / 1000
  4. NOx (kg) = VKT × NOx Emission Factor (g/km) / 1000
"""

# Official ARAI / CPCB Emission Factor Registry matching frontend
EMISSION_FACTORS = {
    'Car / Jeep / Van': {
        'co2_factor': 0.148,
        'co2_unit': 'kg/km',
        'nox_factor': 0.28,
        'nox_unit': 'g/km',
        'fuel_type': 'Mixed (65% Petrol, 35% Diesel)',
        'emission_standard': 'BS-IV / BS-VI Fleet Mix',
        'source': 'ARAI / Bureau of Energy Efficiency (BEE) & India GHG Program',
        'publication_year': 2021,
        'pcu_factor': 1.0,
    },
    'Mini LCV': {
        'co2_factor': 0.195,
        'co2_unit': 'kg/km',
        'nox_factor': 0.75,
        'nox_unit': 'g/km',
        'fuel_type': 'Diesel (High-Speed Diesel)',
        'emission_standard': 'BS-IV / BS-VI Mix',
        'source': 'ARAI / CPCB In-Use Commercial Vehicle Inventory',
        'publication_year': 2020,
        'pcu_factor': 1.5,
    },
    'LCV': {
        'co2_factor': 0.380,
        'co2_unit': 'kg/km',
        'nox_factor': 2.10,
        'nox_unit': 'g/km',
        'fuel_type': 'Diesel',
        'emission_standard': 'BS-IV / BS-VI Commercial',
        'source': 'India GHG Program & CPCB Heavy-Duty Inventory',
        'publication_year': 2020,
        'pcu_factor': 1.5,
    },
    'Bus': {
        'co2_factor': 0.790,
        'co2_unit': 'kg/km',
        'nox_factor': 6.20,
        'nox_unit': 'g/km',
        'fuel_type': 'Diesel (Commercial Fleet)',
        'emission_standard': 'BS-IV / BS-VI Heavy-Duty',
        'source': 'Shakti Sustainable Energy Foundation & CPCB Transit Emission Factors',
        'publication_year': 2021,
        'pcu_factor': 3.0,
    },
    '2-Axle Truck': {
        'co2_factor': 0.680,
        'co2_unit': 'kg/km',
        'nox_factor': 5.40,
        'nox_unit': 'g/km',
        'fuel_type': 'Diesel',
        'emission_standard': 'BS-IV / BS-VI Heavy Commercial',
        'source': 'CPCB / ARAI National Air Quality Management Studies',
        'publication_year': 2020,
        'pcu_factor': 3.0,
    },
    '3-Axle Truck': {
        'co2_factor': 0.950,
        'co2_unit': 'kg/km',
        'nox_factor': 7.80,
        'nox_unit': 'g/km',
        'fuel_type': 'Diesel',
        'emission_standard': 'BS-IV / BS-VI Multi-Axle Mix',
        'source': 'CPCB & Central Road Research Institute (CRRI)',
        'publication_year': 2020,
        'pcu_factor': 3.0,
    },
    'Multi-Axle Vehicle / OSV': {
        'co2_factor': 1.250,
        'co2_unit': 'kg/km',
        'nox_factor': 10.50,
        'nox_unit': 'g/km',
        'fuel_type': 'Diesel',
        'emission_standard': 'BS-IV Heavy Freight',
        'source': 'India GHG Program / Heavy Commercial Transport Guidelines',
        'publication_year': 2021,
        'pcu_factor': 4.0,
    },
    'Motorcycle / 2-Wheeler': {
        'co2_factor': 0.035,
        'co2_unit': 'kg/km',
        'nox_factor': 0.15,
        'nox_unit': 'g/km',
        'fuel_type': 'Petrol',
        'emission_standard': 'BS-IV / BS-VI 2-Wheeler',
        'source': 'ARAI Two-Wheeler Emission Benchmark Survey',
        'publication_year': 2021,
        'pcu_factor': 0.5,
    }
}

DEFAULT_DISTANCE_KM = 50.0


def calculate_ai_emissions(category_counts: dict, distance_km: float = DEFAULT_DISTANCE_KM) -> dict:
    """
    Computes scientific vehicle emissions given detected category counts and assumed travel distance.
    Returns structured results matching TollTrack standard data models.
    """
    try:
        dist = float(distance_km)
        if dist <= 0:
            dist = DEFAULT_DISTANCE_KM
    except (ValueError, TypeError):
        dist = DEFAULT_DISTANCE_KM

    total_vehicles = 0
    total_vkt = 0.0
    total_co2_kg = 0.0
    total_nox_kg = 0.0
    total_pcu = 0.0

    category_results = []

    for category, factors in EMISSION_FACTORS.items():
        count = int(category_counts.get(category, 0))
        vkt = count * dist
        co2_kg = vkt * factors['co2_factor']
        co2_tonnes = co2_kg / 1000.0
        nox_grams = vkt * factors['nox_factor']
        nox_kg = nox_grams / 1000.0
        pcu = count * factors['pcu_factor']

        total_vehicles += count
        total_vkt += vkt
        total_co2_kg += co2_kg
        total_nox_kg += nox_kg
        total_pcu += pcu

        category_results.append({
            'category': category,
            'count': count,
            'distanceKm': dist,
            'vkt': round(vkt, 2),
            'co2Factor': factors['co2_factor'],
            'co2Unit': factors['co2_unit'],
            'noxFactor': factors['nox_factor'],
            'noxUnit': factors['nox_unit'],
            'co2Kg': round(co2_kg, 4),
            'co2Tonnes': round(co2_tonnes, 6),
            'noxKg': round(nox_kg, 6),
            'noxGrams': round(nox_grams, 4),
            'pcuFactor': factors['pcu_factor'],
            'pcu': round(pcu, 2),
            'fuelType': factors['fuel_type'],
            'emissionStandard': factors['emission_standard'],
            'source': factors['source'],
            'publicationYear': factors['publication_year']
        })

    # Calculate percentage contributions
    for item in category_results:
        item['trafficShare'] = round((item['count'] / total_vehicles * 100), 2) if total_vehicles > 0 else 0.0
        item['co2Share'] = round((item['co2Kg'] / total_co2_kg * 100), 2) if total_co2_kg > 0 else 0.0
        item['noxShare'] = round((item['noxKg'] / total_nox_kg * 100), 2) if total_nox_kg > 0 else 0.0

    # Environmental equivalence metrics
    # Mature tree absorbs approx 21.77 kg CO2/year
    # 1 liter of diesel produces approx 2.68 kg CO2
    trees_needed = round(total_co2_kg / 21.77, 1)
    diesel_equiv_liters = round(total_co2_kg / 2.68, 1)

    return {
        'assumedDistanceKm': dist,
        'totals': {
            'vehicleCount': total_vehicles,
            'vehicleKm': round(total_vkt, 2),
            'co2Kg': round(total_co2_kg, 4),
            'co2Tonnes': round(total_co2_kg / 1000.0, 6),
            'noxKg': round(total_nox_kg, 6),
            'noxGrams': round(total_nox_kg * 1000.0, 4),
            'totalPcu': round(total_pcu, 2),
            'treesNeeded': trees_needed,
            'dieselEquivLiters': diesel_equiv_liters
        },
        'categories': category_results,
        'methodology': {
            'standard': 'ARAI / CPCB Emission Factor Model for Indian Vehicle Fleets',
            'vkt_formula': 'VKT = Detected Vehicle Count × Assumed Travel Distance (km)',
            'co2_formula': 'CO2 (kg) = VKT × ARAI CO2 Emission Factor (kg/km)',
            'nox_formula': 'NOx (kg) = VKT × CPCB NOx Emission Factor (g/km) / 1000',
            'disclaimer': 'Snapshot emission calculations reflect only vehicles detected in the supplied photograph.'
        }
    }

