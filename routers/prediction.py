from fastapi import APIRouter, HTTPException, status
from schemas.house import (
    HouseFeatures,
    PredictionResponse,
    BatchPredictionRequest,
    BatchPredictionResponse,
    ModelInfoResponse,
    FeatureImportance,
)
from ml.model import ModelManager

router = APIRouter(prefix="/predictions", tags=["predictions"])


def _get_ready_manager() -> ModelManager:
    mgr = ModelManager.get_instance()
    if not mgr.is_ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is not loaded yet. Try again in a moment.",
        )
    return mgr


@router.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Predict price for a single house",
)
async def predict(features: HouseFeatures):
    """
    Provide any known house attributes and receive a predicted sale price.
    Missing fields are automatically filled with Ames Housing dataset medians.
    """
    mgr = _get_ready_manager()
    price = mgr.predict(features.to_feature_dict())
    return PredictionResponse(predicted_price=round(price, 2))


@router.post(
    "/predict/batch",
    response_model=BatchPredictionResponse,
    summary="Predict prices for multiple houses",
)
async def predict_batch(payload: BatchPredictionRequest):
    """
    Send up to 100 houses in a single request and get predictions for all.
    """
    mgr = _get_ready_manager()
    inputs = [h.to_feature_dict() for h in payload.houses]
    prices = mgr.predict_batch(inputs)
    return BatchPredictionResponse(
        predictions=[round(p, 2) for p in prices],
        count=len(prices),
    )


@router.get(
    "/model-info",
    response_model=ModelInfoResponse,
    summary="Model metadata and performance metrics",
)
async def model_info():
    """
    Returns test-set evaluation metrics and top feature importances.
    """
    mgr = _get_ready_manager()
    return ModelInfoResponse(
        status="ready",
        metrics=mgr.metrics,
        top_features=[FeatureImportance(**f) for f in mgr.top_features(10)],
        total_features=len(mgr.feature_names),
        dataset="Ames Housing (OpenML house_prices v1)",
        algorithm="XGBoost Regressor",
    )


@router.get(
    "/health",
    summary="Health check",
)
async def health():
    mgr = ModelManager.get_instance()
    return {
        "status": "ready" if mgr.is_ready else "loading",
        "model": "XGBoost",
    }
