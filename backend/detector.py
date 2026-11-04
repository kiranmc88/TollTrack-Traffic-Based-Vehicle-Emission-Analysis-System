"""
YOLO Pretrained Vehicle Detection Module using Ultralytics & OpenCV
Detects: Cars, Motorcycles, Buses, and Trucks in input images.
Draws scientific annotations with bounding boxes, labels, and confidence percentages.
Strictly adheres to real AI inference - NEVER returns fabricated detections.
"""

import os
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

import cv2
import numpy as np
from classifier import map_coco_class, AXLE_CLASSIFICATION_DISCLAIMER

# Category color palette (BGR format for OpenCV)
CATEGORY_COLORS_BGR = {
    'Car / Jeep / Van': (129, 185, 16),       # Emerald
    'Bus': (246, 92, 139),                    # Purple
    '2-Axle Truck': (11, 158, 245),           # Amber / Orange
    '3-Axle Truck': (2, 132, 199),            # Dark Orange
    'Multi-Axle Vehicle / OSV': (69, 10, 245),# Red-Orange
    'Mini LCV': (246, 130, 59),               # Sky Blue
    'LCV': (235, 115, 37),                    # Blue
    'Motorcycle / 2-Wheeler': (212, 182, 6),  # Cyan
}

# Target COCO class names and IDs
# 2: car, 3: motorcycle, 5: bus, 7: truck
VEHICLE_COCO_CLASSES = {'car', 'motorcycle', 'bus', 'truck'}
VEHICLE_COCO_IDS = {2, 3, 5, 7}


def resolve_model_path(model_name: str = 'yolov8n.pt') -> str:
    """
    Resolves the YOLO model path reliably across local, Docker, and Render environments.
    Checks:
      1. YOLO_MODEL_PATH environment variable (if set and file exists)
      2. Repository root (parent of backend/): os.path.join(CURRENT_DIR, '..', model_name)
      3. backend/ directory: os.path.join(CURRENT_DIR, model_name)
      4. Current working directory: os.path.join(os.getcwd(), model_name)
      5. Standard model name for Ultralytics cache lookup or auto-download
    """
    env_path = os.environ.get('YOLO_MODEL_PATH')
    if env_path:
        for candidate in [env_path, os.path.join(CURRENT_DIR, env_path), os.path.join(os.getcwd(), env_path)]:
            if os.path.isfile(candidate):
                return os.path.abspath(candidate)

    candidates = [
        os.path.join(CURRENT_DIR, '..', model_name),
        os.path.join(CURRENT_DIR, model_name),
        os.path.join(os.getcwd(), model_name),
    ]
    for candidate in candidates:
        if os.path.isfile(candidate):
            return os.path.abspath(candidate)

    # Standard model name for Ultralytics cache lookup or automatic download
    return model_name


class VehicleDetector:
    def __init__(self, model_name: str = 'yolov8n.pt', confidence_threshold: float = 0.25):
        self.model_name = model_name
        self.confidence_threshold = confidence_threshold
        self.resolved_model_path = None
        self.model = None
        self.model_loaded = False
        self.load_error = None
        # Load exactly once at startup
        self._init_model()

    def _init_model(self):
        """Attempts to load the YOLO model once at startup."""
        try:
            from ultralytics import YOLO
            self.resolved_model_path = resolve_model_path(self.model_name)
            self.model = YOLO(self.resolved_model_path)
            self.model_loaded = True
            self.load_error = None
            print(f"[TollTrack AI] YOLO model successfully loaded from '{self.resolved_model_path}'.")
        except Exception as e:
            self.model_loaded = False
            self.load_error = str(e)
            self.model = None
            print(f"[TollTrack AI] Error initializing YOLO model '{self.model_name}': {e}")

    def is_ready(self) -> tuple[bool, str]:
        """Returns whether the detector is ready and any error message without re-triggering init."""
        return self.model_loaded, self.load_error or ""

    def detect_vehicles(self, cv2_image: np.ndarray, conf_threshold: float = None) -> dict:
        """
        Executes real YOLO vehicle detection on an OpenCV BGR image.
        Returns:
            {
                'detections': list of detection objects,
                'annotated_image': cv2_image with bounding boxes,
                'total_detected': int,
                'category_counts': dict,
                'axle_disclaimer': str
            }
        Raises RuntimeError if model is not loaded or inference fails.
        NEVER returns fake or fabricated detection results.
        """
        if not self.model_loaded or self.model is None:
            raise RuntimeError(
                f"AI Detection Model is not available: {self.load_error or 'Model not loaded'}. "
                f"Verify that ultralytics and torch are installed and model weights are accessible."
            )

        if cv2_image is None or cv2_image.size == 0:
            raise ValueError("Invalid image input for vehicle detection.")

        threshold = conf_threshold if conf_threshold is not None else self.confidence_threshold
        h, w = cv2_image.shape[:2]

        # Run YOLO inference
        # Classes: 2=car, 3=motorcycle, 5=bus, 7=truck
        results = self.model.predict(
            source=cv2_image,
            conf=threshold,
            classes=list(VEHICLE_COCO_IDS),
            verbose=False
        )

        detections = []
        annotated_img = cv2_image.copy()

        if results and len(results) > 0:
            result = results[0]
            boxes = result.boxes

            if boxes is not None and len(boxes) > 0:
                for idx, box in enumerate(boxes):
                    # Coordinates in xyxy
                    xyxy = box.xyxy[0].cpu().numpy()
                    x1, y1, x2, y2 = [int(v) for v in xyxy]
                    # Clamp to image boundaries
                    x1 = max(0, min(x1, w - 1))
                    y1 = max(0, min(y1, h - 1))
                    x2 = max(0, min(x2, w - 1))
                    y2 = max(0, min(y2, h - 1))

                    conf = float(box.conf[0].cpu().numpy())
                    cls_id = int(box.cls[0].cpu().numpy())
                    raw_class = result.names.get(cls_id, 'vehicle')

                    # Map COCO class to TollTrack scientific category
                    mapping_info = map_coco_class(raw_class)
                    mapped_cat = mapping_info['mapped_category']

                    det_id = f"det_{idx + 1}"

                    detection_item = {
                        'id': det_id,
                        'raw_class': raw_class,
                        'category': mapped_cat,
                        'confidence': round(conf, 4),
                        'confidence_pct': round(conf * 100.0, 1),
                        'box': {
                            'x1': x1,
                            'y1': y1,
                            'x2': x2,
                            'y2': y2,
                            'w': x2 - x1,
                            'h': y2 - y1,
                            # Normalized 0..1 for responsive CSS overlay
                            'norm_x1': round(x1 / w, 4),
                            'norm_y1': round(y1 / h, 4),
                            'norm_x2': round(x2 / w, 4),
                            'norm_y2': round(y2 / h, 4),
                        },
                        'requires_manual_refinement': mapping_info['requires_manual_refinement'],
                        'classification_note': mapping_info['classification_note'],
                    }
                    detections.append(detection_item)

                    # Draw stylish bounding box on annotated image
                    color = CATEGORY_COLORS_BGR.get(mapped_cat, (129, 185, 16))
                    thickness = max(2, int(min(w, h) / 300))
                    cv2.rectangle(annotated_img, (x1, y1), (x2, y2), color, thickness)

                    # Draw label background
                    label = f"{mapped_cat} {detection_item['confidence_pct']}%"
                    font = cv2.FONT_HERSHEY_SIMPLEX
                    font_scale = max(0.45, min(w, h) / 1200.0)
                    font_thickness = max(1, int(font_scale * 2))
                    (label_w, label_h), baseline = cv2.getTextSize(label, font, font_scale, font_thickness)
                    
                    label_y1 = max(0, y1 - label_h - 8)
                    label_y2 = y1
                    label_x2 = min(w, x1 + label_w + 10)

                    # Filled dark pill behind label
                    cv2.rectangle(annotated_img, (x1, label_y1), (label_x2, label_y2), (15, 23, 42), -1)
                    # Accent line
                    cv2.rectangle(annotated_img, (x1, label_y1), (x1 + 3, label_y2), color, -1)
                    # Label text
                    cv2.putText(
                        annotated_img,
                        label,
                        (x1 + 6, label_y2 - 5),
                        font,
                        font_scale,
                        (255, 255, 255),
                        font_thickness,
                        cv2.LINE_AA
                    )

        # Count by category
        category_counts = {}
        for det in detections:
            cat = det['category']
            category_counts[cat] = category_counts.get(cat, 0) + 1

        return {
            'detections': detections,
            'annotated_image': annotated_img,
            'total_detected': len(detections),
            'category_counts': category_counts,
            'image_dimensions': {'width': w, 'height': h},
            'axle_disclaimer': AXLE_CLASSIFICATION_DISCLAIMER
        }


# Global singleton detector instance
detector_instance = VehicleDetector()
