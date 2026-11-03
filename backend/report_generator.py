"""
Report Generation Module for TollTrack AI Detection
Generates:
1. CSV report of vehicle detections & emission quantification
2. High-quality PDF report using ReportLab with complete scientific lineage
"""

import io
import csv
import os
import sys
from datetime import datetime

# Ensure site-packages with reportlab are accessible
for extra_path in [
    os.path.expanduser(r'~\miniconda3\Lib\site-packages'),
    r'C:\Users\kiran kumar\miniconda3\Lib\site-packages',
]:
    if os.path.isdir(extra_path) and extra_path not in sys.path:
        sys.path.insert(0, extra_path)

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

    output = io.StringIO()
    writer = csv.writer(output)

    # Header metadata
    writer.writerow(["TOLLTRACK - AI VEHICLE DETECTION & EMISSION AUDIT REPORT"])
    writer.writerow(["Location", "Chokkenahalli Toll Plaza, Km 61+500, NH-48, Kyathsandra, Tumakuru, Karnataka"])
    writer.writerow(["Analysis Timestamp", date_str])
    writer.writerow(["Assumed Travel Distance (km)", distance_km])
    writer.writerow(["Data Source Lineage", "AI Image Detection Snapshot (Isolated from FASTag Baseline)"])
    writer.writerow([])

    # Executive Totals
    writer.writerow(["--- EXECUTIVE SUMMARY ---"])
    writer.writerow(["Metric", "Value", "Unit"])
    writer.writerow(["Total Detected Vehicles", totals.get('vehicleCount', 0), "vehicles"])
    writer.writerow(["Total Vehicle Kilometres (VKT)", totals.get('vehicleKm', 0), "km"])
    writer.writerow(["Total CO2 Emissions", totals.get('co2Kg', 0), "kg"])
    writer.writerow(["Total CO2 Emissions", totals.get('co2Tonnes', 0), "tonnes"])
    writer.writerow(["Total NOx Emissions", totals.get('noxKg', 0), "kg"])
    writer.writerow(["Total PCU (Passenger Car Units)", totals.get('totalPcu', 0), "PCU"])
    writer.writerow(["Annual Tree Offset Equivalent", totals.get('treesNeeded', 0), "trees"])
    writer.writerow([])

    # Category Breakdown
    writer.writerow(["--- CATEGORY-WISE EMISSION QUANTIFICATION ---"])
    writer.writerow([
        "Category",
        "Count",
        "Traffic Share (%)",
        "Assumed Dist (km)",
        "VKT (km)",
        "CO2 Factor (kg/km)",
        "CO2 Emissions (kg)",
        "CO2 Emissions (t)",
        "CO2 Share (%)",
        "NOx Factor (g/km)",
        "NOx Emissions (kg)",
        "NOx Share (%)",
        "Standard & Source"
    ])

    for cat in emission_results.get('categories', []):
        writer.writerow([
            cat.get('category'),
            cat.get('count', 0),
            f"{cat.get('trafficShare', 0)}%",
            cat.get('distanceKm', distance_km),
            cat.get('vkt', 0),
            cat.get('co2Factor', 0),
            cat.get('co2Kg', 0),
            cat.get('co2Tonnes', 0),
            f"{cat.get('co2Share', 0)}%",
            cat.get('noxFactor', 0),
            cat.get('noxKg', 0),
            f"{cat.get('noxShare', 0)}%",
            f"{cat.get('emissionStandard', 'BS-IV/BS-VI')} ({cat.get('source', 'ARAI/CPCB')})"
        ])
    writer.writerow([])

    # Individual Detections Table
    writer.writerow(["--- INDIVIDUAL AI VEHICLE DETECTIONS ---"])
    writer.writerow(["Detection ID", "YOLO Raw Class", "Mapped Category", "Confidence (%)", "Bounding Box [x1, y1, x2, y2]"])
    for det in detections:
        box = det.get('box', {})
        box_str = f"[{box.get('x1', 0)}, {box.get('y1', 0)}, {box.get('x2', 0)}, {box.get('y2', 0)}]"
        writer.writerow([
            det.get('id', ''),
            det.get('raw_class', ''),
            det.get('category', ''),
            f"{det.get('confidence_pct', 0)}%",
            box_str
        ])
    writer.writerow([])

    # Methodology Notes
    writer.writerow(["--- METHODOLOGY & SCIENTIFIC CITATIONS ---"])
    writer.writerow(["ARAI / CPCB Standards", "Automotive Research Association of India & Central Pollution Control Board (2021)"])
    writer.writerow(["VKT Formulation", "VKT = Detected Vehicle Count x Assumed Travel Distance (km)"])
    writer.writerow(["CO2 Formulation", "CO2 (kg) = VKT x Emission Factor (kg/km)"])
    writer.writerow(["NOx Formulation", "NOx (kg) = VKT x Emission Factor (g/km) / 1000"])
    writer.writerow(["Axle Note", "Standard YOLO COCO models detect generic trucks; multi-axle distinctions require manual verification."])

    return output.getvalue()


def generate_pdf_report(detections: list, emission_results: dict, analysis_date: str = None) -> bytes:
    """
    Generates a professional PDF report using ReportLab.
    Returns bytes of the generated PDF file.
    """
    if not REPORTLAB_AVAILABLE:
        raise RuntimeError("ReportLab library is required for PDF export.")

    date_str = analysis_date or datetime.now().strftime("%d %b %Y, %I:%M %p")
    distance_km = emission_results.get('assumedDistanceKm', 50)
    totals = emission_results.get('totals', {})

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    c_primary = colors.HexColor("#065f46")   # Emerald 800
    c_secondary = colors.HexColor("#0f766e") # Teal 700
    c_dark = colors.HexColor("#0f172a")      # Slate 900
    c_muted = colors.HexColor("#64748b")     # Slate 500
    c_bg = colors.HexColor("#f8fafc")        # Slate 50
    c_border = colors.HexColor("#cbd5e1")    # Slate 300
    c_amber_bg = colors.HexColor("#fffbeb")  # Amber 50
    c_amber_border = colors.HexColor("#f59e0b")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=c_primary,
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=c_muted,
        spaceAfter=12
    )

    h2_style = ParagraphStyle(
        'Heading2Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=c_dark,
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=c_dark
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#92400e")
    )

    story = []

    # Title & Header
    story.append(Paragraph("TollTrack – AI Vehicle Detection & Emission Analysis", title_style))
    story.append(Paragraph(
        "Scientific Road Transport Emission Quantification Report | Chokkenahalli Toll Plaza (Km 61+500, NH-48, Karnataka)",
        subtitle_style
    ))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_primary, spaceBefore=0, spaceAfter=10))

    # Metadata & Data Source Separation Disclaimer
    disclaimer_text = (
        "<b>DATA SOURCE SEPARATION NOTICE:</b> This analysis was performed on an image snapshot captured via AI vision detection. "
        "Vehicle counts represent strictly visible vehicles in this single frame and are isolated from Chokkenahalli's official "
        "FASTag monthly traffic baseline (~37,277 AADT). Pretrained YOLO models detect general vehicle types; standard vision weights "
        "cannot distinguish axle configurations without manual classification."
    )
    disclaimer_table = Table([[Paragraph(disclaimer_text, callout_style)]], colWidths=[540])
    disclaimer_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_amber_bg),
        ('BOX', (0, 0), (-1, -1), 1, c_amber_border),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(disclaimer_table)
    story.append(Spacer(1, 10))

    # Key Performance Indicators Table
    story.append(Paragraph("Executive Summary & Core KPIs", h2_style))
    kpi_data = [
        ["Total Detected Vehicles", f"{totals.get('vehicleCount', 0)} units", "Assumed Distance", f"{distance_km} km"],
        ["Vehicle Kilometres (VKT)", f"{totals.get('vehicleKm', 0):,.1f} km", "Total PCU", f"{totals.get('totalPcu', 0):,.1f} PCU"],
        ["Total CO2 Emissions", f"{totals.get('co2Kg', 0):,.2f} kg ({totals.get('co2Tonnes', 0):,.4f} t)", "Trees Offset Equiv.", f"{totals.get('treesNeeded', 0):,.1f} trees/yr"],
        ["Total NOx Emissions", f"{totals.get('noxKg', 0):,.4f} kg ({totals.get('noxGrams', 0):,.1f} g)", "Analysis Timestamp", date_str]
    ]
    kpi_table = Table(kpi_data, colWidths=[140, 130, 140, 130])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_bg),
        ('BOX', (0, 0), (-1, -1), 1, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_border),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8.5),
        ('TEXTCOLOR', (0, 0), (-1, -1), c_dark),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(kpi_table)
    story.append(Spacer(1, 12))

    # Category Breakdown Table
    story.append(Paragraph("Category-Wise Vehicle & Emission Breakdown", h2_style))
    cat_headers = [
        "Vehicle Category", "Count", "VKT (km)", "CO2 (kg)", "CO2 (t)", "NOx (kg)", "CO2 Factor", "NOx Factor"
    ]
    cat_rows = [cat_headers]

    for cat in emission_results.get('categories', []):
        if cat.get('count', 0) > 0:
            cat_rows.append([
                cat.get('category'),
                str(cat.get('count', 0)),
                f"{cat.get('vkt', 0):,.1f}",
                f"{cat.get('co2Kg', 0):,.2f}",
                f"{cat.get('co2Tonnes', 0):,.3f}",
                f"{cat.get('noxKg', 0):,.3f}",
                f"{cat.get('co2Factor', 0)} kg/km",
                f"{cat.get('noxFactor', 0)} g/km"
            ])

    if len(cat_rows) == 1:
        cat_rows.append(["No vehicles detected in uploaded snapshot", "0", "0", "0", "0", "0", "-", "-"])
    else:
        # Append totals row
        cat_rows.append([
            "TOTAL / FLEET SUM",
            str(totals.get('vehicleCount', 0)),
            f"{totals.get('vehicleKm', 0):,.1f}",
            f"{totals.get('co2Kg', 0):,.2f}",
            f"{totals.get('co2Tonnes', 0):,.3f}",
            f"{totals.get('noxKg', 0):,.3f}",
            "-",
            "-"
        ])

    breakdown_table = Table(cat_rows, colWidths=[120, 45, 65, 65, 55, 55, 65, 70])
    breakdown_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('BOX', (0, 0), (-1, -1), 1, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_border),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        # Highlight total row
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor("#e2e8f0")),
    ]))
    story.append(breakdown_table)
    story.append(Spacer(1, 12))

    # Methodology & Scientific Sources Box
    method_box = [
        ["Scientific Formulation & Statutory Standards", "Reference Citations"],
        [
            Paragraph(
                "• <b>VKT:</b> Count × Assumed Distance (Default: 50 km)<br/>"
                "• <b>CO2 (kg):</b> VKT × ARAI Factor (kg/km)<br/>"
                "• <b>NOx (kg):</b> VKT × CPCB Factor (g/km) / 1000<br/>"
                "• <b>Axle Limitation:</b> Standard YOLO COCO classes do not separate axle counts.",
                body_style
            ),
            Paragraph(
                "• ARAI Modified Indian Driving Cycle (MIDC) Database (2021)<br/>"
                "• CPCB Comprehensive Air Pollution Emission Inventory (2021)<br/>"
                "• India GHG Program Road Transport Guidance (WRI / CII / TERI)<br/>"
                "• MoRTH & NHAI National Fee Rules (2008)",
                body_style
            )
        ]
    ]
    method_table = Table(method_box, colWidths=[270, 270])
    method_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#334155")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOX', (0, 0), (-1, -1), 1, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_border),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(KeepTogether([
        Paragraph("Scientific Methodology & Environmental Data Lineage", h2_style),
        method_table
    ]))

    doc.build(story)
    return buffer.getvalue()
