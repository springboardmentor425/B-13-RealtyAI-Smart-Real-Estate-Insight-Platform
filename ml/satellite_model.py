"""
Satellite Image House Price Prediction
Pipeline (from VikrantVDeo/House-Price-Prediction-Using-Satellite-Imagery):
  1. YOLOv8n (pretrained COCO) detects boats & parking from uploaded image
  2. OpenCV color heuristics detect pools, waterbodies, gardens, tennis courts
  3. Gradient Boosting Regressor (trained on synthetic formula-based data) predicts price

Price formula (from original notebook):
  Base: $20,000,000
  + Swimming Pools  × $1,000,000
  + Tennis Court    × $5,000,000
  + Parking Space   × $1,000,000
  + Waterbodies     × $30,000,000
  + Gardens         × $500,000
  + Boats           × $2,000,000
  + Solar Panels    × $500,000
"""

import base64
import math
import urllib.request
import joblib
import numpy as np
import cv2
import warnings
from pathlib import Path
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error
from ultralytics import YOLO

warnings.filterwarnings("ignore")

ARTIFACTS_DIR = Path(__file__).parent.parent / "artifacts"

FEATURES = [
    "Swimming Pools", "Waterbodies", "Gardens",
    "Boats", "Parking Space", "Solar Panels", "Tennis Court",
]

PRICE_WEIGHTS = {
    "Swimming Pools":  1_000_000,
    "Waterbodies":    30_000_000,
    "Gardens":           500_000,
    "Boats":           2_000_000,
    "Parking Space":   1_000_000,
    "Solar Panels":      500_000,
    "Tennis Court":    5_000_000,
}
BASE_PRICE = 20_000_000

# COCO class IDs that map to our features
COCO_TO_FEATURE = {
    8: "Boats",          # boat
    2: "Parking Space",  # car
    7: "Parking Space",  # truck
    5: "Parking Space",  # bus
}


class SatelliteModelManager:
    """Singleton: loads YOLOv8 + GBR, runs satellite image inference."""

    _instance: "SatelliteModelManager | None" = None

    def __init__(self) -> None:
        self.yolo: YOLO | None = None
        self.gbr: GradientBoostingRegressor | None = None
        self.metrics: dict = {}
        self.is_ready = False

    @classmethod
    def get_instance(cls) -> "SatelliteModelManager":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    # ------------------------------------------------------------------
    # Startup
    # ------------------------------------------------------------------
    def load(self) -> None:
        print("[SatelliteModel] Loading YOLOv8n...")
        self.yolo = YOLO("yolov8n.pt")  # auto-downloads on first run

        gbr_path = ARTIFACTS_DIR / "satellite_gbr.pkl"
        metrics_path = ARTIFACTS_DIR / "satellite_metrics.pkl"

        if gbr_path.exists() and metrics_path.exists():
            print("[SatelliteModel] Loading saved GBR...")
            self.gbr     = joblib.load(gbr_path)
            self.metrics = joblib.load(metrics_path)
        else:
            print("[SatelliteModel] No GBR found — training on synthetic data...")
            self.train_and_save()

        self.is_ready = True
        print(f"[SatelliteModel] Ready. R2={self.metrics.get('r2', 0):.4f}")

    # ------------------------------------------------------------------
    # Train GBR on synthetic data (replicates original notebook approach)
    # ------------------------------------------------------------------
    def train_and_save(self) -> None:
        np.random.seed(42)
        n = 5000

        # Feature distributions: confidence-like scores (0–1) or counts
        presence = lambda p, n: np.random.choice([0, 1], n, p=[1 - p, p])

        pools   = presence(0.25, n) * np.random.uniform(0.3, 1.0, n)
        water   = presence(0.15, n).astype(float)
        gardens = presence(0.40, n) * np.random.uniform(0.3, 1.0, n)
        boats   = presence(0.20, n) * np.random.uniform(0.3, 1.0, n)
        parking = presence(0.55, n) * np.random.uniform(0.3, 1.0, n)
        solar   = presence(0.30, n) * np.random.uniform(0.3, 1.0, n)
        tennis  = presence(0.10, n) * np.random.uniform(0.3, 1.0, n)

        X = np.column_stack([pools, water, gardens, boats, parking, solar, tennis])

        price = (
            BASE_PRICE
            + pools   * PRICE_WEIGHTS["Swimming Pools"]
            + tennis  * PRICE_WEIGHTS["Tennis Court"]
            + parking * PRICE_WEIGHTS["Parking Space"]
            + water   * PRICE_WEIGHTS["Waterbodies"]
            + gardens * PRICE_WEIGHTS["Gardens"]
            + boats   * PRICE_WEIGHTS["Boats"]
            + solar   * PRICE_WEIGHTS["Solar Panels"]
            + np.random.normal(0, 3_000_000, n)   # realistic noise
        )

        X_train, X_test, y_train, y_test = train_test_split(
            X, price, test_size=0.2, random_state=42
        )

        self.gbr = GradientBoostingRegressor(
            n_estimators=200, max_depth=4, learning_rate=0.1, random_state=42
        )
        self.gbr.fit(X_train, y_train)

        y_pred = self.gbr.predict(X_test)
        self.metrics = {
            "r2":  round(float(r2_score(y_test, y_pred)), 4),
            "mae": round(float(mean_absolute_error(y_test, y_pred)), 2),
        }

        ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
        joblib.dump(self.gbr,     ARTIFACTS_DIR / "satellite_gbr.pkl")
        joblib.dump(self.metrics, ARTIFACTS_DIR / "satellite_metrics.pkl")
        print(f"[SatelliteModel] GBR saved. R2={self.metrics['r2']}")

    # ------------------------------------------------------------------
    # Feature extraction from image bytes — returns features + detections
    # ------------------------------------------------------------------
    def _extract_features(self, image_bytes: bytes) -> tuple[dict[str, float], list[dict]]:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img   = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Could not decode image. Ensure it is a valid JPEG/PNG.")

        img_h, img_w = img.shape[:2]
        features   = {f: 0.0 for f in FEATURES}
        detections = []  # [{feature, confidence, bbox: [x1,y1,x2,y2] normalized}]

        # ── YOLOv8: boats & parking ──────────────────────────────────
        results = self.yolo(img, verbose=False)[0]
        feature_conf: dict[str, list[float]] = {f: [] for f in FEATURES}

        for box in results.boxes:
            cls_id = int(box.cls[0])
            conf   = float(box.conf[0])
            feat   = COCO_TO_FEATURE.get(cls_id)
            if feat:
                feature_conf[feat].append(conf)
                x1, y1, x2, y2 = box.xyxyn[0].tolist()   # already normalized 0-1
                detections.append({
                    "feature":    feat,
                    "confidence": round(conf, 4),
                    "bbox":       [round(x1, 4), round(y1, 4), round(x2, 4), round(y2, 4)],
                })

        for feat, confs in feature_conf.items():
            if confs:
                features[feat] = float(np.max(confs))

        # ── OpenCV color heuristics — extract mask + largest contour bbox ──
        hsv      = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        total_px = img_h * img_w

        def _mask_detection(mask, feature: str, score: float) -> None:
            """Find the largest contour in a binary mask and add a normalized bbox."""
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            if not contours:
                return
            cx, cy, cw, ch = cv2.boundingRect(max(contours, key=cv2.contourArea))
            detections.append({
                "feature":    feature,
                "confidence": round(score, 4),
                "bbox": [
                    round(cx / img_w, 4),
                    round(cy / img_h, 4),
                    round((cx + cw) / img_w, 4),
                    round((cy + ch) / img_h, 4),
                ],
            })

        # Swimming Pools — small bright-blue rectangles
        pool_mask  = cv2.inRange(hsv, (95, 80, 120), (130, 255, 255))
        pool_ratio = cv2.countNonZero(pool_mask) / total_px
        if 0.001 < pool_ratio < 0.15:
            score = min(pool_ratio * 20, 1.0)
            features["Swimming Pools"] = score
            _mask_detection(pool_mask, "Swimming Pools", score)

        # Waterbodies — large blue/teal areas
        water_mask  = cv2.inRange(hsv, (85, 40, 60), (140, 255, 255))
        water_ratio = cv2.countNonZero(water_mask) / total_px
        if water_ratio > 0.15:
            features["Waterbodies"] = 1.0
            _mask_detection(water_mask, "Waterbodies", 1.0)

        # Gardens — green areas
        green_mask  = cv2.inRange(hsv, (35, 40, 40), (85, 255, 255))
        green_ratio = cv2.countNonZero(green_mask) / total_px
        if green_ratio > 0.05:
            score = min(green_ratio * 5, 1.0)
            features["Gardens"] = score
            _mask_detection(green_mask, "Gardens", score)

        # Tennis Courts — bright blue-green rectangles
        court_mask  = cv2.inRange(hsv, (85, 60, 100), (100, 255, 255))
        court_ratio = cv2.countNonZero(court_mask) / total_px
        if 0.005 < court_ratio < 0.08:
            score = min(court_ratio * 30, 1.0)
            features["Tennis Court"] = score
            _mask_detection(court_mask, "Tennis Court", score)

        # Solar Panels — dark blue-grey arrays
        solar_mask  = cv2.inRange(hsv, (100, 20, 20), (140, 120, 100))
        solar_ratio = cv2.countNonZero(solar_mask) / total_px
        if 0.005 < solar_ratio < 0.20:
            score = min(solar_ratio * 15, 1.0)
            features["Solar Panels"] = score
            _mask_detection(solar_mask, "Solar Panels", score)

        return features, detections

    # ------------------------------------------------------------------
    # Public: predict from raw image bytes
    # ------------------------------------------------------------------
    def predict(self, image_bytes: bytes) -> dict:
        features, detections = self._extract_features(image_bytes)
        feature_vec = np.array([[features[f] for f in FEATURES]])
        predicted   = float(self.gbr.predict(feature_vec)[0])

        formula_price = BASE_PRICE + sum(
            features[f] * PRICE_WEIGHTS[f] for f in FEATURES
        )

        return {
            "predicted_price":   round(predicted, 2),
            "formula_price":     round(formula_price, 2),
            "detected_features": {k: round(v, 4) for k, v in features.items()},
            "detections":        detections,
        }

    # ------------------------------------------------------------------
    # Fetch ESRI satellite tile from lat/lon/zoom (user-provided code)
    # ------------------------------------------------------------------
    @staticmethod
    def fetch_tile_bytes(lat: float, lon: float, zoom: int) -> tuple[bytes, int, int]:
        lat_rad = math.radians(lat)
        n = 2.0 ** zoom
        x = int((lon + 180.0) / 360.0 * n)
        y = int((1.0 - math.log(math.tan(lat_rad) + (1 / math.cos(lat_rad))) / math.pi) / 2.0 * n)

        url = (
            f"https://services.arcgisonline.com/ArcGIS/rest/services/"
            f"World_Imagery/MapServer/tile/{zoom}/{y}/{x}"
        )
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0",
            "Referer":    "https://www.arcgis.com/",
        })
        with urllib.request.urlopen(req, timeout=15) as resp:
            image_bytes = resp.read()

        if len(image_bytes) < 1000:
            raise ValueError(
                f"Tile returned no imagery for lat={lat}, lon={lon}, zoom={zoom}. "
                "Try a different location or lower zoom level."
            )

        return image_bytes, x, y

    # ------------------------------------------------------------------
    # Public: predict from lat/lon coordinates
    # ------------------------------------------------------------------
    def predict_from_coords(self, lat: float, lon: float, zoom: int) -> dict:
        image_bytes, tile_x, tile_y = self.fetch_tile_bytes(lat, lon, zoom)
        result = self.predict(image_bytes)
        result["image_b64"] = base64.b64encode(image_bytes).decode()
        result["tile_info"] = {
            "lat": lat, "lon": lon, "zoom": zoom,
            "tile_x": tile_x, "tile_y": tile_y,
        }
        return result
