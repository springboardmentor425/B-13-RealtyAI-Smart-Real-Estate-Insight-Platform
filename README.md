# RealtyAI — Smart Real Estate Insight Platform

Full-stack demo for house price insights: structured Ames-style features (XGBoost), satellite imagery (YOLOv8 + gradient boosting), and location-related APIs. The backend is [FastAPI](https://fastapi.tiangolo.com/); the UI is [React](https://react.dev/) with [Vite](https://vite.dev/).

## Prerequisites

- **Python** 3.11+ (virtual environment recommended)
- **Node.js** 18+ (for the frontend dev server)

## Quick start

Run the **API** and **frontend** in two terminals from this folder  
`B-13-RealtyAI-Smart-Real-Estate-Insight-Platform`.

### 1. Backend (FastAPI)

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

- API root: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- Interactive docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

First startup loads ML artifacts (structured model + satellite pipeline); expect a short delay.

### 2. Frontend (Vite + React)

```powershell
cd frontend
npm install
npm run dev
```

- App: [http://localhost:5173/](http://localhost:5173/)

The dev server proxies `/api` to `http://localhost:8000`, matching CORS settings in `main.py`. Keep the backend running on port **8000** while using the UI.

## Project layout

| Path | Role |
|------|------|
| `main.py` | FastAPI app entrypoint |
| `routers/` | API routes (`prediction`, `satellite`, `location`) |
| `ml/` | Model loading and inference |
| `schemas/` | Request/response models |
| `artifacts/` | Saved model assets (as used by the app) |
| `frontend/` | React UI (`npm run dev` / `npm run build`) |
| `requirements.txt` | Python dependencies |

## Production build (frontend)

```powershell
cd frontend
npm run build
```

Serve the `frontend/dist` output with any static host, or integrate with your deployment pipeline. Ensure API calls target the same origin or a configured API base URL.

## License

See [LICENSE](LICENSE) in this repository.
