# RealtyAI - Smart Real Estate Insight Platform

Welcome to the **RealtyAI Smart Real Estate Insight Platform**. This project provides intelligent, machine-learning-driven predictions for real estate value using both structured property features and aerial/satellite imagery. 
---

## 🚀 Features

- **Structured Data Prediction**: Uses an **XGBoost** model to predict property values based on traditional housing features (e.g., Ames Housing dataset features).
- **Satellite Image Prediction**: Allows users to upload or select aerial imagery via an interactive map map to predict prices. It uses a **YOLOv8** object detection model combined with a **GradientBoosting** regressor for sophisticated estimations.
- **Interactive Map**: Incorporates `react-leaflet` to display maps and enable geo-based interactions for prediction locations.
- **FastAPI Backend**: A highly performant async Python backend that efficiently serves the machine learning models.
- **Modern React Frontend**: A responsive, fast user interface built with Vite, React, and Tailwind CSS.

---

## 🏗️ Architecture Stack

### Backend (`Project/`)
- **Framework**: FastAPI
- **Machine Learning**: XGBoost, Scikit-learn, YOLOv8 (Ultralytics), Joblib, Pandas, NumPy, OpenCV
- **Server**: Uvicorn

### Frontend (`Project/frontend/`)
- **Framework**: React 18 & Vite
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Map Integration**: Leaflet, React Leaflet

---

## 📁 Project Directory Structure

```text
Project/
├── frontend/                # React (Vite) Frontend application
│   ├── src/                 # React components, contexts, styles
│   ├── public/              # Static assets
│   ├── package.json         # Node.js dependencies
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   └── vite.config.js       # Vite configuration
│
├── main.py                  # Entry point for the FastAPI backend
├── routers/                 # FastAPI routers (location, prediction, satellite)
├── ml/                      # Machine learning models (XGBoost, YOLOv8 wrappers)
├── schemas/                 # Pydantic schemas for data validation
├── sample_images/           # Sample images for testing the satellite module
├── artifacts/               # Processed ML artifacts and weights
├── requirements.txt         # Python dependencies for backend
├── yolov8n.pt               # Base YOLOv8 model weights
└── download_samples.py      # Script to download sample testing images
```

---

## 🛠️ Installation & Setup

### 1. Backend Setup

Prerequisites: Python 3.9+ 

1. **Navigate to the `Project/` folder**:
   ```bash
   cd Project
   ```
2. **Create a virtual environment (optional but recommended)**:
   ```bash
   python -m venv env
   # On Windows
   env\Scripts\activate
   # On macOS/Linux
   source env/bin/activate
   ```
3. **Install the dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Run the FastAPI server**:
   ```bash
   uvicorn main:app --reload
   ```
   > The API will be available at `http://127.0.0.1:8000`
   > Interactive API documentation can be accessed at `http://127.0.0.1:8000/docs`

### 2. Frontend Setup

Prerequisites: Node.js v18+ 

1. **Navigate to the frontend directory**:
   ```bash
   cd Project/frontend
   ```
2. **Install the node dependencies**:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```
   > The frontend will be available at `http://localhost:5173`

---

## 📡 API Endpoints (Highlights)

- `GET /` - Root status and module links
- `GET /api/v1/predictions/health` - Structured module health check
- `GET /api/v1/satellite/health` - Satellite module health check
- *Other endpoints for predictions and location APIs reside under the `/api/v1` prefix.*

---

## 📝 License
See the `LICENSE` file found within the `Project` directory for details.
