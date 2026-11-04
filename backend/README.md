# TollTrack AI Vehicle Detection & Emission Calculator Backend

This is the production-ready Python Flask backend for TollTrack's AI Vehicle Detection & Emission Calculator module.

## Features
- **Real YOLOv8 Inference**: Detects and counts vehicles (Cars, Motorcycles, Buses, Trucks) using real YOLOv8 models.
- **Scientific Emission Quantification**: Computes Vehicle Kilometres (VKT), CO2 (kg & Tonnes), and NOx (g & kg) using verified ARAI and CPCB emission factors.
- **Axle Distinction Transparency**: Clearly indicates that standard COCO YOLO models detect generic trucks, defaulting to 2-Axle Truck while allowing interactive manual reassignment.
- **Export Formats**: PDF (via ReportLab) and CSV export.
- **Dual Input Channels**: Multipart file upload (JPG/PNG/WEBP) and device camera Base64 snapshots.
- **Production Ready**: Gunicorn WSGI, CORS enabled for all origins, dynamic `$PORT` binding for cloud hosting.

## 1. Cloud Deployment on Render (Online 24/7)

This backend is designed to run completely online on [Render](https://render.com) without requiring your local PC.

### Option A: Native Python Web Service (Recommended)
1. In Render Dashboard, click **New +** > **Web Service**.
2. Connect your GitHub repo: `https://github.com/kiranmc88/TollTrack-Traffic-Based-Vehicle-Emission-Analysis-System.git`
3. Configure:
   - **Environment**: `Python 3`
   - **Build Command**:
     ```bash
     pip install --upgrade pip && pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu && pip install -r backend/requirements.txt && python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"
     ```
   - **Start Command**:
     ```bash
     gunicorn --bind 0.0.0.0:$PORT --workers 1 --threads 4 --timeout 120 --chdir backend app:app
     ```
   - **Health Check Path**: `/api/health`
   - **Plan**: `Free`

### Option B: Docker Web Service
1. Select **Docker** environment on Render.
2. Render will automatically detect the `Dockerfile` in the repository root.
3. Health check path: `/api/health`.

### Live Verification
Once deployed, check:
`https://YOUR-RENDER-BACKEND.onrender.com/api/health`
Expected JSON:
```json
{
  "status": "healthy",
  "backend": "TollTrack AI Python Backend",
  "yolo_model": "yolov8n.pt",
  "model_loaded": true,
  "model_error": "",
  "ai_ready": true
}
```

## 2. Local Development (Windows)
```bash
# 1. Install dependencies
pip install -r backend/requirements.txt

# 2. Run the server
python backend/app.py
```
The local server runs on `http://127.0.0.1:5000`.
