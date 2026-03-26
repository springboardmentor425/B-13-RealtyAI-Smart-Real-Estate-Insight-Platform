import math
import time
import requests as http_client
from fastapi import APIRouter, HTTPException, Query
from schemas.location import (
    LocationSearchResult, LocationSearchResponse,
    ResidentialArea, ResidentialAreasResponse,
    Amenity, AmenitiesResponse,
)

router = APIRouter(prefix="/location", tags=["location"])

NOMINATIM_SEARCH  = "https://nominatim.openstreetmap.org/search"
NOMINATIM_REVERSE = "https://nominatim.openstreetmap.org/reverse"
ESRI_TILE = "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{zoom}/{y}/{x}"
HEADERS   = {"User-Agent": "HousePricePredictor/1.0 (educational project)"}

# -----------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------

def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6_371_000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi    = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _lat_lon_to_tile(lat: float, lon: float, zoom: int):
    x = int((lon + 180) / 360 * (2 ** zoom))
    lat_rad = math.radians(lat)
    y = int(
        (1 - math.log(math.tan(lat_rad) + 1 / math.cos(lat_rad)) / math.pi)
        / 2 * (2 ** zoom)
    )
    return x, y


def _viewbox(lat: float, lon: float, radius_m: float) -> str:
    """Return a Nominatim viewbox string for a square centred on (lat, lon)."""
    d = radius_m / 111_000  # metres → degrees (approx)
    return f"{lon - d},{lat - d},{lon + d},{lat + d}"


def _spiral_points(lat: float, lon: float, radius_km: float, n: int = 10):
    """Generate n points in a Fibonacci spiral within radius_km."""
    golden = (1 + 5 ** 0.5) / 2
    radius_m = radius_km * 1_000
    points = []
    for i in range(n):
        r = math.sqrt((i + 0.5) / n) * radius_m
        theta = 2 * math.pi * i / golden ** 2
        dlat = r * math.cos(theta) / 111_000
        dlon = r * math.sin(theta) / (111_000 * math.cos(math.radians(lat)))
        points.append((lat + dlat, lon + dlon))
    return points


def _reverse_geocode(lat: float, lon: float, zoom: int = 15) -> dict:
    resp = http_client.get(
        NOMINATIM_REVERSE,
        params={"lat": lat, "lon": lon, "format": "json", "zoom": zoom, "addressdetails": 1},
        headers=HEADERS,
        timeout=8,
    )
    resp.raise_for_status()
    return resp.json()


def _nominatim_search(q: str, viewbox: str, limit: int = 8) -> list:
    resp = http_client.get(
        NOMINATIM_SEARCH,
        params={"q": q, "format": "json", "limit": limit,
                "viewbox": viewbox, "bounded": "1", "addressdetails": "0"},
        headers=HEADERS,
        timeout=8,
    )
    resp.raise_for_status()
    return resp.json()


ICON_MAP = {
    "Hospital": "🏥", "Clinic": "🏥", "School": "🏫", "University": "🎓",
    "Bank": "🏦", "Pharmacy": "💊", "Park": "🌳", "Airport": "✈️",
    "Supermarket": "🛒", "Fuel Station": "⛽", "Restaurant": "🍽️",
    "Cafe": "☕", "Bus Station": "🚌",
}

# (Nominatim special phrase, display category)
AMENITY_QUERIES = [
    ("hospital",    "Hospital"),
    ("school",      "School"),
    ("bank",        "Bank"),
    ("pharmacy",    "Pharmacy"),
    ("supermarket", "Supermarket"),
    ("park",        "Park"),
    ("airport",     "Airport"),
    ("university",  "University"),
    ("clinic",      "Clinic"),
]

# -----------------------------------------------------------------
# Endpoints
# -----------------------------------------------------------------

@router.get("/search", response_model=LocationSearchResponse, summary="Geocode a location query")
def search_location(q: str = Query(..., min_length=2)):
    try:
        resp = http_client.get(
            NOMINATIM_SEARCH,
            params={"q": q, "format": "json", "limit": 6, "addressdetails": 1},
            headers=HEADERS,
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Geocoding service error: {e}")

    results = []
    for item in data:
        name = item.get("name") or item.get("display_name", "").split(",")[0].strip()
        results.append(LocationSearchResult(
            name=name,
            display_name=item.get("display_name", ""),
            lat=float(item["lat"]),
            lon=float(item["lon"]),
            place_type=item.get("type", "place"),
        ))
    return LocationSearchResponse(results=results)


@router.get(
    "/residential",
    response_model=ResidentialAreasResponse,
    summary="Find residential areas near given coordinates",
)
def get_residential_areas(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    radius_km: float = Query(5.0, ge=0.5, le=20),
    location_name: str = Query(""),
):
    """
    Reverse-geocode a spiral grid of points within radius_km to extract
    distinct suburb / neighbourhood names — no Overpass needed.
    """
    points = _spiral_points(lat, lon, radius_km, n=12)

    zoom = 17
    seen_names: set[str] = set()
    areas: list[ResidentialArea] = []

    for p_lat, p_lon in points:
        try:
            data = _reverse_geocode(p_lat, p_lon, zoom=15)
            addr = data.get("address", {})
            # Priority order: suburb → neighbourhood → quarter → village → city_district
            name = (
                addr.get("suburb") or addr.get("neighbourhood") or
                addr.get("quarter") or addr.get("village") or
                addr.get("city_district") or addr.get("town")
            )
            if not name or name in seen_names:
                continue
            seen_names.add(name)

            el_lat = float(data.get("lat", p_lat))
            el_lon = float(data.get("lon", p_lon))
            x, y   = _lat_lon_to_tile(el_lat, el_lon, zoom)
            tile_url = ESRI_TILE.format(zoom=zoom, y=y, x=x)
            dist   = _haversine(lat, lon, el_lat, el_lon)

            areas.append(ResidentialArea(
                name=name, lat=el_lat, lon=el_lon, zoom=zoom,
                tile_url=tile_url, distance_m=round(dist),
            ))
        except Exception:
            pass
        time.sleep(0.12)   # Nominatim: max ~1 req/s

    areas.sort(key=lambda a: a.distance_m)
    return ResidentialAreasResponse(
        areas=areas[:12],
        center_lat=lat,
        center_lon=lon,
        location_name=location_name or "Selected Location",
    )


@router.get(
    "/amenities",
    response_model=AmenitiesResponse,
    summary="Find nearby amenities (hospitals, schools, parks, etc.)",
)
def get_amenities(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    radius_m: int = Query(2000, ge=100, le=10000),
):
    """
    Use Nominatim special-phrase search per category in a bounding box.
    Sequential with a small delay to respect the 1 req/s rate limit.
    """
    vbox         = _viewbox(lat, lon, radius_m)
    airport_vbox = _viewbox(lat, lon, min(radius_m * 10, 50_000))

    amenities: list[Amenity] = []
    counts: dict[str, int]   = {}
    seen: set                = set()

    for q, cat in AMENITY_QUERIES:
        vb = airport_vbox if q == "airport" else vbox
        try:
            items = _nominatim_search(q, vb, limit=8)
            for item in items:
                name   = item.get("display_name", "").split(",")[0].strip() or "Unknown"
                el_lat = float(item["lat"])
                el_lon = float(item["lon"])
                uid    = (name, cat, round(el_lat, 3), round(el_lon, 3))
                if uid in seen:
                    continue
                seen.add(uid)
                dist = _haversine(lat, lon, el_lat, el_lon)
                icon = ICON_MAP.get(cat, "📍")
                amenities.append(Amenity(
                    name=name, category=cat, icon=icon,
                    lat=el_lat, lon=el_lon, distance_m=round(dist),
                ))
                counts[cat] = counts.get(cat, 0) + 1
        except Exception:
            pass
        time.sleep(0.12)   # Nominatim rate limit

    amenities.sort(key=lambda a: a.distance_m)
    return AmenitiesResponse(amenities=amenities, radius_m=radius_m, counts=counts)
