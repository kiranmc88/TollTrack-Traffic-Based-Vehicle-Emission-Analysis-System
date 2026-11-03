# TollTrack AI Vehicle Detection & Emission Calculator Backend

This is the Python Flask backend for TollTrack's AI Vehicle Detection & Emission Calculator module.

## Features
- **YOLO Pretrained Detection**: Detects and counts vehicles (Cars, Motorcycles, Buses, Trucks) using real YOLOv8 models.
- **Scientific Emission Calculation**: Computes Vehicle Kilometres (VKT), CO2 (kg & Tonnes), and NOx (g & kg) using verified ARAI and CPCB emission factors.
- **Axle Distinction Transparency**: Clearly indicates that standard COCO YOLO models detect generic trucks, defaulting to 2-Axle Truck while allowing interactive manual reassignment.
- **Export Formats**: PDF (via ReportLab) and CSV export.
- **Dual Input Channels**: Multipart file upload and webcam Base64 snapshots.

## Running the Server
```bash
# 1. Install dependencies
pip install -r backend/requirements.txt

# 2. Start the Flask API server
python backend/app.py
```
The server will start on `http://127.0.0.1:5000`.

