"""
Automated Test Suite for TollTrack Hugging Face Space Integration
Tests:
1. Hugging Face Space Model Initialization & ZeroGPU Decorator
2. TollTrack Vehicle Classification & Axle Transparency
3. ARAI/CPCB Emission Calculation Formulas
4. YOLO Detection Pipeline on Test Image
5. Gradio Interface Handler
6. FastAPI REST Endpoints (/api/health, /api/detect, /api/calculate, /api/export-pdf, /api/export-csv)
"""

import os
import sys
import numpy as np

# Add hf_space to path
HF_DIR = os.path.join(os.path.dirname(__file__), 'hf_space')
sys.path.insert(0, HF_DIR)

from classifier import map_coco_class, aggregate_counts_by_category, VALID_TOLLTRACK_CATEGORIES, AXLE_CLASSIFICATION_DISCLAIMER
from calculator import calculate_ai_emissions, EMISSION_FACTORS
from image_handler import encode_image_to_base64, decode_base64_image, cv2_to_pil
from app import (
    yolo_model,
    model_loaded,
    ZEROGPU_AVAILABLE,
    run_detection_pipeline,
    gradio_analyze,
    fastapi_app
)
from fastapi.testclient import TestClient


def test_hf_model_and_zerogpu():
    print("[1/6] Testing Hugging Face Model & ZeroGPU Compatibility...")
    assert model_loaded is True, "YOLO model failed to load in hf_space"
    assert yolo_model is not None
    print(f"      Model loaded: {yolo_model.model_name or 'YOLOv8'} (ZeroGPU Available: {ZEROGPU_AVAILABLE})")


def test_classification_logic():
    print("[2/6] Testing Classification & Axle Disclaimer...")
    assert map_coco_class('car')['mapped_category'] == 'Car / Jeep / Van'
    assert map_coco_class('bus')['mapped_category'] == 'Bus'
    assert map_coco_class('truck')['mapped_category'] == '2-Axle Truck'
    assert map_coco_class('truck')['requires_manual_refinement'] is True
    assert map_coco_class('motorcycle')['mapped_category'] == 'Motorcycle / 2-Wheeler'
    assert "Pretrained YOLO models" in AXLE_CLASSIFICATION_DISCLAIMER
    print("      All COCO vehicle categories and axle limitations verified.")


def test_emissions_formulas():
    print("[3/6] Testing ARAI/CPCB Emission Formulas...")
    sample_counts = {
        'Car / Jeep / Van': 10,
        'Bus': 2,
        '2-Axle Truck': 3
    }
    dist = 50.0
    res = calculate_ai_emissions(sample_counts, dist)

    # 1. VKT check: 10*50 + 2*50 + 3*50 = 750 km
    assert abs(res['totals']['vehicleKm'] - 750.0) < 0.01

    # 2. CO2 check: 500*0.148 + 100*0.790 + 150*0.680 = 74 + 79 + 102 = 255.0 kg
    assert abs(res['totals']['co2Kg'] - 255.0) < 0.01
    assert abs(res['totals']['co2Tonnes'] - 0.255) < 0.0001

    # 3. NOx check: (500*0.28 + 100*6.20 + 150*5.40) / 1000 = (140 + 620 + 810)/1000 = 1570/1000 = 1.57 kg
    assert abs(res['totals']['noxKg'] - 1.57) < 0.01

    print(f"      Formulas Verified: 750 VKT, {res['totals']['co2Kg']} kg CO2, {res['totals']['noxKg']} kg NOx.")


def test_detection_pipeline():
    print("[4/6] Testing YOLO Detection Pipeline on Image...")
    # Create test BGR frame (480x640)
    test_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    test_frame[:] = (180, 180, 180)

    det_result = run_detection_pipeline(test_frame, conf_threshold=0.25)
    assert 'detections' in det_result
    assert 'annotated_image' in det_result
    assert 'category_counts' in det_result
    assert det_result['image_dimensions'] == {'width': 640, 'height': 480}
    print(f"      Pipeline inference executed successfully on test image.")


def test_gradio_ui_handler():
    print("[5/6] Testing Gradio Interface Handler...")
    test_frame = np.zeros((300, 400, 3), dtype=np.uint8)
    pil_img = cv2_to_pil(test_frame)

    annotated_pil, summary_md, json_out = gradio_analyze(pil_img, 50, 0.25)
    assert annotated_pil is not None
    assert "Analysis Results" in summary_md
    assert "totals" in json_out
    print("      Gradio handler returned annotated PIL image, markdown summary, and JSON details.")


def test_fastapi_rest_endpoints():
    print("[6/6] Testing FastAPI REST Endpoints...")
    client = TestClient(fastapi_app)

    # 1. Health check
    h_res = client.get('/api/health')
    assert h_res.status_code == 200
    h_data = h_res.json()
    assert h_data['status'] == 'healthy'
    assert h_data['model_loaded'] is True
    assert h_data['ai_ready'] is True
    assert h_data['backend'] == 'TollTrack AI Hugging Face Backend'
    assert 'zerogpu_available' in h_data

    # 2. Recalculate
    c_res = client.post('/api/calculate', json={
        'category_counts': {'Car / Jeep / Van': 4, 'Bus': 1},
        'distance': 25
    })
    assert c_res.status_code == 200
    c_data = c_res.json()
    assert c_data['success'] is True
    assert c_data['emissions']['assumedDistanceKm'] == 25

    # 3. PDF export
    p_res = client.post('/api/export-pdf', json={
        'detections': [],
        'emissions': c_data['emissions']
    })
    assert p_res.status_code == 200
    assert p_res.headers['content-type'] == 'application/pdf'

    # 4. CSV export
    csv_res = client.post('/api/export-csv', json={
        'detections': [],
        'emissions': c_data['emissions']
    })
    assert csv_res.status_code == 200
    assert 'text/csv' in csv_res.headers['content-type']

    # 5. Image detection endpoint via Base64 JSON
    test_img = np.zeros((300, 400, 3), dtype=np.uint8)
    b64_img = encode_image_to_base64(test_img)
    d_res = client.post('/api/detect', json={
        'image': b64_img,
        'distance': 50
    })
    assert d_res.status_code == 200
    d_data = d_res.json()
    assert d_data['success'] is True
    assert 'detections' in d_data
    assert 'annotated_image' in d_data
    assert 'emissions' in d_data
    assert d_data['annotated_image'].startswith("data:image/jpeg;base64,")

    print("      All FastAPI REST endpoints passed with 100% contract compliance.")


if __name__ == '__main__':
    print("=================================================================")
    print(" TOLLTRACK HUGGING FACE SPACE TEST SUITE")
    print("=================================================================")
    test_hf_model_and_zerogpu()
    test_classification_logic()
    test_emissions_formulas()
    test_detection_pipeline()
    test_gradio_ui_handler()
    test_fastapi_rest_endpoints()
    print("=================================================================")
    print(" ALL 6 HUGGING FACE INTEGRATION TEST PHASES PASSED WITH 100% SUCCESS!")
    print("=================================================================")

