"""
End-to-End Test Suite for TollTrack AI Vehicle Detection & Emission Pipeline
Tests:
  1. Module imports and YOLO model initialization
  2. Image handling (multipart and base64)
  3. Classification & Axle mapping
  4. Emission calculation (verified ARAI/CPCB factors)
  5. Report generation (CSV & PDF)
  6. Flask API endpoints
"""

import os
import sys
import numpy as np

# Ensure dependencies path
for extra_path in [
    os.path.expanduser(r'~\miniconda3\Lib\site-packages'),
    r'C:\Users\kiran kumar\miniconda3\Lib\site-packages',
]:
    if os.path.isdir(extra_path) and extra_path not in sys.path:
        sys.path.insert(0, extra_path)

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

import cv2
from detector import detector_instance
from classifier import map_coco_class, aggregate_counts_by_category, VALID_TOLLTRACK_CATEGORIES
from calculator import calculate_ai_emissions, EMISSION_FACTORS
from report_generator import generate_csv_report, generate_pdf_report
from image_handler import encode_image_to_base64, decode_base64_image
from app import app


def test_model_loading():
    print("[1/6] Testing YOLO Model Loading...")
    ready, err = detector_instance.is_ready()
    assert ready, f"YOLO model failed to load: {err}"
    print(f"      Model loaded: {detector_instance.model_name} (Ready: {ready})")


def test_classification_mapping():
    print("[2/6] Testing Category Mapping & Axle Disclaimer...")
    assert map_coco_class('car')['mapped_category'] == 'Car / Jeep / Van'
    assert map_coco_class('bus')['mapped_category'] == 'Bus'
    assert map_coco_class('truck')['mapped_category'] == '2-Axle Truck'
    assert map_coco_class('truck')['requires_manual_refinement'] == True
    assert map_coco_class('motorcycle')['mapped_category'] == 'Motorcycle / 2-Wheeler'
    print("      All COCO vehicle classes correctly mapped to TollTrack categories.")


def test_emission_calculator():
    print("[3/6] Testing ARAI/CPCB Emission Calculation...")
    # Test sample counts: 10 Cars, 2 Buses, 3 2-Axle Trucks at 50 km distance
    sample_counts = {
        'Car / Jeep / Van': 10,
        'Bus': 2,
        '2-Axle Truck': 3
    }
    dist = 50.0
    res = calculate_ai_emissions(sample_counts, dist)
    
    # VKT = 10*50 + 2*50 + 3*50 = 500 + 100 + 150 = 750 km
    expected_vkt = 750.0
    assert abs(res['totals']['vehicleKm'] - expected_vkt) < 0.01

    # Car CO2: 500 * 0.148 = 74.0 kg
    # Bus CO2: 100 * 0.790 = 79.0 kg
    # Truck CO2: 150 * 0.680 = 102.0 kg
    # Total CO2: 74 + 79 + 102 = 255.0 kg
    expected_co2 = 255.0
    assert abs(res['totals']['co2Kg'] - expected_co2) < 0.1, f"Expected {expected_co2}, got {res['totals']['co2Kg']}"

    print(f"      Emission Calculation Verified: {res['totals']['vehicleCount']} vehicles, {res['totals']['vehicleKm']} VKT, {res['totals']['co2Kg']} kg CO2, {res['totals']['noxKg']} kg NOx.")


def test_image_handling():
    print("[4/6] Testing Image Encoding / Decoding...")
    # Create synthetic test frame (800x600 BGR)
    test_img = np.zeros((600, 800, 3), dtype=np.uint8)
    test_img[:] = (200, 200, 200) # light gray background
    
    data_url = encode_image_to_base64(test_img, format='JPEG')
    assert data_url.startswith("data:image/jpeg;base64,")
    
    decoded_img, err = decode_base64_image(data_url)
    assert err is None
    assert decoded_img.shape == (600, 800, 3)
    print("      Base64 encode/decode verified successfully.")


def test_reports():
    print("[5/6] Testing PDF and CSV Generation...")
    sample_counts = {'Car / Jeep / Van': 5, '2-Axle Truck': 2}
    em = calculate_ai_emissions(sample_counts, 50)
    sample_dets = [
        {'id': 'det_1', 'raw_class': 'car', 'category': 'Car / Jeep / Van', 'confidence_pct': 94.5, 'box': {'x1': 10, 'y1': 10, 'x2': 100, 'y2': 100}},
        {'id': 'det_2', 'raw_class': 'truck', 'category': '2-Axle Truck', 'confidence_pct': 88.2, 'box': {'x1': 120, 'y1': 50, 'x2': 250, 'y2': 200}}
    ]
    
    csv_str = generate_csv_report(sample_dets, em)
    assert "TOLLTRACK - AI VEHICLE DETECTION & EMISSION AUDIT REPORT" in csv_str
    assert "Car / Jeep / Van" in csv_str

    pdf_bytes = generate_pdf_report(sample_dets, em)
    assert len(pdf_bytes) > 2000
    assert pdf_bytes.startswith(b'%PDF')
    print(f"      CSV and PDF generation verified ({len(pdf_bytes)} bytes PDF).")


def test_flask_endpoints():
    print("[6/6] Testing Flask API Routes...")
    client = app.test_client()

    # 1. Health check
    h_res = client.get('/api/health')
    assert h_res.status_code == 200
    h_data = h_res.get_json()
    assert h_data['model_loaded'] == True

    # 2. Recalculate
    c_res = client.post('/api/calculate', json={
        'category_counts': {'Bus': 3, 'Car / Jeep / Van': 5},
        'distance': 60
    })
    assert c_res.status_code == 200
    c_data = c_res.get_json()
    assert c_data['success'] == True
    assert c_data['emissions']['assumedDistanceKm'] == 60

    # 3. PDF export endpoint
    p_res = client.post('/api/export-pdf', json={
        'detections': [],
        'emissions': c_data['emissions']
    })
    assert p_res.status_code == 200
    assert p_res.mimetype == 'application/pdf'

    # 4. CSV export endpoint
    csv_res = client.post('/api/export-csv', json={
        'detections': [],
        'emissions': c_data['emissions']
    })
    assert csv_res.status_code == 200
    assert csv_res.mimetype == 'text/csv'

    print("      All Flask endpoints (/api/health, /api/calculate, /api/export-pdf, /api/export-csv) passed.")


if __name__ == '__main__':
    print("=================================================================")
    print(" TOLLTRACK AI VEHICLE DETECTION & EMISSION PIPELINE TEST SUITE")
    print("=================================================================")
    test_model_loading()
    test_classification_mapping()
    test_emission_calculator()
    test_image_handling()
    test_reports()
    test_flask_endpoints()
    print("=================================================================")
    print(" ALL 6 TEST PHASES PASSED WITH 100% SUCCESS!")
    print("=================================================================")

