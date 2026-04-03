"""
Downloads satellite imagery tiles from ESRI World Imagery (free, no API key needed)
for several well-known residential areas and saves them as sample images.
"""

import math
import urllib.request
import urllib.error
from pathlib import Path

OUTPUT_DIR = Path("sample_images")
OUTPUT_DIR.mkdir(exist_ok=True)

# ESRI World Imagery tile server (free, no auth required)
TILE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"

# Residential locations to sample
LOCATIONS = [
    {"name": "beverly_hills_luxury",   "lat": 34.0736,  "lon": -118.4004, "zoom": 18, "desc": "Beverly Hills luxury estate (LA)"},
    {"name": "miami_beach_waterfront",  "lat": 25.8103,  "lon": -80.1228,  "zoom": 18, "desc": "Miami Beach waterfront home"},
    {"name": "palo_alto_suburban",      "lat": 37.4419,  "lon": -122.1430, "zoom": 18, "desc": "Palo Alto suburban home (Silicon Valley)"},
    {"name": "greenwich_estate",        "lat": 41.0262,  "lon": -73.6282,  "zoom": 18, "desc": "Greenwich CT estate with pool"},
    {"name": "scottsdale_desert_home",  "lat": 33.5722,  "lon": -111.8977, "zoom": 18, "desc": "Scottsdale AZ desert property"},
    {"name": "hamptons_ny",             "lat": 40.9634,  "lon": -72.1848,  "zoom": 18, "desc": "Hamptons NY beachfront estate"},
    {"name": "lake_tahoe_mountain",     "lat": 39.0968,  "lon": -120.0324, "zoom": 17, "desc": "Lake Tahoe mountain home"},
    {"name": "coral_gables_pool",       "lat": 25.7214,  "lon": -80.2684,  "zoom": 18, "desc": "Coral Gables FL home with pool"},
]


def lat_lon_to_tile(lat: float, lon: float, zoom: int) -> tuple[int, int]:
    """Convert lat/lon to tile x, y at a given zoom level."""
    lat_r = math.radians(lat)
    n = 2 ** zoom
    x = int((lon + 180.0) / 360.0 * n)
    y = int((1.0 - math.asinh(math.tan(lat_r)) / math.pi) / 2.0 * n)
    return x, y


def download_tile(z: int, x: int, y: int, out_path: Path) -> bool:
    url = TILE_URL.format(z=z, x=x, y=y)
    headers = {
        "User-Agent": "Mozilla/5.0 (research/educational use)",
        "Referer":    "https://www.arcgis.com/",
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            out_path.write_bytes(resp.read())
        return True
    except urllib.error.HTTPError as e:
        print(f"  HTTP {e.code} for {url}")
        return False
    except Exception as e:
        print(f"  Error: {e}")
        return False


print("Downloading satellite imagery samples...")
print(f"Saving to: {OUTPUT_DIR.resolve()}\n")

ok = 0
for loc in LOCATIONS:
    x, y = lat_lon_to_tile(loc["lat"], loc["lon"], loc["zoom"])
    out  = OUTPUT_DIR / f"{loc['name']}.jpg"
    print(f"[{loc['name']}]")
    print(f"  {loc['desc']}")
    print(f"  Tile z={loc['zoom']} x={x} y={y}  ->  {out.name}")
    if download_tile(loc["zoom"], x, y, out):
        size_kb = out.stat().st_size // 1024
        print(f"  Saved ({size_kb} KB)")
        ok += 1
    else:
        print("  FAILED")
    print()

print(f"Done: {ok}/{len(LOCATIONS)} images downloaded to '{OUTPUT_DIR}/'")
