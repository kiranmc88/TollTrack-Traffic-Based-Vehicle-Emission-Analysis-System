import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Download,
  Palette,
  Edit3,
  RefreshCw,
  Check,
  ChevronDown,
  Info,
  Sliders,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  Share2,
} from 'lucide-react';
import { formatNumber } from '../utils/formatters';

// -------------------------------------------------------------
// Constants & Geometry
// -------------------------------------------------------------
const SVG_WIDTH = 540;
const SVG_HEIGHT = 360;
const CX = SVG_WIDTH / 2;
const CY = SVG_HEIGHT / 2;
const OUTER_RADIUS = 125;
const INNER_RADIUS = 72;

// -------------------------------------------------------------
// Predefined Color Palettes
// -------------------------------------------------------------
const COLOR_PALETTES = {
  emerald: {
    name: 'Eco Emerald (Default)',
    colors: ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#f97316', '#ef4444', '#ec4899'],
  },
  amber: {
    name: 'Emission Warning (Amber/Flame)',
    colors: ['#f59e0b', '#f97316', '#ef4444', '#dc2626', '#b91c1c', '#ea580c', '#d97706', '#ca8a04'],
  },
  ocean: {
    name: 'Ocean Gradient (Blue/Teal)',
    colors: ['#0284c7', '#0ea5e9', '#38bdf8', '#06b6d4', '#14b8a6', '#10b981', '#6366f1', '#4f46e5'],
  },
  cyber: {
    name: 'Neon Cyber (Purple/Pink)',
    colors: ['#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#6366f1', '#3b82f6', '#06b6d4'],
  },
  slate: {
    name: 'Executive Slate (Monochrome)',
    colors: ['#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#1e293b', '#0f172a'],
  },
};

// -------------------------------------------------------------
// Realistic Pre-configured Demo Datasets
// -------------------------------------------------------------
const DEMO_DATASETS = {
  liveNox: {
    id: 'liveNox',
    name: 'NOx Contribution by Category (Current Live Context)',
    subtitle: 'Corridor emission quantification at Chokkenahalli Toll Plaza (ARAI/CPCB standards)',
    unit: 'kg NOx',
    macroGroupKey: 'macroGroup',
    data: [
      { name: '2-Axle Truck', value: 724.8, share: 21.2, macroGroup: 'Heavy Freight', subtext: 'ARAI factor: 6.10 g/km' },
      { name: '3-Axle Truck', value: 1042.4, share: 30.5, macroGroup: 'Heavy Freight', subtext: 'ARAI factor: 7.20 g/km' },
      { name: 'Multi-Axle Vehicle / OSV', value: 1218.6, share: 35.7, macroGroup: 'Heavy Freight', subtext: 'ARAI factor: 8.50 g/km' },
      { name: 'Bus', value: 248.5, share: 7.3, macroGroup: 'Commercial & Transit', subtext: 'ARAI factor: 5.80 g/km' },
      { name: 'LCV', value: 92.4, share: 2.7, macroGroup: 'Commercial & Transit', subtext: 'ARAI factor: 1.95 g/km' },
      { name: 'Mini LCV', value: 41.2, share: 1.2, macroGroup: 'Commercial & Transit', subtext: 'ARAI factor: 1.45 g/km' },
      { name: 'Car / Jeep / Van', value: 48.6, share: 1.4, macroGroup: 'Personal & Light', subtext: 'ARAI factor: 0.28 g/km' },
    ],
  },
  trafficVolume: {
    id: 'trafficVolume',
    name: 'NH-48 Traffic Volume Share (37,277 AADT)',
    subtitle: 'Published FY2026 Average Daily Traffic breakdown at Chokkenahalli Toll Plaza',
    unit: 'vehicles/day',
    macroGroupKey: 'macroGroup',
    data: [
      { name: 'Car / Jeep / Van', value: 16924, share: 45.4, macroGroup: 'Personal & Light', subtext: 'Dominates passenger volume' },
      { name: 'Multi-Axle Vehicle / OSV', value: 6635, share: 17.8, macroGroup: 'Heavy Freight', subtext: 'Interstate logistics backbone' },
      { name: '2-Axle Truck', value: 5181, share: 13.9, macroGroup: 'Heavy Freight', subtext: 'Regional freight movement' },
      { name: 'LCV', value: 3243, share: 8.7, macroGroup: 'Commercial & Transit', subtext: 'Intra-city distribution' },
      { name: 'Bus', value: 2423, share: 6.5, macroGroup: 'Commercial & Transit', subtext: 'Public & private mass transit' },
      { name: '3-Axle Truck', value: 1827, share: 4.9, macroGroup: 'Heavy Freight', subtext: 'Heavy construction & raw goods' },
      { name: 'Mini LCV', value: 1044, share: 2.8, macroGroup: 'Commercial & Transit', subtext: 'Last-mile urban delivery' },
    ],
  },
  co2Emissions: {
    id: 'co2Emissions',
    name: 'Corridor CO2 Carbon Footprint',
    subtitle: 'Greenhouse gas emissions distribution modeled across 50 km highway buffer',
    unit: 'Tonnes CO2',
    macroGroupKey: 'macroGroup',
    data: [
      { name: 'Multi-Axle Vehicle / OSV', value: 58.4, share: 34.2, macroGroup: 'Heavy Freight', subtext: 'High payload heavy diesel' },
      { name: 'Car / Jeep / Van', value: 42.1, share: 24.7, macroGroup: 'Personal & Light', subtext: 'High traffic density aggregate' },
      { name: '2-Axle Truck', value: 31.6, share: 18.5, macroGroup: 'Heavy Freight', subtext: 'Medium commercial freight' },
      { name: 'Bus', value: 18.2, share: 10.7, macroGroup: 'Commercial & Transit', subtext: 'State transport & luxury liners' },
      { name: '3-Axle Truck', value: 11.8, share: 6.9, macroGroup: 'Heavy Freight', subtext: 'Bulk haulage' },
      { name: 'LCV', value: 8.7, share: 5.0, macroGroup: 'Commercial & Transit', subtext: 'Light utility transit' },
    ],
  },
  particulateMatter: {
    id: 'particulateMatter',
    name: 'Corridor Particulate Matter (PM2.5 Share)',
    subtitle: 'Exhaust aerosol and particulate distribution by fleet category',
    unit: 'kg PM2.5',
    macroGroupKey: 'macroGroup',
    data: [
      { name: 'Multi-Axle Heavy Haulers', value: 184.2, share: 44.5, macroGroup: 'Heavy Freight', subtext: 'Elevated diesel particulate' },
      { name: '3-Axle Freight Trucks', value: 87.8, share: 21.2, macroGroup: 'Heavy Freight', subtext: 'Heavy duty cycle emission' },
      { name: '2-Axle Commercial', value: 76.2, share: 18.4, macroGroup: 'Heavy Freight', subtext: 'Medium freight diesel' },
      { name: 'Interstate Buses', value: 40.6, share: 9.8, macroGroup: 'Commercial & Transit', subtext: 'Continuous route transit' },
      { name: 'LCV & Mini LCV', value: 19.1, share: 4.6, macroGroup: 'Commercial & Transit', subtext: 'Urban delivery diesel' },
      { name: 'Passenger Cars (Petrol/EV/CNG)', value: 6.2, share: 1.5, macroGroup: 'Personal & Light', subtext: 'Lower particulate density' },
    ],
  },
  fuelMix: {
    id: 'fuelMix',
    name: 'National Highway Fuel Technology Mix',
    subtitle: 'Corridor vehicular powertrain distribution and decarbonization tracking',
    unit: '% Fleet',
    macroGroupKey: 'macroGroup',
    data: [
      { name: 'BS-VI Diesel', value: 54.2, share: 54.2, macroGroup: 'Fossil Fuels', subtext: 'Heavy freight & commercial dominant' },
      { name: 'BS-VI Petrol', value: 26.8, share: 26.8, macroGroup: 'Fossil Fuels', subtext: 'Private passenger automobiles' },
      { name: 'CNG / Clean Gas', value: 12.5, share: 12.5, macroGroup: 'Transitional Fuels', subtext: 'Commercial taxis & delivery vans' },
      { name: 'Electric (EV / Battery)', value: 4.5, share: 4.5, macroGroup: 'Zero Emissions', subtext: 'High-growth urban and taxi fleets' },
      { name: 'Hybrid Powertrain', value: 2.0, share: 2.0, macroGroup: 'Transitional Fuels', subtext: 'Mild & strong hybrid passenger cars' },
    ],
  },
  tollFlow: {
    id: 'tollFlow',
    name: 'FASTag Electronic Toll Lane Distribution',
    subtitle: 'Lane throughput and automated barrier processing split at Plaza Km 61+500',
    unit: 'Transactions',
    macroGroupKey: 'macroGroup',
    data: [
      { name: 'Dedicated FASTag Express', value: 25497, share: 68.4, macroGroup: 'Automated ETC', subtext: 'Sub-3 second toll clearance' },
      { name: 'Standard FASTag Lane', value: 8983, share: 24.1, macroGroup: 'Automated ETC', subtext: 'Mixed vehicle clearance' },
      { name: 'Multi-Axle Heavy Lane', value: 2162, share: 5.8, macroGroup: 'Heavy Corridor', subtext: 'Dedicated wide freight lane' },
      { name: 'Non-Tag / Blacklisted (Penalty)', value: 635, share: 1.7, macroGroup: 'Manual Processing', subtext: 'Double toll cash penalty' },
    ],
  },
};

// -------------------------------------------------------------
// Math helpers for SVG Pie & Sectors
// -------------------------------------------------------------
const toRad = (deg) => ((deg - 90) * Math.PI) / 180;

function createArcPath(cx, cy, rInner, rOuter, startAngle, endAngle) {
  // Clamp angle delta to slightly less than 360 to prevent SVG full-circle degeneracy
  const angleDelta = endAngle - startAngle;
  const effectiveEnd = angleDelta >= 360 ? startAngle + 359.999 : endAngle;

  const startRad = toRad(startAngle);
  const endRad = toRad(effectiveEnd);

  const x1_out = cx + rOuter * Math.cos(startRad);
  const y1_out = cy + rOuter * Math.sin(startRad);
  const x2_out = cx + rOuter * Math.cos(endRad);
  const y2_out = cy + rOuter * Math.sin(endRad);

  const largeArc = angleDelta > 180 ? 1 : 0;

  if (rInner <= 0) {
    // Solid pie sector
    return `M ${cx} ${cy} L ${x1_out} ${y1_out} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2_out} ${y2_out} Z`;
  }

  // Annular / Donut sector
  const x1_in = cx + rInner * Math.cos(startRad);
  const y1_in = cy + rInner * Math.sin(startRad);
  const x2_in = cx + rInner * Math.cos(endRad);
  const y2_in = cy + rInner * Math.sin(endRad);

  return [
    `M ${x1_out} ${y1_out}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2_out} ${y2_out}`,
    `L ${x2_in} ${y2_in}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${x1_in} ${y1_in}`,
    'Z',
  ].join(' ');
}

// -------------------------------------------------------------
// InteractivePieChart Component
// -------------------------------------------------------------
export default function InteractivePieChart({
  initialData = null,
  defaultTitle = 'NOx Contribution Percentage by Category',
  defaultSubtitle = 'Multi-axle trucks and heavy freight drive the vast majority of NOx pollution',
  unit = 'kg NOx',
  badgeColor = 'amber',
}) {
  // Chart variation state (1 to 8)
  const [variation, setVariation] = useState('standard');

  // Active dataset selection
  const [selectedDatasetKey, setSelectedDatasetKey] = useState('liveNox');

  // Chart Title & Subtitle custom state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [chartTitle, setChartTitle] = useState(defaultTitle);
  const [chartSubtitle, setChartSubtitle] = useState(defaultSubtitle);

  // Active Color Palette
  const [paletteKey, setPaletteKey] = useState('emerald');
  const [customColors, setCustomColors] = useState({});

  // Display toggles
  const [showLabels, setShowLabels] = useState(true);
  const [labelFormat, setLabelFormat] = useState('percent'); // 'percent', 'value', 'name', 'both'
  const [showLegend, setShowLegend] = useState(true);
  const [explodedDistance, setExplodedDistance] = useState(14); // pixels
  const [hiddenCategories, setHiddenCategories] = useState(new Set());

  // Interactive hover state
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false, item: null });

  // Popover menus state
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const containerRef = useRef(null);
  const svgRef = useRef(null);

  // Synchronize initial data into DEMO_DATASETS.liveNox if provided
  const activeDataset = useMemo(() => {
    if (selectedDatasetKey === 'liveNox' && initialData && initialData.length > 0) {
      const total = initialData.reduce((acc, d) => acc + (d.value || 0), 0);
      return {
        id: 'liveNox',
        name: chartTitle,
        subtitle: chartSubtitle,
        unit: unit,
        data: initialData.map((d) => ({
          name: d.name,
          value: Number(d.value),
          share: total > 0 ? Number(((d.value / total) * 100).toFixed(1)) : 0,
          color: d.color,
          macroGroup: ['Bus', '2-Axle Truck', '3-Axle Truck', 'Multi-Axle Vehicle / OSV'].includes(d.name)
            ? 'Heavy Commercial'
            : ['LCV', 'Mini LCV'].includes(d.name)
            ? 'Light Transit'
            : 'Personal / Light',
          subtext: `Corridor total: ${formatNumber(d.value)} ${unit}`,
        })),
      };
    }
    return DEMO_DATASETS[selectedDatasetKey] || DEMO_DATASETS.liveNox;
  }, [selectedDatasetKey, initialData, chartTitle, chartSubtitle, unit]);

  // Update title when dataset changes
  const handleDatasetChange = (key) => {
    setSelectedDatasetKey(key);
    const ds = DEMO_DATASETS[key];
    if (ds) {
      setChartTitle(ds.name);
      setChartSubtitle(ds.subtitle);
    }
  };

  // Color mapping logic
  const currentPalette = COLOR_PALETTES[paletteKey].colors;
  const processedData = useMemo(() => {
    const rawData = activeDataset.data.filter((item) => !hiddenCategories.has(item.name));
    const totalVal = rawData.reduce((acc, curr) => acc + (curr.value || 0), 0);

    return rawData.map((item, index) => {
      const computedColor = customColors[item.name] || item.color || currentPalette[index % currentPalette.length];
      const computedShare = totalVal > 0 ? Number(((item.value / totalVal) * 100).toFixed(1)) : 0;
      return {
        ...item,
        color: computedColor,
        computedShare,
        totalVal,
      };
    });
  }, [activeDataset, hiddenCategories, currentPalette, customColors]);

  // Total sum of visible items
  const totalValue = useMemo(() => {
    return processedData.reduce((acc, curr) => acc + curr.value, 0);
  }, [processedData]);

  // Maximum value for Rose & Variable Radius charts
  const maxValue = useMemo(() => {
    return Math.max(...processedData.map((d) => d.value), 1);
  }, [processedData]);

  // Macro-groups calculation for Nested Pie Chart
  const nestedGroups = useMemo(() => {
    const groups = {};
    processedData.forEach((item) => {
      const grp = item.macroGroup || 'General';
      if (!groups[grp]) {
        groups[grp] = { name: grp, value: 0, items: [] };
      }
      groups[grp].value += item.value;
      groups[grp].items.push(item);
    });

    return Object.values(groups).map((g, idx) => ({
      ...g,
      share: totalValue > 0 ? Number(((g.value / totalValue) * 100).toFixed(1)) : 0,
      color: currentPalette[idx % currentPalette.length],
    }));
  }, [processedData, totalValue, currentPalette]);

  // Toggle category visibility
  const toggleCategory = (name) => {
    setHiddenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        if (next.size < processedData.length - 1) {
          next.add(name);
        }
      }
      return next;
    });
  };

  // Handle single color change
  const handleColorChange = (categoryName, color) => {
    setCustomColors((prev) => ({
      ...prev,
      [categoryName]: color,
    }));
  };

  // Reset colors
  const resetColors = () => {
    setCustomColors({});
  };

  // Tooltip tracking
  const handleMouseMove = (e, item) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTooltipPos({ x, y, visible: true, item });
  };

  const handleMouseLeave = () => {
    setTooltipPos((prev) => ({ ...prev, visible: false }));
    setHoveredIndex(null);
  };

  // Export functions
  const exportAsPNG = () => {
    if (!svgRef.current) return;
    const svgElement = svgRef.current;
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1120;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      // Fill background
      ctx.fillStyle = '#0f172a'; // Elegant dark canvas background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Title & watermark on exported image
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.fillText(chartTitle, 40, 50);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText(chartSubtitle, 40, 80);

      ctx.drawImage(image, 40, 100, 1040, 580);

      const pngURL = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngURL;
      downloadLink.download = `${chartTitle.replace(/\s+/g, '_')}_PieChart.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobURL);
      setIsExportOpen(false);
    };
    image.src = blobURL;
  };

  const exportAsSVG = () => {
    if (!svgRef.current) return;
    const svgString = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${chartTitle.replace(/\s+/g, '_')}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsExportOpen(false);
  };

  const exportAsCSV = () => {
    const headers = ['Category', 'Value', 'Unit', 'Share (%)', 'Macro Group', 'Lineage / Notes'];
    const rows = processedData.map((d) => [
      `"${d.name}"`,
      d.value,
      `"${activeDataset.unit || unit}"`,
      d.computedShare,
      `"${d.macroGroup || ''}"`,
      `"${d.subtext || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${chartTitle.replace(/\s+/g, '_')}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
  };

  const exportAsJSON = () => {
    const exportObject = {
      title: chartTitle,
      subtitle: chartSubtitle,
      variation: variation,
      unit: activeDataset.unit || unit,
      total: totalValue,
      generatedAt: new Date().toISOString(),
      datasetId: selectedDatasetKey,
      data: processedData,
    };
    const jsonString = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = `${chartTitle.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.interactive-pie-menu')) {
        setIsPaletteOpen(false);
        setIsExportOpen(false);
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute slice angles based on variation
  const slices = useMemo(() => {
    let accAngle = 0;
    const computed = [];

    for (let index = 0; index < processedData.length; index++) {
      const item = processedData[index];
      const isHovered = hoveredIndex === index;

      if (variation === 'semicircle') {
        // 180° semi-circle from 180° to 360° (or -90° to 90°)
        const sweepAngle = (item.value / (totalValue || 1)) * 180;
        const startAngle = 180 + accAngle;
        const endAngle = startAngle + sweepAngle;
        accAngle += sweepAngle;
        const midAngle = (startAngle + endAngle) / 2;

        computed.push({
          ...item,
          index,
          startAngle,
          endAngle,
          midAngle,
          rInner: INNER_RADIUS * 0.75,
          rOuter: isHovered ? OUTER_RADIUS + 8 : OUTER_RADIUS,
          cx: CX,
          cy: CY + 45, // lower center for half arch
        });
      } else if (variation === 'rose') {
        // Florence Nightingale Coxcomb: Equal angle, variable radius
        const sliceCount = processedData.length || 1;
        const sweepAngle = 360 / sliceCount;
        const startAngle = index * sweepAngle;
        const endAngle = startAngle + sweepAngle;
        const midAngle = (startAngle + endAngle) / 2;

        // Radius is proportional to value
        const minR = 35;
        const maxR = OUTER_RADIUS + 15;
        const valueRatio = Math.sqrt(item.value / maxValue); // square root scale preserves area accuracy
        const radius = minR + valueRatio * (maxR - minR);

        computed.push({
          ...item,
          index,
          startAngle,
          endAngle,
          midAngle,
          rInner: 0,
          rOuter: isHovered ? radius + 8 : radius,
          cx: CX,
          cy: CY,
        });
      } else if (variation === 'variableRadius') {
        // Both angle AND radius vary
        const sweepAngle = (item.value / (totalValue || 1)) * 360;
        const startAngle = accAngle;
        const endAngle = startAngle + sweepAngle;
        accAngle += sweepAngle;
        const midAngle = (startAngle + endAngle) / 2;

        const minR = 60;
        const maxR = OUTER_RADIUS + 12;
        const valueRatio = item.value / maxValue;
        const radius = minR + valueRatio * (maxR - minR);

        computed.push({
          ...item,
          index,
          startAngle,
          endAngle,
          midAngle,
          rInner: 25,
          rOuter: isHovered ? radius + 8 : radius,
          cx: CX,
          cy: CY,
        });
      } else {
        // Standard, 3D, Exploded, Donut, Nested
        const sweepAngle = (item.value / (totalValue || 1)) * 360;
        const startAngle = accAngle;
        const endAngle = startAngle + sweepAngle;
        accAngle += sweepAngle;
        const midAngle = (startAngle + endAngle) / 2;

        let rIn = 0;
        let rOut = OUTER_RADIUS;

        if (variation === 'donut') {
          rIn = INNER_RADIUS;
          rOut = isHovered ? OUTER_RADIUS + 6 : OUTER_RADIUS;
        } else if (variation === 'nested') {
          // Outer ring of nested pie
          rIn = 88;
          rOut = isHovered ? 134 : 126;
        } else if (variation === 'exploded') {
          rOut = isHovered ? OUTER_RADIUS + 6 : OUTER_RADIUS;
        } else if (variation === '3d') {
          rOut = isHovered ? OUTER_RADIUS + 6 : OUTER_RADIUS;
        } else {
          // standard
          rOut = isHovered ? OUTER_RADIUS + 8 : OUTER_RADIUS;
        }

        // Explosion displacement
        let dx = 0;
        let dy = 0;
        if (variation === 'exploded') {
          const dist = isHovered ? explodedDistance + 12 : explodedDistance;
          const rad = toRad(midAngle);
          dx = Math.cos(rad) * dist;
          dy = Math.sin(rad) * dist;
        }

        computed.push({
          ...item,
          index,
          startAngle,
          endAngle,
          midAngle,
          rInner: rIn,
          rOuter: rOut,
          dx,
          dy,
          cx: CX,
          cy: CY,
        });
      }
    }
    return computed;
  }, [processedData, hoveredIndex, variation, totalValue, maxValue, explodedDistance]);

  // Calculate inner ring slices for Nested Pie Chart
  const innerNestedSlices = useMemo(() => {
    if (variation !== 'nested') return [];
    let accAngle = 0;
    const computed = [];
    for (let idx = 0; idx < nestedGroups.length; idx++) {
      const grp = nestedGroups[idx];
      const sweepAngle = (grp.value / (totalValue || 1)) * 360;
      const startAngle = accAngle;
      const endAngle = startAngle + sweepAngle;
      accAngle += sweepAngle;
      const midAngle = (startAngle + endAngle) / 2;
      computed.push({
        ...grp,
        index: idx,
        startAngle,
        endAngle,
        midAngle,
        rInner: 24,
        rOuter: 78,
        cx: CX,
        cy: CY,
      });
    }
    return computed;
  }, [variation, nestedGroups, totalValue]);

  // Helper to format label text
  const getLabelText = (item) => {
    switch (labelFormat) {
      case 'value':
        return `${formatNumber(item.value)} ${activeDataset.unit ? activeDataset.unit.split(' ')[0] : ''}`;
      case 'name':
        return item.name.length > 10 ? item.name.slice(0, 8) + '…' : item.name;
      case 'both':
        return `${item.computedShare}% (${formatNumber(item.value)})`;
      case 'percent':
      default:
        return `${item.computedShare}%`;
    }
  };

  // Determine badge styling based on prop
  const getBadgeClass = () => {
    switch (badgeColor) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';
      case 'teal':
        return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800';
      case 'cyan':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-800';
      case 'amber':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm transition-all duration-200 flex flex-col justify-between"
    >
      {/* ------------------------------------------------------- */}
      {/* 1. Header & Controls Bar */}
      {/* ------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex-1 min-w-0">
          {isEditingTitle ? (
            <div className="flex flex-col gap-2 max-w-md">
              <input
                type="text"
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                className="px-2.5 py-1 text-sm font-bold rounded-lg border border-emerald-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                placeholder="Enter custom chart title"
                autoFocus
              />
              <input
                type="text"
                value={chartSubtitle}
                onChange={(e) => setChartSubtitle(e.target.value)}
                className="px-2.5 py-0.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 focus:outline-none"
                placeholder="Enter custom subtitle"
              />
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => setIsEditingTitle(false)}
                  className="px-3 py-1 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" /> Save Title
                </button>
                <button
                  onClick={() => {
                    setChartTitle(defaultTitle);
                    setChartSubtitle(defaultSubtitle);
                    setIsEditingTitle(false);
                  }}
                  className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Reset
                </button>
              </div>
            </div>
          ) : (
            <div className="group flex items-start gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg tracking-tight">
                    {chartTitle}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getBadgeClass()}`}>
                    Interactive
                  </span>
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    title="Rename Chart Title"
                    className="opacity-60 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {chartSubtitle}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls Group */}
        <div className="flex items-center flex-wrap gap-2 interactive-pie-menu">
          {/* Variation Selector Dropdown */}
          <div className="relative">
            <select
              value={variation}
              onChange={(e) => setVariation(e.target.value)}
              className="appearance-none text-xs font-semibold pl-3 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer transition-colors shadow-xs"
            >
              <option value="standard">Standard Pie Chart</option>
              <option value="3d">3D Pie Chart</option>
              <option value="exploded">Exploded Pie Chart</option>
              <option value="donut">Donut Chart</option>
              <option value="nested">Nested Pie Chart</option>
              <option value="semicircle">Semi-Circle Pie Chart</option>
              <option value="rose">Rose / Nightingale Chart</option>
              <option value="variableRadius">Variable Radius Pie</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Dataset Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedDatasetKey}
              onChange={(e) => handleDatasetChange(e.target.value)}
              className="appearance-none text-xs font-semibold pl-3 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer transition-colors shadow-xs max-w-[140px] sm:max-w-[180px] truncate"
            >
              <option value="liveNox">Demo: Live NOx Breakdown</option>
              <option value="trafficVolume">Demo: NH-48 Traffic Volume</option>
              <option value="co2Emissions">Demo: Corridor CO2 Carbon</option>
              <option value="particulateMatter">Demo: Particulate PM2.5</option>
              <option value="fuelMix">Demo: Powertrain Fuel Mix</option>
              <option value="tollFlow">Demo: FASTag Lane Split</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Color Palette Popover Button */}
          <div className="relative">
            <button
              onClick={() => {
                setIsPaletteOpen((prev) => !prev);
                setIsExportOpen(false);
                setIsSettingsOpen(false);
              }}
              title="Change Color Palette"
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
                isPaletteOpen
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Theme</span>
            </button>

            {/* Palette Menu */}
            {isPaletteOpen && (
              <div className="absolute right-0 mt-2 w-64 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl z-30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Chart Palettes</span>
                  <button
                    onClick={resetColors}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset
                  </button>
                </div>
                <div className="space-y-1.5">
                  {Object.entries(COLOR_PALETTES).map(([key, pal]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setPaletteKey(key);
                        setCustomColors({});
                      }}
                      className={`w-full p-2 rounded-lg text-left flex items-center justify-between transition-colors ${
                        paletteKey === key
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-slate-800 dark:text-slate-200">{pal.name}</div>
                        <div className="flex items-center gap-1">
                          {pal.colors.slice(0, 6).map((c, i) => (
                            <span key={i} className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </div>
                      {paletteKey === key && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  ))}
                </div>

                {/* Individual Slice Color Pickers */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Custom Slice Colors
                  </span>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
                    {processedData.map((d) => (
                      <div key={d.name} className="flex items-center justify-between py-0.5">
                        <span className="text-slate-700 dark:text-slate-300 truncate max-w-[130px]">{d.name}</span>
                        <input
                          type="color"
                          value={d.color}
                          onChange={(e) => handleColorChange(d.name, e.target.value)}
                          className="w-6 h-6 rounded border border-slate-300 dark:border-slate-600 cursor-pointer bg-transparent"
                          title={`Pick color for ${d.name}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Settings / Controls Popover Button */}
          <div className="relative">
            <button
              onClick={() => {
                setIsSettingsOpen((prev) => !prev);
                setIsPaletteOpen(false);
                setIsExportOpen(false);
              }}
              title="Display Options"
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
                isSettingsOpen
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            </button>

            {/* Display Settings Menu */}
            {isSettingsOpen && (
              <div className="absolute right-0 mt-2 w-64 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl z-30 space-y-3.5">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block pb-1 border-b border-slate-100 dark:border-slate-800">
                  Visualization Controls
                </span>

                {/* Data Labels Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-700 dark:text-slate-300">Show Data Labels</span>
                  <button
                    onClick={() => setShowLabels((prev) => !prev)}
                    className={`w-9 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      showLabels ? 'bg-emerald-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-white shadow-xs" />
                  </button>
                </div>

                {/* Label Format */}
                {showLabels && (
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500">Label Format</span>
                    <select
                      value={labelFormat}
                      onChange={(e) => setLabelFormat(e.target.value)}
                      className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    >
                      <option value="percent">Percentage Only (e.g. 35.7%)</option>
                      <option value="value">Value Only (e.g. 1,218 kg)</option>
                      <option value="both">Both (35.7% · 1,218)</option>
                      <option value="name">Category Name</option>
                    </select>
                  </div>
                )}

                {/* Legend Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-700 dark:text-slate-300">Show Legend</span>
                  <button
                    onClick={() => setShowLegend((prev) => !prev)}
                    className={`w-9 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      showLegend ? 'bg-emerald-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-white shadow-xs" />
                  </button>
                </div>

                {/* Explosion slider for exploded pie */}
                {variation === 'exploded' && (
                  <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
                      <span>Explosion Gap</span>
                      <span className="font-mono text-emerald-600">{explodedDistance}px</span>
                    </div>
                    <input
                      type="range"
                      min="6"
                      max="32"
                      value={explodedDistance}
                      onChange={(e) => setExplodedDistance(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Export Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => {
                setIsExportOpen((prev) => !prev);
                setIsPaletteOpen(false);
                setIsSettingsOpen(false);
              }}
              title="Export Chart or Data"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Export Menu */}
            {isExportOpen && (
              <div className="absolute right-0 mt-2 w-52 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl z-30 space-y-1 text-xs">
                <button
                  onClick={exportAsPNG}
                  className="w-full px-3 py-2 rounded-lg text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-semibold">Export as PNG</div>
                    <div className="text-[10px] text-slate-400">High-res graphic image</div>
                  </div>
                </button>
                <button
                  onClick={exportAsSVG}
                  className="w-full px-3 py-2 rounded-lg text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <FileCode className="w-4 h-4 text-cyan-600" />
                  <div>
                    <div className="font-semibold">Export as SVG</div>
                    <div className="text-[10px] text-slate-400">Scalable vector graphics</div>
                  </div>
                </button>
                <button
                  onClick={exportAsCSV}
                  className="w-full px-3 py-2 rounded-lg text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="font-semibold">Export Data as CSV</div>
                    <div className="text-[10px] text-slate-400">Spreadsheet ready table</div>
                  </div>
                </button>
                <button
                  onClick={exportAsJSON}
                  className="w-full px-3 py-2 rounded-lg text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Share2 className="w-4 h-4 text-purple-600" />
                  <div>
                    <div className="font-semibold">Export as JSON</div>
                    <div className="text-[10px] text-slate-400">Structured data format</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------- */}
      {/* 2. Interactive SVG Visualization Canvas */}
      {/* ------------------------------------------------------- */}
      <div className="relative w-full h-80 sm:h-96 flex items-center justify-center my-2 select-none overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-full max-h-96 transition-all duration-300"
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Filter for subtle 3D drop shadow */}
            <filter id="pieDropShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="6" floodOpacity="0.22" />
            </filter>
            <filter id="pieGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#10b981" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* --------------------------------------------------- */}
          {/* A. 3D PIE CHART RENDERING */}
          {/* --------------------------------------------------- */}
          {variation === '3d' && (
            <g transform="translate(0, -10)">
              {/* Ground Shadow */}
              <ellipse
                cx={CX}
                cy={CY + 45}
                rx={OUTER_RADIUS * 1.15}
                ry={OUTER_RADIUS * 0.58}
                fill="rgba(0, 0, 0, 0.28)"
                filter="blur(8px)"
              />

              {/* 3D Extrusion Depth Layers (Front-facing cylinder edge) */}
              {[...Array(18)].map((_, layerIdx) => {
                const layerOffset = 18 - layerIdx;
                return (
                  <g key={`3d-depth-${layerIdx}`} transform={`translate(0, ${layerOffset}) scale(1, 0.58)`}>
                    {slices.map((slice) => {
                      const path = createArcPath(slice.cx, slice.cy, slice.rInner, slice.rOuter, slice.startAngle, slice.endAngle);
                      return (
                        <path
                          key={`3d-layer-${slice.index}-${layerIdx}`}
                          d={path}
                          fill={slice.color}
                          style={{
                            filter: 'brightness(0.68) saturate(0.85)',
                            opacity: 0.85,
                          }}
                        />
                      );
                    })}
                  </g>
                );
              })}

              {/* 3D Top Faces (Isometric Ellipse) */}
              <g transform="scale(1, 0.58)">
                {slices.map((slice) => {
                  const isHovered = hoveredIndex === slice.index;
                  const path = createArcPath(slice.cx, slice.cy, slice.rInner, slice.rOuter, slice.startAngle, slice.endAngle);

                  // 3D hover elevation
                  const hoverTransform = isHovered ? `translate(0, -18)` : '';

                  return (
                    <g key={`3d-top-${slice.index}`} transform={hoverTransform} className="transition-transform duration-200">
                      <path
                        d={path}
                        fill={slice.color}
                        stroke="#0f172a"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                        className="cursor-pointer transition-all duration-200"
                        style={{
                          filter: isHovered ? 'brightness(1.15) drop-shadow(0 -4px 6px rgba(0,0,0,0.4))' : 'brightness(1.0)',
                        }}
                        onMouseEnter={() => setHoveredIndex(slice.index)}
                        onMouseMove={(e) => handleMouseMove(e, slice)}
                      />
                    </g>
                  );
                })}
              </g>
            </g>
          )}

          {/* --------------------------------------------------- */}
          {/* B. NESTED / CONCENTRIC PIE CHART RENDERING */}
          {/* --------------------------------------------------- */}
          {variation === 'nested' && (
            <g filter="url(#pieDropShadow)">
              {/* Inner Ring: Macro Classification */}
              {innerNestedSlices.map((inner) => {
                const path = createArcPath(inner.cx, inner.cy, inner.rInner, inner.rOuter, inner.startAngle, inner.endAngle);
                return (
                  <path
                    key={`nested-inner-${inner.name}`}
                    d={path}
                    fill={inner.color}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:brightness-110"
                    onMouseEnter={() => setHoveredIndex(`inner-${inner.name}`)}
                    onMouseMove={(e) => handleMouseMove(e, inner)}
                  />
                );
              })}

              {/* Inner Ring Labels */}
              {innerNestedSlices.map((inner) => {
                const midRad = toRad(inner.midAngle);
                const rMid = (inner.rInner + inner.rOuter) / 2;
                const lx = inner.cx + rMid * Math.cos(midRad);
                const ly = inner.cy + rMid * Math.sin(midRad);
                if (inner.endAngle - inner.startAngle < 28) return null;
                return (
                  <text
                    key={`nested-inner-label-${inner.name}`}
                    x={lx}
                    y={ly}
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pointer-events-none drop-shadow-sm"
                  >
                    {inner.name.split(' ')[0]}
                  </text>
                );
              })}

              {/* Outer Ring: Specific Categories */}
              {slices.map((slice) => {
                const isHovered = hoveredIndex === slice.index;
                const path = createArcPath(slice.cx, slice.cy, slice.rInner, slice.rOuter, slice.startAngle, slice.endAngle);
                return (
                  <path
                    key={`nested-outer-${slice.index}`}
                    d={path}
                    fill={slice.color}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-200"
                    style={{
                      transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                      transformOrigin: `${slice.cx}px ${slice.cy}px`,
                      filter: isHovered ? 'brightness(1.15)' : 'none',
                    }}
                    onMouseEnter={() => setHoveredIndex(slice.index)}
                    onMouseMove={(e) => handleMouseMove(e, slice)}
                  />
                );
              })}
            </g>
          )}

          {/* --------------------------------------------------- */}
          {/* C. ROSE / NIGHTINGALE CHART RENDERING */}
          {/* --------------------------------------------------- */}
          {variation === 'rose' && (
            <g>
              {/* Concentric Polar Grid Guide Lines */}
              {[0.25, 0.5, 0.75, 1.0].map((ratio) => (
                <circle
                  key={`rose-grid-${ratio}`}
                  cx={CX}
                  cy={CY}
                  r={35 + ratio * (OUTER_RADIUS + 15 - 35)}
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="3 3"
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="1"
                />
              ))}

              {/* Radial Spokes */}
              {slices.map((slice, i) => {
                const rad = toRad(slice.startAngle);
                const x2 = CX + (OUTER_RADIUS + 20) * Math.cos(rad);
                const y2 = CY + (OUTER_RADIUS + 20) * Math.sin(rad);
                return (
                  <line
                    key={`rose-spoke-${i}`}
                    x1={CX}
                    y1={CY}
                    x2={x2}
                    y2={y2}
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-800"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Rose Petals */}
              {slices.map((slice) => {
                const isHovered = hoveredIndex === slice.index;
                const path = createArcPath(slice.cx, slice.cy, slice.rInner, slice.rOuter, slice.startAngle, slice.endAngle);
                return (
                  <path
                    key={`rose-petal-${slice.index}`}
                    d={path}
                    fill={slice.color}
                    fillOpacity={isHovered ? 0.95 : 0.8}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-200"
                    style={{
                      filter: isHovered ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' : 'none',
                    }}
                    onMouseEnter={() => setHoveredIndex(slice.index)}
                    onMouseMove={(e) => handleMouseMove(e, slice)}
                  />
                );
              })}
            </g>
          )}

          {/* --------------------------------------------------- */}
          {/* D. STANDARD / EXPLODED / DONUT / SEMI-CIRCLE / VARIABLE RADIUS */}
          {/* --------------------------------------------------- */}
          {!['3d', 'nested', 'rose'].includes(variation) && (
            <g filter="url(#pieDropShadow)">
              {slices.map((slice) => {
                const isHovered = hoveredIndex === slice.index;
                const path = createArcPath(slice.cx, slice.cy, slice.rInner, slice.rOuter, slice.startAngle, slice.endAngle);
                const transform = slice.dx || slice.dy ? `translate(${slice.dx}, ${slice.dy})` : '';

                return (
                  <path
                    key={`pie-slice-${slice.index}`}
                    d={path}
                    fill={slice.color}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    transform={transform}
                    className="cursor-pointer transition-all duration-200"
                    style={{
                      filter: isHovered ? 'brightness(1.15) drop-shadow(0 4px 6px rgba(0,0,0,0.25))' : 'none',
                    }}
                    onMouseEnter={() => setHoveredIndex(slice.index)}
                    onMouseMove={(e) => handleMouseMove(e, slice)}
                  />
                );
              })}

              {/* Donut Center Display */}
              {variation === 'donut' && (
                <g className="pointer-events-none">
                  <circle cx={CX} cy={CY} r={INNER_RADIUS - 4} fill="currentColor" className="text-white dark:text-slate-900" />
                  <circle cx={CX} cy={CY} r={INNER_RADIUS - 4} fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
                  {hoveredIndex !== null && processedData[hoveredIndex] ? (
                    <>
                      <text
                        x={CX}
                        y={CY - 16}
                        fill="currentColor"
                        className="text-slate-500 dark:text-slate-400"
                        fontSize="11"
                        fontWeight="semibold"
                        textAnchor="middle"
                      >
                        {processedData[hoveredIndex].name.length > 14
                          ? processedData[hoveredIndex].name.slice(0, 12) + '…'
                          : processedData[hoveredIndex].name}
                      </text>
                      <text
                        x={CX}
                        y={CY + 8}
                        fill="currentColor"
                        className="text-slate-900 dark:text-slate-100"
                        fontSize="20"
                        fontWeight="extrabold"
                        textAnchor="middle"
                      >
                        {processedData[hoveredIndex].computedShare}%
                      </text>
                      <text
                        x={CX}
                        y={CY + 26}
                        fill="currentColor"
                        className="text-slate-400 dark:text-slate-500 font-mono"
                        fontSize="10"
                        textAnchor="middle"
                      >
                        {formatNumber(processedData[hoveredIndex].value)} {activeDataset.unit ? activeDataset.unit.split(' ')[0] : ''}
                      </text>
                    </>
                  ) : (
                    <>
                      <text
                        x={CX}
                        y={CY - 14}
                        fill="currentColor"
                        className="text-slate-400 dark:text-slate-500 uppercase tracking-widest"
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        Total Corridor
                      </text>
                      <text
                        x={CX}
                        y={CY + 9}
                        fill="currentColor"
                        className="text-slate-900 dark:text-slate-100"
                        fontSize="18"
                        fontWeight="extrabold"
                        textAnchor="middle"
                      >
                        {formatNumber(totalValue, 1)}
                      </text>
                      <text
                        x={CX}
                        y={CY + 25}
                        fill="currentColor"
                        className="text-emerald-600 dark:text-emerald-400 font-medium"
                        fontSize="10"
                        textAnchor="middle"
                      >
                        {activeDataset.unit || unit}
                      </text>
                    </>
                  )}
                </g>
              )}

              {/* Semi-Circle Focal Readout */}
              {variation === 'semicircle' && (
                <g className="pointer-events-none" transform="translate(0, 45)">
                  <text
                    x={CX}
                    y={CY - 22}
                    fill="currentColor"
                    className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider"
                    fontSize="11"
                    textAnchor="middle"
                  >
                    {hoveredIndex !== null && processedData[hoveredIndex]
                      ? processedData[hoveredIndex].name
                      : 'Total Corridor Volume'}
                  </text>
                  <text
                    x={CX}
                    y={CY + 8}
                    fill="currentColor"
                    className="text-slate-900 dark:text-slate-100"
                    fontSize="24"
                    fontWeight="extrabold"
                    textAnchor="middle"
                  >
                    {hoveredIndex !== null && processedData[hoveredIndex]
                      ? `${processedData[hoveredIndex].computedShare}%`
                      : `${formatNumber(totalValue, 1)}`}
                  </text>
                  <text
                    x={CX}
                    y={CY + 26}
                    fill="currentColor"
                    className="text-emerald-600 dark:text-emerald-400 text-xs font-medium"
                    fontSize="11"
                    textAnchor="middle"
                  >
                    {hoveredIndex !== null && processedData[hoveredIndex]
                      ? `${formatNumber(processedData[hoveredIndex].value)} ${activeDataset.unit || unit}`
                      : `${activeDataset.unit || unit}`}
                  </text>
                </g>
              )}
            </g>
          )}

          {/* --------------------------------------------------- */}
          {/* E. DATA LABELS OVERLAY (Responsive & Formatted) */}
          {/* --------------------------------------------------- */}
          {showLabels && variation !== '3d' && (
            <g className="pointer-events-none">
              {slices.map((slice) => {
                // Do not render label if slice is too small (< 4%)
                if (slice.computedShare < 4) return null;

                const midRad = toRad(slice.midAngle);
                let rLabel = (slice.rInner + slice.rOuter) / 2;

                if (variation === 'donut') {
                  rLabel = (INNER_RADIUS + OUTER_RADIUS) / 2;
                } else if (variation === 'nested') {
                  rLabel = (88 + 126) / 2;
                } else if (variation === 'rose' || variation === 'variableRadius') {
                  rLabel = slice.rOuter * 0.72;
                }

                let lx = slice.cx + rLabel * Math.cos(midRad) + (slice.dx || 0);
                let ly = slice.cy + rLabel * Math.sin(midRad) + (slice.dy || 0);

                if (variation === 'semicircle') {
                  ly = slice.cy + rLabel * Math.sin(midRad);
                }

                const labelContent = getLabelText(slice);

                return (
                  <text
                    key={`pie-label-${slice.index}`}
                    x={lx}
                    y={ly}
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                  >
                    {labelContent}
                  </text>
                );
              })}
            </g>
          )}
        </svg>

        {/* ----------------------------------------------------- */}
        {/* 3. Floating Interactive HTML Tooltip */}
        {/* ----------------------------------------------------- */}
        {tooltipPos.visible && tooltipPos.item && (
          <div
            className="absolute z-40 pointer-events-none bg-slate-900/95 dark:bg-slate-950/95 text-white border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs transition-transform duration-75 min-w-[210px]"
            style={{
              left: `${Math.min(tooltipPos.x + 12, SVG_WIDTH - 230)}px`,
              top: `${Math.max(tooltipPos.y - 70, 10)}px`,
            }}
          >
            <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-slate-700/60">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: tooltipPos.item.color }}
              />
              <span className="font-bold text-slate-100 truncate">
                {tooltipPos.item.name}
              </span>
            </div>

            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex items-center justify-between text-slate-300">
                <span>Value:</span>
                <span className="font-bold text-white">
                  {formatNumber(tooltipPos.item.value, 2)} {activeDataset.unit ? activeDataset.unit.split(' ')[0] : ''}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Proportion:</span>
                <span className="font-bold text-emerald-400">
                  {tooltipPos.item.computedShare !== undefined
                    ? `${tooltipPos.item.computedShare}%`
                    : `${tooltipPos.item.share}%`}
                </span>
              </div>
              {tooltipPos.item.macroGroup && (
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>Classification:</span>
                  <span className="text-slate-200">{tooltipPos.item.macroGroup}</span>
                </div>
              )}
            </div>

            {tooltipPos.item.subtext && (
              <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex items-center gap-1">
                <Info className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                <span className="line-clamp-1">{tooltipPos.item.subtext}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------- */}
      {/* 4. Interactive Clickable Legend Bar */}
      {/* ------------------------------------------------------- */}
      {showLegend && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Interactive Legend (Click to filter · Hover to focus)
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {processedData.length} active classes
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 max-h-28 overflow-y-auto pr-1">
            {activeDataset.data.map((item, index) => {
              const isHidden = hiddenCategories.has(item.name);
              const isHovered = hoveredIndex === index;
              const currentColor = customColors[item.name] || item.color || currentPalette[index % currentPalette.length];

              return (
                <button
                  key={`legend-btn-${item.name}`}
                  onClick={() => toggleCategory(item.name)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`group px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-2 border transition-all cursor-pointer ${
                    isHidden
                      ? 'opacity-40 line-through border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-400'
                      : isHovered
                      ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                  title={isHidden ? `Show ${item.name}` : `Hide ${item.name}`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform group-hover:scale-125"
                    style={{ backgroundColor: currentColor }}
                  />
                  <span className="truncate max-w-[120px]">{item.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono ml-0.5">
                    {item.share !== undefined ? `${item.share}%` : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
