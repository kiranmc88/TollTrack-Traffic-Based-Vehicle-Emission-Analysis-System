"""
Flask Backend for TollTrack AI Vehicle Detection & Emission Calculator
Port: 5000 (Default)
Cross-Origin: Enabled for Vite frontend
"""

import os
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from datetime import datetime
from flask import Flask, request, jsonify, send_file, Response, make_response
from flask_cors import CORS
import io

# Import modular backend components
from image_handler import (
    read_uploaded_file, decode_base64_image, encode_image_to_base64
)
from detector import detector_instance
from classifier import (
    VALID_TOLLTRACK_CATEGORIES,
    aggregate_counts_by_category,
    AXLE_CLASSIFICATION_DISCLAIMER
)
from calculator import calculate_ai_emissions, DEFAULT_DISTANCE_KM
from report_generator import generate_csv_report, generate_pdf_report

app = Flask(__name__)
# Robust CORS configuration for Vite dev server, previews, and direct browser requests
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=False)


@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, HEAD'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept'
    return response


@app.route('/', methods=['GET'])
def root_index():
    """Root endpoint for status check and deployment validation."""
    return jsonify({
        'name': 'TollTrack AI Vehicle Detection & Emission Calculator API',
        'status': 'online',
        'health_check': '/api/health',
        'endpoints': {
            'health': '/api/health',
            'detect': '/api/detect',
            'export_pdf': '/api/export-pdf',
            'export_csv': '/api/export-csv'
        },
        'timestamp': datetime.now().isoformat()
    }), 200


@app.route('/api', methods=['GET'])
def api_index():
    return root_index()


@app.route('/api/<path:subpath>', methods=['OPTIONS'])
def handle_options(subpath):
    response = make_response('', 204)
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, HEAD'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept'
    return response


@app.route('/api/health', methods=['GET', 'HEAD'])
def health_check():
    """
    Health check endpoint returning system status and YOLO model availability.
    Returns:
      {
        "status": "healthy" | "degraded",
        "backend": "TollTrack AI Python Backend",
        "yolo_model": "yolov8n.pt",
        "model_loaded": true | false,
        "model_error": "...",
        "ai_ready": true | false
      }
    """
    model_ready, model_err = detector_instance.is_ready()
    status_str = "healthy" if model_ready else "degraded"

    return jsonify({
        'status': status_str,
        'backend': 'TollTrack AI Python Backend',
        'yolo_model': detector_instance.model_name,
        'model_loaded': bool(model_ready),
        'model_error': str(model_err) if model_err else "",
        'ai_ready': bool(model_ready),
        'supported_categories': VALID_TOLLTRACK_CATEGORIES,
        'axle_disclaimer': AXLE_CLASSIFICATION_DISCLAIMER,
        'timestamp': datetime.now().isoformat()
    }), 200


@app.route('/api/detect', methods=['POST'])
def detect_vehicles_endpoint():
    """
    Analyzes an uploaded image or camera snapshot with YOLO.
    Accepts:
      - Multipart/form-data: 'image' file, optional 'distance'
      - JSON: {'image': 'data:image/...', 'distance': 50}
    Returns:
      Original image base64, annotated image base64, detection list,
      category counts, emissions calculated at assumed distance.
    """
    try:
        distance_km = DEFAULT_DISTANCE_KM
        cv2_img = None
        error_msg = None

        # Handle Multipart Form Data
        if 'image' in request.files:
            file_storage = request.files['image']
            cv2_img, filename, error_msg = read_uploaded_file(file_storage)
            if 'distance' in request.form:
                try:
                    distance_km = float(request.form['distance'])
                except (ValueError, TypeError):
                    distance_km = DEFAULT_DISTANCE_KM

        # Handle JSON Base64 Payload (Webcam / Canvas snapshot)
        elif request.is_json:
            data = request.get_json() or {}
            base64_str = data.get('image', '')
            cv2_img, error_msg = decode_base64_image(base64_str)
            if 'distance' in data:
                try:
                    distance_km = float(data['distance'])
                except (ValueError, TypeError):
                    distance_km = DEFAULT_DISTANCE_KM
        else:
            return jsonify({
                'success': False,
                'error': 'Invalid request format. Send multipart/form-data with "image" or JSON with "image" base64.'
            }), 400

        if error_msg or cv2_img is None:
            return jsonify({
                'success': False,
                'error': error_msg or 'Failed to load valid image.'
            }), 400

        # Run AI Vehicle Detection
        try:
            detection_result = detector_instance.detect_vehicles(cv2_img)
        except Exception as det_err:
            return jsonify({
                'success': False,
                'error': f"AI Detection Pipeline error: {str(det_err)}"
            }), 503

        detections = detection_result['detections']
        annotated_cv2 = detection_result['annotated_image']
        category_counts = detection_result['category_counts']

        # Encode both images to Base64 for the frontend
        original_base64 = encode_image_to_base64(cv2_img, format='JPEG', quality=88)
        annotated_base64 = encode_image_to_base64(annotated_cv2, format='JPEG', quality=88)

        # Calculate emissions based on detected counts and assumed distance
        emissions = calculate_ai_emissions(category_counts, distance_km=distance_km)

        return jsonify({
            'success': True,
            'total_detected': len(detections),
            'detections': detections,
            'category_counts': category_counts,
            'assumed_distance_km': distance_km,
            'emissions': emissions,
            'original_image': original_base64,
            'annotated_image': annotated_base64,
            'image_dimensions': detection_result['image_dimensions'],
            'axle_disclaimer': AXLE_CLASSIFICATION_DISCLAIMER,
            'valid_categories': VALID_TOLLTRACK_CATEGORIES,
            'analysis_date': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f"Server error processing vehicle detection: {str(e)}"
        }), 500


@app.route('/api/calculate', methods=['POST'])
def calculate_emissions_endpoint():
    """
    Recalculates emissions given modified category counts or corrected detections.
    Body:
      {
        "category_counts": { "Car / Jeep / Van": 5, "2-Axle Truck": 2, ... },
        "distance": 50
      }
      OR
      {
        "detections": [...],
        "distance": 50
      }
    """
    try:
        data = request.get_json() or {}
        distance_km = float(data.get('distance', DEFAULT_DISTANCE_KM))

        if 'category_counts' in data:
            counts = data['category_counts']
        elif 'detections' in data:
            counts = aggregate_counts_by_category(data['detections'])
        else:
            return jsonify({
                'success': False,
                'error': 'Missing "category_counts" or "detections" in request body.'
            }), 400

        emissions = calculate_ai_emissions(counts, distance_km=distance_km)

        return jsonify({
            'success': True,
            'assumed_distance_km': distance_km,
            'category_counts': counts,
            'emissions': emissions
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f"Error calculating emissions: {str(e)}"
        }), 500


@app.route('/api/export-pdf', methods=['POST'])
def export_pdf_endpoint():
    """
    Generates and returns an environmental PDF audit report.
    Body: { 'detections': [...], 'emissions': {...}, 'analysis_date': '...' }
    """
    try:
        data = request.get_json() or {}
        detections = data.get('detections', [])
        emission_results = data.get('emissions', {})
        analysis_date = data.get('analysis_date') or datetime.now().strftime("%d %b %Y, %I:%M %p")

        pdf_bytes = generate_pdf_report(detections, emission_results, analysis_date)

        response = make_response(pdf_bytes)
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = (
            f'attachment; filename="TollTrack_AI_Emission_Report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf"'
        )
        return response

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f"Failed to generate PDF report: {str(e)}"
        }), 500


@app.route('/api/export-csv', methods=['POST'])
def export_csv_endpoint():
    """
    Generates and returns a CSV file with vehicle detections and emission breakdown.
    Body: { 'detections': [...], 'emissions': {...}, 'analysis_date': '...' }
    """
    try:
        data = request.get_json() or {}
        detections = data.get('detections', [])
        emission_results = data.get('emissions', {})
        analysis_date = data.get('analysis_date') or datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        csv_content = generate_csv_report(detections, emission_results, analysis_date)

        response = make_response(csv_content)
        response.headers['Content-Type'] = 'text/csv'
        response.headers['Content-Disposition'] = (
            f'attachment; filename="TollTrack_AI_Vehicle_Detections_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        )
        return response

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f"Failed to generate CSV export: {str(e)}"
        }), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"================================================================")
    print(f" TollTrack AI Vehicle Detection & Emission Calculator Backend")
    print(f" Running on http://127.0.0.1:{port}")
    print(f" Pretrained YOLO Model: {detector_instance.model_name}")
    print(f"================================================================")
    app.run(host='0.0.0.0', port=port, debug=False)
