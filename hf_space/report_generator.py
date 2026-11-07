"""
Report Generation Module for TollTrack AI Detection (Hugging Face Space)
Generates:
1. CSV report of vehicle detections & emission quantification
2. High-quality PDF report using ReportLab with complete scientific lineage
"""

import io
import csv
import os
import sys
from datetime import datetime

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
    )
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


def generate_csv_report(detections: list, emission_results: dict, analysis_date: str = None) -> str:
    """
    Generates a structured CSV report containing detection details and emission calculations.
    """
    date_str = analysis_date or datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    distance_km = emission_results.get('assumedDistanceKm', 50)
    totals = emission_results.get('totals', {})
    categories = emission_results.get('categories', [])

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["TOLLTRACK - AI VEHICLE DETECTION & EMISSION AUDIT REPORT"])
    writer.writerow(["Location", "Chokkenahalli Toll Plaza, NH-48 (Km 61+500), Kyathsandra, Tumakuru"])
    writer.writerow(["Analysis Timestamp", date_str])
    writer.writerow(["Assumed Travel Distance (km)", distance_km])
    writer.writerow(["Data Source", "Image Snapshot AI Detection (Separated from Official FASTag Baseline)"])
    writer.writerow(["AI Model", "YOLOv8 Pretrained Vision Model (MS COCO)"])
    writer.writerow([])

    writer.writerow(["EMISSION QUANTIFICATION SUMMARY"])
    writer.writerow(["Metric", "Value", "Unit"])
    writer.writerow(["Total Detected Vehicles", totals.get('vehicleCount', 0), "vehicles"])
    writer.writerow(["Total Vehicle Kilometres (VKT)", totals.get('vehicleKm', 0), "km"])
    writer.writerow(["Total CO2 Emissions", totals.get('co2Kg', 0), "kg"])
    writer.writerow(["Total CO2 Emissions", totals.get('co2Tonnes', 0), "Tonnes"])
    writer.writerow(["Total NOx Emissions", totals.get('noxKg', 0), "kg"])
    writer.writerow(["Total NOx Emissions", totals.get('noxGrams', 0), "grams"])
    writer.writerow(["Total Traffic Load (PCU)", totals.get('totalPcu', 0), "PCU"])
    writer.writerow(["Annual Mature Trees Required for Offset", totals.get('treesNeeded', 0), "trees"])
    writer.writerow(["Diesel Fuel Equivalent Consumed", totals.get('dieselEquivLiters', 0), "liters"])
    writer.writerow([])

    writer.writerow(["CATEGORY-WISE BREAKDOWN"])
    writer.writerow([
        "Category", "Count", "Distance (km)", "VKT (km)",
        "CO2 Factor (kg/km)", "CO2 (kg)", "CO2 (t)", "CO2 Share (%)",
        "NOx Factor (g/km)", "NOx (kg)", "Traffic Share (%)", "Fuel Type", "Emission Standard", "Source"
    ])

    for cat in categories:
        writer.writerow([
            cat.get('category'),
            cat.get('count'),
            cat.get('distanceKm'),
            cat.get('vkt'),
            cat.get('co2Factor'),
            cat.get('co2Kg'),
            cat.get('co2Tonnes'),
            f"{cat.get('co2Share', 0)}%",
            cat.get('noxFactor'),
            cat.get('noxKg'),
            f"{cat.get('trafficShare', 0)}%",
            cat.get('fuelType'),
            cat.get('emissionStandard'),
            cat.get('source')
        ])

    writer.writerow([])
    writer.writerow(["INDIVIDUAL VEHICLE DETECTIONS"])
    writer.writerow(["Detection ID", "Raw YOLO Class", "Mapped Category", "Confidence Score", "Confidence (%)", "Requires Review", "Notes"])

    for det in detections:
        writer.writerow([
            det.get('id', ''),
            det.get('raw_class', ''),
            det.get('category', ''),
            det.get('confidence', ''),
            f"{det.get('confidence_pct', 0)}%",
            "Yes" if det.get('requires_manual_refinement') else "No",
            det.get('manual_note', '')
        ])

    writer.writerow([])
    writer.writerow(["SCIENTIFIC METHODOLOGY & REFERENCES"])
    writer.writerow(["Standard", "ARAI & CPCB Emission Inventory Model for On-Road Vehicles (India)"])
    writer.writerow(["VKT Formulation", "Vehicle Kilometres = Detected Vehicles × Assumed Distance (km)"])
    writer.writerow(["CO2 Formulation", "CO2 (kg) = VKT × ARAI CO2 Factor (kg/km)"])
    writer.writerow(["NOx Formulation", "NOx (kg) = VKT × CPCB NOx Factor (g/km) / 1000"])

    return output.getvalue()


def generate_pdf_report(detections: list, emission_results: dict, analysis_date: str = None) -> bytes:
    """
    Generates a scientific PDF report with emission analysis using ReportLab.
    """
    if not REPORTLAB_AVAILABLE:
        return b"%PDF-1.4 Empty fallback (ReportLab not installed)"

    date_str = analysis_date or datetime.now().strftime("%d %B %Y, %I:%M %p")
    distance_km = emission_results.get('assumedDistanceKm', 50)
    totals = emission_results.get('totals', {})
    categories = emission_results.get('categories', [])

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    header_style = ParagraphStyle(
        'DocHeader',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#065f46'),
        spaceAfter=4
    )

    sub_header_style = ParagraphStyle(
        'DocSubHeader',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#4b5563'),
        spaceAfter=12
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1f2937'),
        spaceBefore=10,
        spaceAfter=6
    )

    cell_style = ParagraphStyle(
        'CellText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#1f2937')
    )

    cell_style_bold = ParagraphStyle(
        'CellTextBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#111827')
    )

    story = []

    # Title Banner
    story.append(Paragraph("TollTrack - AI Vehicle Detection & Emission Audit", header_style))
    story.append(Paragraph(
        f"<b>Chokkenahalli Toll Plaza, NH-48 (Km 61+500)</b> | Analysis Date: {date_str} | Assumed Distance: {distance_km} km",
        sub_header_style
    ))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#059669'), spaceAfter=10))

    # Executive Summary Cards
    summary_data = [
        [
            Paragraph(f"<b>Detected Vehicles</b><br/>{totals.get('vehicleCount', 0)} units", cell_style),
            Paragraph(f"<b>Vehicle Travel (VKT)</b><br/>{totals.get('vehicleKm', 0):,.1f} km", cell_style),
            Paragraph(f"<b>Total CO2 Emissions</b><br/>{totals.get('co2Kg', 0):,.2f} kg ({totals.get('co2Tonnes', 0):.3f} t)", cell_style),
            Paragraph(f"<b>Total NOx Emissions</b><br/>{totals.get('noxKg', 0):,.3f} kg", cell_style)
        ]
    ]
    summary_table = Table(summary_data, colWidths=[135, 135, 135, 135])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f0fdf4')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#86efac')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#bbf7d0')),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 12))

    # Category Table
    story.append(Paragraph("Vehicle Category Emission Breakdown", section_heading))
    cat_rows = [[
        Paragraph("<b>Category</b>", cell_style_bold),
        Paragraph("<b>Count</b>", cell_style_bold),
        Paragraph("<b>VKT (km)</b>", cell_style_bold),
        Paragraph("<b>CO2 Factor</b>", cell_style_bold),
        Paragraph("<b>CO2 (kg)</b>", cell_style_bold),
        Paragraph("<b>NOx (kg)</b>", cell_style_bold),
        Paragraph("<b>Traffic %</b>", cell_style_bold)
    ]]

    for cat in categories:
        if cat.get('count', 0) > 0:
            cat_rows.append([
                Paragraph(cat.get('category'), cell_style),
                Paragraph(str(cat.get('count')), cell_style),
                Paragraph(f"{cat.get('vkt', 0):,.0f}", cell_style),
                Paragraph(f"{cat.get('co2Factor', 0)} kg/km", cell_style),
                Paragraph(f"{cat.get('co2Kg', 0):,.2f}", cell_style),
                Paragraph(f"{cat.get('noxKg', 0):.4f}", cell_style),
                Paragraph(f"{cat.get('trafficShare', 0)}%", cell_style)
            ])

    cat_table = Table(cat_rows, colWidths=[150, 50, 75, 80, 75, 65, 45])
    cat_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e5e7eb')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#9ca3af')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
        ('PADDING', (0, 0), (-1, -1), 4),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')])
    ]))
    story.append(cat_table)
    story.append(Spacer(1, 12))

    # Methodology & Disclaimer
    story.append(Paragraph("Scientific Lineage & Statutory Transparency", section_heading))
    method_text = (
        "<b>Emission Factor Standards:</b> On-road emission factors reference Automotive Research Association of India (ARAI) "
        "and Central Pollution Control Board (CPCB) verified emission databases. "
        "<b>Axle Disclaimer:</b> Standard COCO vision models classify heavy commercial vehicles generically as 'Truck'. "
        "Specific multi-axle freight classifications default to 2-Axle Truck and can be verified via axle induction sensors."
    )
    story.append(Paragraph(method_text, sub_header_style))

    doc.build(story)
    return buffer.getvalue()

