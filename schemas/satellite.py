from pydantic import BaseModel


class Detection(BaseModel):
    feature: str
    confidence: float
    bbox: list[float]   # normalized [x1, y1, x2, y2] in 0-1 range


class SatellitePredictionResponse(BaseModel):
    predicted_price: float
    formula_price: float
    currency: str = "USD"
    detected_features: dict[str, float]
    detections: list[Detection] = []
    note: str = (
        "YOLO detects boats & parking (COCO weights). "
        "Pools, water, gardens, tennis, solar use color heuristics. "
        "Custom satellite-trained weights would improve accuracy."
    )


class SatelliteModelInfoResponse(BaseModel):
    status: str
    model_pipeline: list[str]
    detectable_features: dict[str, str]
    price_formula: dict[str, int]
    base_price: int
    metrics: dict[str, float]
    dataset: str
