"""
TollTrack AI Vehicle Detection & Emission Calculator
Hugging Face Space Application (FastAPI + Gradio + ZeroGPU Compatible)

Provides:
1. Interactive Gradio Web Interface for standalone testing on Hugging Face.
2. Production REST API (/api/health, /api/detect, /api/calculate, /api/export-*) for TollTrack Vercel Frontend.
3. ZeroGPU Compatibility via @spaces.GPU decorator with automatic CPU fallback.
"""

import os
import sys
import io
import time
from datetime import datetime

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

import numpy as np
import cv2
import torch
from PIL import Image

# Modular imports
from classifier import (
    VALID_TOLLTRACK_CATEGORIES,
    map_coco_class,
    aggregate_counts_by_category,
    AXLE_CLASSIFICATION_DISCLAIMER
)
from calculator import calculate_ai_emissions, DEFAULT_DISTANCE_KM
from image_handler import (
    decode_base64_image,
    encode_image_to_base64,
    pil_to_cv2,
    cv2_to_pil,
    ALLOWED_EXTENSIONS
)
from report_generator import generate_csv_report, generate_pdf_report

# ZeroGPU Defensive Import & Decorator
try:
    import spaces
    ZEROGPU_AVAILABLE = True
except Exception:
    ZEROGPU_AVAILABLE = False
    class spaces:
        @staticmethod
        def GPU(func=None, duration=60):
            if func is None:
                return lambda f: f
            return func

# FastAPI and Gradio
from fastapi import FastAPI, UploadFile, File, Form, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

try:
    import gradio as gr
    GRADIO_AVAILABLE = True
except ImportError:
    GRADIO_AVAILABLE = False
    gr = None

# Category Colors in BGR for OpenCV annotations
CATEGORY_COLORS_BGR = {
    'Car / Jeep / Van': (129, 185, 16),       # Emerald
    'Bus': (246, 92, 139),                    # Purple
    '2-Axle Truck': (11, 158, 245),           # Amber
    '3-Axle Truck': (2, 132, 199),            # Dark Orange
    'Multi-Axle Vehicle / OSV': (69, 10, 245),# Red
    'Mini LCV': (246, 130, 59),               # Sky Blue
    'LCV': (235, 115, 37),                    # Blue
    'Motorcycle / 2-Wheeler': (212, 182, 6),  # Cyan
}

COCO_CLASS_NAMES = {2: 'car', 3: 'motorcycle', 5: 'bus', 7: 'truck'}

# ---------------------------------------------------------------------------
# YOLO Model Loader
# ---------------------------------------------------------------------------
MODEL_NAME = 'yolov8n.pt'
yolo_model = None
model_load_error = None
model_loaded = False


def load_yolo_model():
    """Loads the YOLO model on CPU at startup."""
    global yolo_model, model_load_error, model_loaded
    try:
        from ultralytics import YOLO

        # Check candidate locations
        model_path = MODEL_NAME
        candidates = [
            os.environ.get('YOLO_MODEL_PATH'),
            os.path.join(CURRENT_DIR, MODEL_NAME),
            os.path.join(CURRENT_DIR, '..', MODEL_NAME),
            MODEL_NAME
        ]
        for c in candidates:
            if c and os.path.isfile(c):
                model_path = os.path.abspath(c)
                break

        yolo_model = YOLO(model_path)
        model_loaded = True
        model_load_error = None
        print(f"[TollTrack HF Space] YOLO model '{model_path}' loaded successfully.")
    except Exception as e:
        yolo_model = None
        model_loaded = False
        model_load_error = str(e)
        print(f"[TollTrack HF Space] Failed to load YOLO model: {e}")


# Initialize model at startup
load_yolo_model()


# ---------------------------------------------------------------------------
# ZeroGPU Compatible Inference
# ---------------------------------------------------------------------------
@spaces.GPU(duration=60)
def predict_with_yolo(cv2_img: np.ndarray, conf_threshold: float = 0.25):
    """
    Executes YOLO vehicle detection inside the @spaces.GPU context.
    Uses GPU if dynamically allocated by ZeroGPU; falls back to CPU automatically.
    """
    if yolo_model is None or not model_loaded:
        raise RuntimeError(f"YOLO model is not ready: {model_load_error or 'Weights not loaded'}")

    device = 0 if (torch.cuda.is_available() and torch.cuda.device_count() > 0) else 'cpu'

    # Predict only vehicle classes: 2=car, 3=motorcycle, 5=bus, 7=truck
    results = yolo_model.predict(
        source=cv2_img,
        conf=conf_threshold,
        classes=[2, 3, 5, 7],
        device=device,
        verbose=False
    )
    return results


def run_detection_pipeline(cv2_img: np.ndarray, conf_threshold: float = 0.25):
    """
    Executes detection and draws styled bounding boxes with confidence tags.
    """
    if cv2_img is None or cv2_img.size == 0:
        raise ValueError("Invalid or empty image.")

    h, w = cv2_img.shape[:2]
    results = predict_with_yolo(cv2_img, conf_threshold)

    annotated_img = cv2_img.copy()
    detections = []
    det_idx = 0

    for result in results:
        boxes = result.boxes
        if boxes is None:
            continue

        for box in boxes:
            cls_id = int(box.cls[0].item())
            conf = float(box.conf[0].item())
            xyxy = box.xyxy[0].tolist()
            x1, y1, x2, y2 = [int(v) for v in xyxy]

            raw_name = COCO_CLASS_NAMES.get(cls_id, 'car')
            mapping = map_coco_class(raw_name)
            category = mapping['mapped_category']
            color = CATEGORY_COLORS_BGR.get(category, (129, 185, 16))

            det_obj = {
                'id': f"det_{det_idx}",
                'raw_class': raw_name,
                'category': category,
                'confidence': round(conf, 4),
                'confidence_pct': round(conf * 100, 1),
                'box': {'x1': x1, 'y1': y1, 'x2': x2, 'y2': y2},
                'requires_manual_refinement': mapping['requires_manual_refinement'],
                'manual_note': mapping['classification_note']
            }
            detections.append(det_obj)
            det_idx += 1

            # Draw visual bounding box
            cv2.rectangle(annotated_img, (x1, y1), (x2, y2), color, 2)

            # Label banner
            label = f"{category} ({round(conf * 100)}%)"
            (tw, th), baseline = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)
            label_y = max(y1 - 6, th + 6)
            cv2.rectangle(annotated_img, (x1, label_y - th - 4), (x1 + tw + 6, label_y + baseline - 2), color, -1)
            cv2.putText(annotated_img, label, (x1 + 3, label_y - 2), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv2.LINE_AA)

    category_counts = aggregate_counts_by_category(detections)

    return {
        'detections': detections,
        'annotated_image': annotated_img,
        'total_detected': len(detections),
        'category_counts': category_counts,
        'image_dimensions': {'width': w, 'height': h},
        'axle_disclaimer': AXLE_CLASSIFICATION_DISCLAIMER
    }


# ---------------------------------------------------------------------------
# FastAPI REST API Setup (Provides Full Backend for TollTrack Frontend)
# ---------------------------------------------------------------------------
fastapi_app = FastAPI(
    title="TollTrack AI Vehicle Detection & Emission Calculator API",
    description="Hugging Face Space Backend for TollTrack traffic emission analysis."
)

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@fastapi_app.get("/api/health")
@fastapi_app.head("/api/health")
async def health_endpoint():
    """
    Health check endpoint returning YOLO readiness and ZeroGPU status.
    Directly consumed by TollTrack React frontend on Vercel.
    """
    status_str = "healthy" if model_loaded else "degraded"
    return JSONResponse(
        content={
            "status": status_str,
            "backend": "TollTrack AI Hugging Face Backend",
            "yolo_model": MODEL_NAME,
            "model_loaded": bool(model_loaded),
            "model_error": str(model_load_error) if model_load_error else "",
            "ai_ready": bool(model_loaded),
            "zerogpu_available": ZEROGPU_AVAILABLE,
            "supported_categories": VALID_TOLLTRACK_CATEGORIES,
            "axle_disclaimer": AXLE_CLASSIFICATION_DISCLAIMER,
            "timestamp": datetime.now().isoformat()
        },
        status_code=200
    )


@fastapi_app.post("/api/detect")
async def detect_endpoint(request: Request):
    """
    Vehicle detection and emission quantification endpoint.
    Accepts both multipart/form-data and JSON with base64 image.
    """
    distance_km = DEFAULT_DISTANCE_KM
    cv2_img = None
    err = None

    content_type = request.headers.get("content-type", "")

    if "multipart/form-data" in content_type:
        form = await request.form()
        image_file = form.get("image")
        if not image_file:
            return JSONResponse({"success": False, "error": "No image file provided in multipart form."}, status_code=400)

        file_bytes = await image_file.read()
        pil_img = Image.open(io.BytesIO(file_bytes))
        cv2_img = pil_to_cv2(pil_img)

        dist_val = form.get("distance")
        if dist_val:
            try:
                distance_km = float(dist_val)
            except Exception:
                distance_km = DEFAULT_DISTANCE_KM
    elif "application/json" in content_type:
        body = await request.json()
        b64_str = body.get("image", "")
        cv2_img, err = decode_base64_image(b64_str)
        if body.get("distance"):
            try:
                distance_km = float(body["distance"])
            except Exception:
                distance_km = DEFAULT_DISTANCE_KM
    else:
        return JSONResponse({"success": False, "error": "Content-Type must be multipart/form-data or application/json."}, status_code=400)

    if err or cv2_img is None:
        return JSONResponse({"success": False, "error": err or "Failed to load image."}, status_code=400)

    try:
        det_result = run_detection_pipeline(cv2_img)
    except Exception as e:
        return JSONResponse({"success": False, "error": f"AI inference failed: {str(e)}"}, status_code=503)

    detections = det_result['detections']
    annotated_cv2 = det_result['annotated_image']
    category_counts = det_result['category_counts']

    orig_b64 = encode_image_to_base64(cv2_img, format='JPEG', quality=88)
    annot_b64 = encode_image_to_base64(annotated_cv2, format='JPEG', quality=88)
    emissions = calculate_ai_emissions(category_counts, distance_km=distance_km)

    return JSONResponse({
        "success": True,
        "total_detected": len(detections),
        "detections": detections,
        "category_counts": category_counts,
        "assumed_distance_km": distance_km,
        "emissions": emissions,
        "original_image": orig_b64,
        "annotated_image": annot_b64,
        "image_dimensions": det_result['image_dimensions'],
        "axle_disclaimer": AXLE_CLASSIFICATION_DISCLAIMER
    })


@fastapi_app.post("/api/calculate")
async def calculate_endpoint(request: Request):
    """Recalculates emissions given modified category counts and distance."""
    body = await request.json()
    counts = body.get("category_counts", {})
    dist = float(body.get("distance", DEFAULT_DISTANCE_KM))
    emissions = calculate_ai_emissions(counts, distance_km=dist)
    return JSONResponse({"success": True, "emissions": emissions})


@fastapi_app.post("/api/export-pdf")
async def export_pdf_endpoint(request: Request):
    """Generates PDF audit certificate."""
    data = await request.json()
    detections = data.get("detections", [])
    emissions = data.get("emissions", {})
    date_str = data.get("analysis_date")
    pdf_bytes = generate_pdf_report(detections, emissions, date_str)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="TollTrack_Report_{int(time.time())}.pdf"'}
    )


@fastapi_app.post("/api/export-csv")
async def export_csv_endpoint(request: Request):
    """Generates CSV report."""
    data = await request.json()
    detections = data.get("detections", [])
    emissions = data.get("emissions", {})
    date_str = data.get("analysis_date")
    csv_str = generate_csv_report(detections, emissions, date_str)
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="TollTrack_Detections_{int(time.time())}.csv"'}
    )


# ---------------------------------------------------------------------------
# Gradio Web Interface (for direct interaction on Hugging Face)
# ---------------------------------------------------------------------------
def gradio_analyze(image_input, distance_km, conf_threshold):
    """Gradio handler for vehicle detection and emission analysis."""
    if image_input is None:
        return None, "Please upload or capture an image.", ""

    # Convert PIL Image to cv2
    cv2_img = pil_to_cv2(image_input)

    try:
        det_result = run_detection_pipeline(cv2_img, conf_threshold=conf_threshold)
    except Exception as e:
        return None, f"Detection Error: {str(e)}", ""

    annotated_cv2 = det_result['annotated_image']
    annotated_pil = cv2_to_pil(annotated_cv2)
    detections = det_result['detections']
    counts = det_result['category_counts']

    emissions = calculate_ai_emissions(counts, distance_km=distance_km)
    totals = emissions['totals']

    # Markdown Summary
    summary_md = f"""### 📊 Analysis Results
* **Total Detected Vehicles:** **{totals['vehicleCount']}** units
* **Assumed Distance:** **{distance_km} km**
* **Vehicle Kilometres (VKT):** **{totals['vehicleKm']:,} km**
* **Total CO₂ Emissions:** **{totals['co2Kg']:.2f} kg** ({totals['co2Tonnes']:.4f} Tonnes)
* **Total NOₓ Emissions:** **{totals['noxKg']:.4f} kg** ({totals['noxGrams']:.2f} grams)
* **Tree Offsets Needed:** **{totals['treesNeeded']} mature trees**
* **Fuel Equivalent:** **{totals['dieselEquivLiters']} liters diesel**

#### 🚗 Detected Categories:
| Category | Count | CO₂ (kg) | NOₓ (kg) | Traffic Share |
| :--- | :---: | :---: | :---: | :---: |
"""
    for cat in emissions['categories']:
        if cat['count'] > 0:
            summary_md += f"| **{cat['category']}** | {cat['count']} | {cat['co2Kg']:.2f} kg | {cat['noxKg']:.4f} kg | {cat['trafficShare']}% |\n"

    summary_md += f"\n> ℹ️ *{AXLE_CLASSIFICATION_DISCLAIMER}*"

    # Detailed JSON output
    json_out = {
        'total_detected': len(detections),
        'counts': counts,
        'totals': totals,
        'detections': detections
    }

    return annotated_pil, summary_md, json_out


demo = None
if GRADIO_AVAILABLE and gr is not None:
    with gr.Blocks(title="TollTrack AI Vehicle Detection & Emission Calculator", theme=gr.themes.Soft(primary_hue="emerald")) as demo:
        gr.Markdown("""
        # 🚗 TollTrack: AI Vehicle Detection & Emission Calculator
        ### Automated Traffic Emission Quantification for National Highway Toll Plazas
        *Powered by YOLOv8 vision detection with ARAI and CPCB scientific emission benchmarks.*
        """)

        with gr.Row():
            with gr.Column(scale=1):
                image_in = gr.Image(type="pil", label="Upload Highway Traffic Image or Snapshot")
                with gr.Row():
                    distance_slider = gr.Slider(minimum=5, maximum=200, value=50, step=5, label="Assumed Travel Distance (km)")
                    conf_slider = gr.Slider(minimum=0.10, maximum=0.90, value=0.25, step=0.05, label="YOLO Confidence Threshold")
                analyze_btn = gr.Button("🔍 Analyze Traffic & Quantify Emissions", variant="primary")

            with gr.Column(scale=1):
                image_out = gr.Image(type="pil", label="AI Annotated Detection Output")
                results_md = gr.Markdown(label="Emission Quantification Summary")

        with gr.Accordion("📋 Raw Detection JSON", open=False):
            json_display = gr.JSON(label="Detailed Detection Payload")

        analyze_btn.click(
            fn=gradio_analyze,
            inputs=[image_in, distance_slider, conf_slider],
            outputs=[image_out, results_md, json_display]
        )

        gr.Markdown("""
        ---
        **API Integration Note:** This Space also acts as a public REST API for the [TollTrack Vercel Web Application](https://github.com/kiranmc88/TollTrack-Traffic-Based-Vehicle-Emission-Analysis-System).
        Set `VITE_AI_API_URL=https://<your-username>-<space-name>.hf.space` in your Vercel project environment variables to connect.
        """)

    # Mount Gradio app on FastAPI at root "/"
    app = gr.mount_gradio_app(fastapi_app, demo, path="/")
else:
    # If running in environment without gradio installed, expose pure FastAPI REST API
    app = fastapi_app

if __name__ == '__main__':
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    print(f"Starting TollTrack Hugging Face Space on port {port}...")
    uvicorn.run(app, host='0.0.0.0', port=port)

