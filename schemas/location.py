from pydantic import BaseModel


class LocationSearchResult(BaseModel):
    name: str
    display_name: str
    lat: float
    lon: float
    place_type: str


class LocationSearchResponse(BaseModel):
    results: list[LocationSearchResult]


class ResidentialArea(BaseModel):
    name: str
    lat: float
    lon: float
    zoom: int
    tile_url: str
    distance_m: float


class ResidentialAreasResponse(BaseModel):
    areas: list[ResidentialArea]
    center_lat: float
    center_lon: float
    location_name: str


class Amenity(BaseModel):
    name: str
    category: str
    icon: str
    lat: float
    lon: float
    distance_m: float


class AmenitiesResponse(BaseModel):
    amenities: list[Amenity]
    radius_m: int
    counts: dict[str, int]
