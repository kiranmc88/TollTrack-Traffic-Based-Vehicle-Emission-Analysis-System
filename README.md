# TollTrack – Traffic-Based Vehicle Emission Analysis System

**TollTrack** is a modern, responsive web application for environmental assessment and vehicle emission quantification developed for **Chokkenahalli Toll Plaza, NH-48 (Km 61+500), Kyathsandra, Tumakuru, Karnataka**.

---

## 🚀 Live Application

- **Development Server:** `http://127.0.0.1:5173/`
- **Build Output:** Optimized production bundle in `dist/`

---

## 📌 Project Overview & Objectives

Develop a traffic-based vehicle emission estimation system using vehicle category-wise traffic data from Chokkenahalli Toll Plaza on NH-48 (Bengaluru–Tumakuru section):
- **Location:** Chokkenahalli Toll Plaza, Km 61+500, NH-48, Kyathsandra, Tumakuru District, Karnataka
- **Traffic Dataset:** Published FY2026 Average Daily Traffic (AADT) up to October 2025 (~37,277 vehicles/day)
- **Derived Estimates:** 30-day counts derived via mathematical projection (`AADT × 30` = ~1,118,310 vehicles)
- **Scientific Emission Standards:** Verified on-road emission factors from the **Automotive Research Association of India (ARAI)**, **Central Pollution Control Board (CPCB)**, and the **India GHG Program (WRI/CII/TERI)**.

---

## 🛠️ Tech Stack

- **Framework:** React.js 19 with Vite 8
- **Styling:** Tailwind CSS v4 with custom design tokens & glassmorphism
- **Visualizations:** Recharts (Bar Charts, Donut/Pie Charts, Multi-Line Sensitivity Curves)
- **Icons:** Lucide React
- **CSV Processing:** PapaParse (Dynamic streaming parse, schema validation, export)
- **State Management:** React Context API with persistent localStorage caching

---

## 📂 Project Architecture

```
d:/5th sem/EVS/abl2/
├── public/
│   └── data/
│       └── chokkenahalli_traffic.csv   # Authentic NHAI FY2026 traffic data
├── src/
│   ├── components/
│   │   ├── Navbar.jsx                  # Top navigation, period switcher, theme toggle
│   │   ├── Sidebar.jsx                 # Collapsible module sidebar
│   │   ├── KPICard.jsx                 # Metric cards with glowing status indicators
│   │   ├── DistanceControl.jsx         # Interactive distance simulator & presets
│   │   ├── NoticeBanner.jsx            # Derived 30-day & data lineage disclaimer
│   │   └── ScientificBadge.jsx         # ARAI/CPCB verification status badges
│   ├── pages/
│   │   ├── OverviewDashboard.jsx       # Primary KPIs, charts & category summaries
│   │   ├── TrafficAnalysis.jsx         # Category traffic counts, PCU & shares
│   │   ├── DistanceSimulator.jsx       # Dynamic VKT & trajectory sensitivity
│   │   ├── CO2Analysis.jsx             # Category CO2, tree offsets & fuel equiv.
│   │   ├── NOxAnalysis.jsx             # Category NOx, smog & health impact
│   │   ├── ComparisonAnalysis.jsx      # Multi-distance comparison (10-100 km)
│   │   ├── DataManagement.jsx          # CSV upload/download, 1-click restore, factors
│   │   └── Methodology.jsx             # Location, formulas, standards & limitations
│   ├── data/
│   │   └── emissionFactors.js          # Configurable scientific emission factors
│   ├── utils/
│   │   ├── csvLoader.js                # Dynamic fetch, parser & report exporter
│   │   ├── emissionCalculator.js       # VKT, CO2, NOx, and distance matrix formulas
│   │   ├── dataValidator.js            # CSV schema, category and numeric checks
│   │   └── formatters.js               # Number, unit (kg/t), and percentage formatting
│   ├── context/
│   │   ├── TrafficContext.jsx          # Reactive central traffic & emission state
│   │   └── ThemeContext.jsx            # Dark mode / Light mode controller
│   ├── hooks/
│   │   └── useTrafficData.js           # Re-exported custom hook
│   ├── App.jsx                         # Main application layout
│   ├── main.jsx                        # React root entry
│   └── index.css                       # Modern Tailwind design system
├── test-calculations.js                # Automated verification script
└── package.json
```

---

## 🔬 Scientific Calculation Formulations

1. **Vehicle Kilometres Traveled (VKT):**
   $$\text{VKT} = \text{Vehicle Count} \times \text{Assumed Distance (km)}$$
2. **CO2 Emissions:**
   $$\text{CO}_2 \text{ (kg)} = \text{VKT} \times \text{EF}_{\text{CO}_2} \text{ (kg/km)}$$
   $$\text{CO}_2 \text{ (Tonnes)} = \frac{\text{CO}_2 \text{ (kg)}}{1,000}$$
3. **NOx Emissions:**
   $$\text{NO}_x \text{ (kg)} = \frac{\text{VKT} \times \text{EF}_{\text{NO}_x} \text{ (g/km)}}{1,000}$$

---

## 📊 Summary of Baseline Calculations (At 50 km Default)

| Vehicle Category | Daily Count (AADT) | 30-Day Derived | Traffic Share | VKT (50 km) | CO2 (Tonnes) | NOx (kg) |
|---|---|---|---|---|---|---|
| **Car / Jeep / Van** | 21,680 | 650,400 | 58.16% | 1,084,000 km | 160.43 t | 303.52 kg |
| **Mini LCV** | 4,617 | 138,510 | 12.39% | 230,850 km | 45.02 t | 173.14 kg |
| **LCV** | 909 | 27,270 | 2.44% | 45,450 km | 17.27 t | 95.45 kg |
| **Bus** | 1,842 | 55,260 | 4.94% | 92,100 km | 72.76 t | 571.02 kg |
| **2-Axle Truck** | 3,214 | 96,420 | 8.62% | 160,700 km | 109.28 t | 867.78 kg |
| **3-Axle Truck** | 2,165 | 64,950 | 5.81% | 108,250 km | 102.84 t | 844.35 kg |
| **Multi-Axle / OSV** | 2,850 | 85,500 | 7.65% | 142,500 km | 178.13 t | 1,496.25 kg |
| **TOTAL** | **37,277** | **1,118,310** | **100.0%** | **1,863,850 km** | **685.72 t** | **4,351.50 kg** |

---

## ⚡ Running & Testing

- Start development server:
  ```bash
  npm run dev
  ```
- Run automated calculation verification:
  ```bash
  node test-calculations.js
  ```
- Build production bundle:
  ```bash
  npm run build
  ```
