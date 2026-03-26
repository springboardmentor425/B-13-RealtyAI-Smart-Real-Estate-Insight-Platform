from contextlib import asynccontextmanager
from fastapi import FastAPI
from routers.prediction import router as prediction_router
from routers.satellite import router as satellite_router
from ml.model import ModelManager
from ml.satellite_model import SatelliteModelManager


@asynccontextmanager
async def lifespan(app: FastAPI):
    ModelManager.get_instance().load()
    SatelliteModelManager.get_instance().load()
    yield


app = FastAPI(
    title="House Price Prediction API",
    description=(
        "Two prediction modules:\n\n"
        "- **Structured data** (Ames Housing features) → XGBoost\n"
        "- **Satellite image** (aerial photo upload) → YOLOv8 + GradientBoosting"
    ),
    version="2.0.0",
    lifespan=lifespan,
)

app.include_router(prediction_router, prefix="/api/v1")
app.include_router(satellite_router,  prefix="/api/v1")


@app.get("/", tags=["root"])
async def root():
    return {
        "service": "House Price Prediction API",
        "version": "2.0.0",
        "docs": "/docs",
        "modules": {
            "structured": "/api/v1/predictions/health",
            "satellite":  "/api/v1/satellite/health",
        },
    }
