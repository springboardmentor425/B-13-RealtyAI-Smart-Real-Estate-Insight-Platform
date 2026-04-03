from fastapi import APIRouter, UploadFile, File, HTTPException, status
from schemas.satellite import (
    SatellitePredictionResponse, SatelliteModelInfoResponse,
    CoordPredictionRequest, CoordPredictionResponse,
)
from ml.satellite_model import SatelliteModelManager, FEATURES, PRICE_WEIGHTS, BASE_PRICE

router = APIRouter(prefix="/satellite", tags=["satellite"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/tiff"}


def _get_ready_manager() -> SatelliteModelManager:
    mgr = SatelliteModelManager.get_instance()
    if not mgr.is_ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Satellite model is not loaded yet. Try again in a moment.",
        )
    return mgr


@router.post(
    "/predict",
    response_model=SatellitePredictionResponse,
    summary="Predict house price from a satellite image",
)
async def predict_from_satellite(
    file: UploadFile = File(..., description="Satellite or aerial image (JPEG/PNG/TIFF)"),
):
    """
    Upload a satellite or aerial image of a property.
    The pipeline will:
    1. Run YOLOv8 to detect boats and vehicles (parking)
    2. Use color analysis to detect pools, water, gardens, tennis courts, solar panels
    3. Feed extracted feature scores into Gradient Boosting model
    4. Return predicted price + per-feature breakdown
    """
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type '{file.content_type}'. Use JPEG, PNG, WEBP, or TIFF.",
        )

    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    mgr = _get_ready_manager()
    try:
        result = mgr.predict(image_bytes)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

    return SatellitePredictionResponse(
        predicted_price=result["predicted_price"],
        formula_price=result["formula_price"],
        detected_features=result["detected_features"],
        detections=result["detections"],
    )


@router.post(
    "/predict-by-coords",
    response_model=CoordPredictionResponse,
    summary="Fetch satellite tile by coordinates and predict house price",
)
async def predict_by_coords(body: CoordPredictionRequest):
    """
    Provide latitude, longitude, and zoom level.
    The API fetches the ESRI satellite tile, runs the detection pipeline,
    and returns the predicted price + bounding boxes + the tile image as base64.
    """
    mgr = _get_ready_manager()
    try:
        result = mgr.predict_from_coords(body.lat, body.lon, body.zoom)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch satellite tile: {e}",
        )

    return CoordPredictionResponse(
        predicted_price=result["predicted_price"],
        formula_price=result["formula_price"],
        detected_features=result["detected_features"],
        detections=result["detections"],
        image_b64=result["image_b64"],
        tile_info=result["tile_info"],
    )


@router.get(
    "/model-info",
    response_model=SatelliteModelInfoResponse,
    summary="Satellite model pipeline details",
)
async def model_info():
    mgr = _get_ready_manager()
    return SatelliteModelInfoResponse(
        status="ready",
        model_pipeline=[
            "1. YOLOv8n (COCO pretrained) — detects boats & parking vehicles",
            "2. OpenCV HSV color analysis — detects pools, water, gardens, tennis courts, solar panels",
            "3. GradientBoostingRegressor — predicts price from 7 feature confidence scores",
        ],
        detectable_features={
            "Boats":          "YOLOv8 (COCO class: boat)",
            "Parking Space":  "YOLOv8 (COCO classes: car, truck, bus)",
            "Swimming Pools": "Color heuristic (bright blue HSV range)",
            "Waterbodies":    "Color heuristic (large blue/teal area)",
            "Gardens":        "Color heuristic (green HSV range)",
            "Tennis Court":   "Color heuristic (bright blue-green rectangle)",
            "Solar Panels":   "Color heuristic (dark blue-grey array)",
        },
        price_formula={k: v for k, v in PRICE_WEIGHTS.items()},
        base_price=BASE_PRICE,
        metrics=mgr.metrics,
        dataset="Synthetic (5,000 samples generated from original paper's price formula + Gaussian noise)",
    )


@router.get("/health", summary="Satellite model health check")
async def health():
    mgr = SatelliteModelManager.get_instance()
    return {
        "status": "ready" if mgr.is_ready else "loading",
        "components": ["YOLOv8n", "GradientBoostingRegressor"],
    }
