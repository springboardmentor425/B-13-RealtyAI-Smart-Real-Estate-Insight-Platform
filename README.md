# 🏠 RealtyAI - Smart Real Estate Insight Platform

> An intelligent real estate price prediction platform combining **structured data analysis** and **satellite imagery insights** to deliver accurate property valuations and comprehensive location analysis.

## Overview

RealtyAI is a full-stack machine learning application that predicts real estate prices using two sophisticated models:

1. **Structured Data Model** - XGBoost-based prediction from property features (area, bedrooms, location, etc.)
2. **Satellite Image Model** - YOLOv8-powered analysis of aerial imagery for comprehensive location insights

The platform features a modern React frontend, a FastAPI backend, and deployment-ready ML models.

## 🎯 Key Features

- **Dual Prediction Engine**: Combine structured property data and aerial imagery analysis
- **Real-time API**: FastAPI with async support and automatic documentation
- **Interactive Map Interface**: Leaflet-based location selection and visualization
- **Batch Processing**: Process multiple properties simultaneously
- **Health Monitoring**: Real-time model health and readiness status
- **Responsive UI**: Mobile-friendly React interface with Tailwind CSS
- **Production Models**: Artifacts persisted for instant API restarts

## 🏗️ Architecture

```
RealtyAI/
├── Backend (FastAPI)
│   ├── routers/
│   │   ├── prediction.py      # Structured data endpoints
│   │   ├── satellite.py       # Image analysis endpoints
│   │   └── location.py        # Location services
│   ├── ml/
│   │   ├── model.py           # XGBoost model manager
│   │   └── satellite_model.py # YOLOv8 image model
│   ├── schemas/               # Pydantic models for API
│   ├── artifacts/             # Trained model persistence
│   └── main.py                # FastAPI application
├── Frontend (React + Vite)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── services/          # API integration
│   │   ├── hooks/             # Custom React hooks
│   │   ├── contexts/          # React context providers
│   │   └── App.jsx            # Main application
│   └── package.json
└── Data
    └── datasets/              # Training data & samples
```

## 🚀 Quick Start

### Prerequisites

- Python 3.10+ (for backend)
- Node.js 16+ (for frontend)
- pip & npm

### Backend Setup

```bash
cd project/B-13-RealtyAI-Smart-Real-Estate-Insight-Platform

# Install dependencies
pip install -r requirements.txt

# Run API server
python main.py
# or with uvicorn
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`  
Swagger Documentation: `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# or build for production
npm run build
```

Frontend will run on `http://localhost:5173`

## 📊 API Endpoints

### Predictions (Structured Data)

**Health Check**

```
GET /api/v1/predictions/health
```

**Single Prediction**

```
POST /api/v1/predictions/predict
Content-Type: application/json

{
  "LotArea": 8450,
  "YearBuilt": 2003,
  "BedroomAbvGr": 3,
  ...
}
```

**Batch Prediction**

```
POST /api/v1/predictions/batch
```

**Model Info**

```
GET /api/v1/predictions/info
```

### Satellite Analysis

**Health Check**

```
GET /api/v1/satellite/health
```

**Upload & Analyze**

```
POST /api/v1/satellite/analyze
Content-Type: multipart/form-data

[image file]
```

### Location Services

```
GET /api/v1/location/nearby
GET /api/v1/location/analysis
```

## 🔧 Model Details

### House Price Prediction Model

- **Algorithm**: XGBoost Regressor
- **Training Data**: Ames Housing dataset
- **Features**: 80+ property characteristics
- **Output**: Price prediction with confidence metrics

### Satellite Analysis Model

- **Algorithm**: YOLOv8 + Gradient Boosting
- **Input**: Aerial imagery (satellite/drone photos)
- **Output**: Location features, land use classification, feature scores

## 📁 Project Structure

### 📚 Learning & Practice (Root Level)

```
notebooks/          # Jupyter notebooks for exploration, learning & experimentation
├── 1_module.ipynb           # Data preprocessing techniques
├── 2_module.ipynb           # Feature engineering experiments
├── 3_module.ipynb           # Model training & comparison
├── best_model.ipynb         # Final model selection & tuning
├── EDA_on_encryption.ipynb  # Exploratory Data Analysis
├── featureScalling.ipynb    # Feature scaling experiments
└── ...                       # Other experimental notebooks

dataset/            # Practice & learning datasets
├── cleaned_data.csv
├── cleaned_house_data.csv
├── my_dataset.csv
├── my_dataset_100000.csv
├── price_paid_records.csv
└── City_time_series.csv
```

### 🚀 Production Project

```
project/B-13-RealtyAI-Smart-Real-Estate-Insight-Platform/

├── main.py                  # FastAPI application entry point
├── requirements.txt         # Python dependencies
├── house_price_pipeline.py  # Data pipeline utilities
├── LICENSE

├── backend/
│   ├── routers/
│   │   ├── prediction.py      # Structured data prediction endpoints
│   │   ├── satellite.py       # Satellite image analysis endpoints
│   │   └── location.py        # Location services
│   ├── ml/
│   │   ├── model.py           # XGBoost model manager
│   │   └── satellite_model.py # YOLOv8 image analysis model
│   ├── schemas/               # Pydantic data models
│   └── artifacts/             # Trained models & weights
│       └── model.json
│
├── frontend/                # React + Vite web application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── common/      # Generic components (Button, Card, etc.)
│   │   │   ├── layout/      # Page layout components
│   │   │   ├── satellite/   # Satellite analysis UI
│   │   │   │   ├── ConfidenceBar.jsx
│   │   │   │   ├── CoordInput.jsx
│   │   │   │   ├── DetectionCanvas.jsx
│   │   │   │   └── FeatureScores.jsx
│   │   │   ├── location/    # Location search & display
│   │   │   └── structured/  # Property form inputs
│   │   ├── services/        # API & external service integration
│   │   │   ├── api.js       # Main API client
│   │   │   ├── predictionService.js
│   │   │   ├── satelliteService.js
│   │   │   └── locationService.js
│   │   ├── hooks/           # Custom React hooks
│   │   ├── contexts/        # React context providers
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
└── sample_images/           # Test images for development
```

## 🛠️ Technologies Stack

### Backend

- **Framework**: FastAPI 0.135
- **Server**: Uvicorn
- **ML**: scikit-learn, XGBoost, ultralytics (YOLOv8)
- **Data**: Pandas, NumPy
- **Serialization**: Pydantic, joblib

### Frontend

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Maps**: Leaflet + React-Leaflet
- **State**: React Hooks & Context API

## 📈 Model Performance

The models are continuously validated with:

- Mean Squared Error (MSE)
- Mean Absolute Error (MAE)
- R² Score
- Feature importance analysis

Check individual notebooks for detailed performance metrics.

## 🔐 Environment

CORS is configured for local development:

- `http://localhost:5173`
- `http://127.0.0.1:5173`

For production, update CORS origins in `main.py`.

## 📝 Usage Examples

### Python Backend Usage

```python
from ml.model import ModelManager

# Initialize model
manager = ModelManager.get_instance()
manager.load()

# Make prediction
prediction = manager.predict({
    'LotArea': 8450,
    'YearBuilt': 2003,
    ...
})
```

### Frontend Integration

```javascript
import { usePrediction } from "./hooks/usePrediction";

function MyComponent() {
  const { predict, loading, result } = usePrediction();

  const handlePredict = async (features) => {
    await predict(features);
  };

  return <div>{result && <p>Predicted Price: ${result.price}</p>}</div>;
}
```

## 🐛 Troubleshooting

**API responds with 503:**

- Models are loading on startup. Wait a moment and retry.

**CORS errors:**

- Check `main.py` CORS configuration
- Ensure frontend is running on configured port

**Model file not found:**

- Check `artifacts/` directory exists
- Retrain model if files are missing

## 🤝 Contributing

1. Create a new branch for features
2. Add tests in notebooks before committing
3. Update requirements.txt if adding dependencies
4. Test both API and frontend before pushing

## 📄 License

See LICENSE file for details.

## 📧 Contact & Support

For issues, questions, or suggestions, please open an issue in the repository.

---

**Made with ❤️ for smarter real estate decisions**
