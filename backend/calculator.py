"""
Emission Calculation Module for TollTrack AI Detection
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
        'emission_standard': 'BS-IV / BS-VI Heavy Duty',
        'source': 'India GHG Program & CPCB Freight Database',
        'publication_year': 2021,
        'pcu_factor': 3.0,
    },
    '3-Axle Truck': {
        'co2_factor': 0.950,
        'co2_unit': 'kg/km',
        'nox_factor': 7.80,
        'nox_unit': 'g/km',
        'fuel_type': 'Diesel',
        'emission_standard': 'BS-IV / BS-VI Heavy Duty',
        'source': 'ARAI / Shakti Foundation Freight Corridor Emission Study',
        'publication_year': 2021,
        'pcu_factor': 3.0,
    },
    'Multi-Axle Vehicle / OSV': {
        'co2_factor': 1.250,
        'co2_unit': 'kg/km',
        'nox_factor': 10.50,
        'nox_unit': 'g/km',
        'fuel_type': 'Diesel',
        'emission_standard': 'BS-IV / BS-VI Heavy Multi-Axle',
        'source': 'NITI Aayog / CPCB National Freight Study',
        'publication_year': 2021,
        'pcu_factor': 4.5,
    },
    'Motorcycle / 2-Wheeler': {
        'co2_factor': 0.032,
        'co2_unit': 'kg/km',
        'nox_factor': 0.15,
        'nox_unit': 'g/km',
        'fuel_type': 'Petrol',
        'emission_standard': 'BS-IV / BS-VI Two-Wheeler',
        'source': 'ARAI / CPCB Two-Wheeler Emission Database',
        'publication_year': 2021,
        'pcu_factor': 0.5,
    }
}

DEFAULT_DISTANCE_KM = 50.0
TREE_OFFSET_ANNUAL_KG = 21.77  # 1 mature tree absorbs ~21.77 kg CO2 / year
DIESEL_CO2_PER_LITER_KG = 2.68 # 1 liter diesel combustion = ~2.68 kg CO2


def calculate_ai_emissions(category_counts: dict, distance_km: float = DEFAULT_DISTANCE_KM) -> dict:
    """
    Computes emission values for detected vehicle counts.
    Input: category_counts = { 'Car / Jeep / Van': 5, '2-Axle Truck': 2, ... }
    Returns comprehensive emission breakdown and totals.
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

    category_details = []

    # First pass: calculate absolute values
    for category, factor_info in EMISSION_FACTORS.items():
        count = int(category_counts.get(category, 0))
        vkt = count * dist
        co2_kg = vkt * factor_info['co2_factor']
        co2_tonnes = co2_kg / 1000.0
        nox_grams = vkt * factor_info['nox_factor']
        nox_kg = nox_grams / 1000.0
        pcu = count * factor_info['pcu_factor']

        total_vehicles += count
        total_vkt += vkt
        total_co2_kg += co2_kg
        total_nox_kg += nox_kg
        total_pcu += pcu

        category_details.append({
            'category': category,
            'count': count,
            'distanceKm': dist,
            'vkt': round(vkt, 2),
            'co2Factor': factor_info['co2_factor'],
            'co2Unit': factor_info['co2_unit'],
            'noxFactor': factor_info['nox_factor'],
            'noxUnit': factor_info['nox_unit'],
            'fuelType': factor_info['fuel_type'],
            'emissionStandard': factor_info['emission_standard'],
            'source': factor_info['source'],
            'publicationYear': factor_info['publication_year'],
            'co2Kg': round(co2_kg, 3),
            'co2Tonnes': round(co2_tonnes, 4),
            'noxGrams': round(nox_grams, 2),
            'noxKg': round(nox_kg, 4),
            'pcuFactor': factor_info['pcu_factor'],
            'totalPcu': round(pcu, 2),
            'trafficShare': 0.0,
            'co2Share': 0.0,
            'noxShare': 0.0,
        })

    # Second pass: calculate percentage shares
    for item in category_details:
        if total_vehicles > 0:
            item['trafficShare'] = round((item['count'] / total_vehicles) * 100.0, 2)
        if total_co2_kg > 0:
            item['co2Share'] = round((item['co2Kg'] / total_co2_kg) * 100.0, 2)
        if total_nox_kg > 0:
            item['noxShare'] = round((item['noxKg'] / total_nox_kg) * 100.0, 2)

    total_co2_tonnes = total_co2_kg / 1000.0
    trees_needed = total_co2_kg / TREE_OFFSET_ANNUAL_KG if total_co2_kg > 0 else 0
    diesel_equiv_liters = total_co2_kg / DIESEL_CO2_PER_LITER_KG if total_co2_kg > 0 else 0

    return {
        'assumedDistanceKm': dist,
        'totals': {
            'vehicleCount': total_vehicles,
            'vehicleKm': round(total_vkt, 2),
            'co2Kg': round(total_co2_kg, 3),
            'co2Tonnes': round(total_co2_tonnes, 4),
            'noxKg': round(total_nox_kg, 4),
            'noxGrams': round(total_nox_kg * 1000.0, 2),
            'totalPcu': round(total_pcu, 2),
            'treesNeeded': round(trees_needed, 1),
            'dieselEquivLiters': round(diesel_equiv_liters, 1),
        },
        'categories': category_details,
        'activeCategoriesOnly': [c for c in category_details if c['count'] > 0]
    }
