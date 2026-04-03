from pydantic import BaseModel, Field
from typing import Optional


class HouseFeatures(BaseModel):
    """
    Key house attributes a user would realistically know.
    All fields are optional — missing ones are filled with Ames dataset medians.
    At least OverallQual + GrLivArea should be provided for a meaningful prediction.
    """
    OverallQual: Optional[int]   = Field(None, ge=1, le=10,  description="Overall material & finish quality (1=Poor, 10=Excellent)")
    OverallCond: Optional[int]   = Field(None, ge=1, le=10,  description="Overall condition rating (1-10)")
    GrLivArea:   Optional[int]   = Field(None, gt=0,         description="Above-grade living area in sq ft")
    TotalBsmtSF: Optional[float] = Field(None, ge=0,         description="Total basement area in sq ft")
    GarageCars:  Optional[int]   = Field(None, ge=0, le=5,   description="Garage capacity (number of cars)")
    FullBath:    Optional[int]   = Field(None, ge=0,         description="Full bathrooms above grade")
    HalfBath:    Optional[int]   = Field(None, ge=0,         description="Half bathrooms above grade")
    BedroomAbvGr: Optional[int]  = Field(None, ge=0,         description="Bedrooms above grade")
    YearBuilt:   Optional[int]   = Field(None, ge=1800, le=2025, description="Year the house was built")
    YearRemodAdd: Optional[int]  = Field(None, ge=1800, le=2025, description="Year of remodel (same as YearBuilt if no remodel)")
    LotArea:     Optional[float] = Field(None, gt=0,         description="Lot size in sq ft")
    Fireplaces:  Optional[int]   = Field(None, ge=0,         description="Number of fireplaces")
    GarageArea:  Optional[float] = Field(None, ge=0,         description="Garage size in sq ft")
    WoodDeckSF:  Optional[float] = Field(None, ge=0,         description="Wood deck area in sq ft")
    OpenPorchSF: Optional[float] = Field(None, ge=0,         description="Open porch area in sq ft")

    def to_feature_dict(self) -> dict:
        """Return only non-None fields for partial inference."""
        return {k: v for k, v in self.model_dump().items() if v is not None}

    model_config = {
        "json_schema_extra": {
            "example": {
                "OverallQual": 7,
                "GrLivArea": 1800,
                "GarageCars": 2,
                "TotalBsmtSF": 900.0,
                "FullBath": 2,
                "YearBuilt": 2005,
                "YearRemodAdd": 2010,
            }
        }
    }


class PredictionResponse(BaseModel):
    predicted_price: float = Field(description="Predicted sale price in USD")
    currency: str = "USD"


class BatchPredictionRequest(BaseModel):
    houses: list[HouseFeatures] = Field(min_length=1, max_length=100)

    model_config = {
        "json_schema_extra": {
            "example": {
                "houses": [
                    {"OverallQual": 5, "GrLivArea": 900, "YearBuilt": 1975},
                    {"OverallQual": 8, "GrLivArea": 2500, "GarageCars": 3},
                ]
            }
        }
    }


class BatchPredictionResponse(BaseModel):
    predictions: list[float]
    count: int


class FeatureImportance(BaseModel):
    feature: str
    importance: float


class ModelInfoResponse(BaseModel):
    status: str
    metrics: dict[str, float]
    top_features: list[FeatureImportance]
    total_features: int
    dataset: str
    algorithm: str
