---
title: "TollTrack AI Vehicle Detection & Emission Calculator"
emoji: 🚗
colorFrom: green
colorTo: purple
sdk: gradio
sdk_version: 4.44.0
app_file: app.py
pinned: false
license: mit
---

# 🚗 TollTrack: AI Vehicle Detection & Emission Calculator

Automated Traffic Emission Assessment & Vehicle Category Recognition for Indian National Highway Toll Plazas.

## Features
- **YOLOv8 Real Vision Inference**: Detects Cars, Motorcycles, Buses, and Trucks in uploaded traffic photographs or webcam snapshots.
- **TollTrack Classification**: Maps detections into the standard 8 FASTag vehicle categories with axle distinction transparency.
- **Scientific Emissions Engine**: Quantifies Vehicle Kilometres (VKT), CO2 (kg & Tonnes), and NOx (g & kg) using verified ARAI and CPCB emission factors.
- **FastAPI + Gradio Architecture**: Functions as both a standalone web app on Hugging Face and a public REST API backend for the TollTrack React frontend on Vercel.
- **ZeroGPU Compatible**: Uses `@spaces.GPU` for on-demand hardware acceleration when deployed on Hugging Face ZeroGPU hardware, with automatic fallback to standard CPU execution.

---

## 🚀 Manual Deployment to Hugging Face Spaces (100% Free)

You can deploy this Space for free in under 2 minutes:

### 1. Create the Space on Hugging Face
1. Sign in to [Hugging Face](https://huggingface.co/).
2. In the top right profile menu, click **New Space**.
3. Fill in the Space settings:
   - **Space Name:** `tolltrack-ai-detection` (or any name you choose)
   - **License:** `mit`
   - **Select the Space SDK:** **Gradio**
   - **Space Hardware:** Select **ZeroGPU** (if eligible) or **CPU Basic (Free - 2 vCPU · 16 GB RAM)**.
     *(YOLOv8n is extremely lightweight; it runs seamlessly on CPU Basic in ~0.08 seconds without requiring any paid GPU!)*
   - **Visibility:** **Public** (required so your Vercel frontend can connect via HTTPS)
4. Click **Create Space**.

### 2. Upload Files to the Space
You can upload the files in this `hf_space/` folder directly through your browser or via Git:

**Option A: Browser Upload**
1. In your newly created Space, click **Files** &rarr; **Add file** &rarr; **Upload files**.
2. Upload the following files from your local `hf_space/` directory:
   - `app.py`
   - `requirements.txt`
   - `classifier.py`
   - `calculator.py`
   - `image_handler.py`
   - `report_generator.py`
   - `README.md`
3. Click **Commit changes to main**.

**Option B: Git Push**
```bash
git clone https://huggingface.co/spaces/YOUR_USERNAME/tolltrack-ai-detection
cd tolltrack-ai-detection
cp -r /path/to/abl2/hf_space/* .
git add .
git commit -m "feat: initial TollTrack AI Gradio + FastAPI deployment"
git push
```

### 3. Obtain Your Public API URL
Once Hugging Face finishes building the Space (usually ~1 minute):
- Look at the top right of your Space &rarr; Click the **Embed this Space** or three dots menu &rarr; Click **Direct URL** (or check the URL format):
  `https://<YOUR_USERNAME>-<SPACE_NAME>.hf.space`
  *(Example: `https://kiranmc-tolltrack-ai-detection.hf.space`)*

Test that the health endpoint is active by opening in your browser:
`https://<YOUR_USERNAME>-<SPACE_NAME>.hf.space/api/health`
Expected response:
```json
{
  "status": "healthy",
  "backend": "TollTrack AI Hugging Face Backend",
  "yolo_model": "yolov8n.pt",
  "model_loaded": true,
  "ai_ready": true
}
```

### 4. Connect to Your Vercel Frontend
1. Open your project on the [Vercel Dashboard](https://vercel.com/dashboard).
2. Go to **Settings** &rarr; **Environment Variables**.
3. Add or update:
   - **Key:** `VITE_AI_API_URL`
   - **Value:** `https://<YOUR_USERNAME>-<SPACE_NAME>.hf.space` *(no trailing slash)*
4. Go to **Deployments** &rarr; Click **...** on the latest deployment &rarr; **Redeploy** (without cache).
5. Open your live Vercel site from any computer or mobile phone. Your AI vehicle detection is now 100% online for free!

