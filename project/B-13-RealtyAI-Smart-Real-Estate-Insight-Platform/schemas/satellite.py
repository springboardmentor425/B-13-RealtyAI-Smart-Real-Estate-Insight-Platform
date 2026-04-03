from pydantic import BaseModel, Field


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


class CoordPredictionRequest(BaseModel):
    lat:  float = Field(..., ge=-90,  le=90,  description="Latitude  (-90 to 90)")
    lon:  float = Field(..., ge=-180, le=180, description="Longitude (-180 to 180)")
    zoom: int   = Field(18,  ge=10,   le=20,  description="Zoom level (10–20, default 18)")

    model_config = {
        "json_schema_extra": {
            "example": {"lat": 14.028033, "lon": 80.020600, "zoom": 18}
        }
    }


class CoordPredictionResponse(SatellitePredictionResponse):
    image_b64: str        # base64-encoded PNG of the fetched tile
    tile_info: dict       # {lat, lon, zoom, tile_x, tile_y}


class SatelliteModelInfoResponse(BaseModel):
    status: str
    model_pipeline: list[str]
    detectable_features: dict[str, str]
    price_formula: dict[str, int]
    base_price: int
    metrics: dict[str, float]
    dataset: str
