from pydantic import BaseModel


class DetectedFeatures(BaseModel):
    swimming_pools: float
    waterbodies: float
    gardens: float
    boats: float
    parking_space: float
    solar_panels: float
    tennis_court: float


class SatellitePredictionResponse(BaseModel):
    predicted_price: float
    formula_price: float
    currency: str = "USD"
    detected_features: dict[str, float]
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
