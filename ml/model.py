"""
ML model lifecycle: train, save, load, predict.
Artifacts are persisted in /artifacts so the API loads instantly on restart.
"""

import joblib
import numpy as np
import pandas as pd
import warnings
from pathlib import Path
from sklearn.datasets import fetch_openml
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from xgboost import XGBRegressor

warnings.filterwarnings("ignore")

ARTIFACTS_DIR = Path(__file__).parent.parent / "artifacts"
TARGET = "SalePrice"


class ModelManager:
    """Singleton that owns the trained model and all preprocessing state."""

    _instance: "ModelManager | None" = None

    def __init__(self) -> None:
        self.model: XGBRegressor | None = None
        self.scaler: StandardScaler | None = None
        self.feature_names: list[str] = []
        self.feature_defaults: dict[str, float] = {}
        self.metrics: dict[str, float] = {}
        self.is_ready = False

    # ------------------------------------------------------------------
    # Singleton access
    # ------------------------------------------------------------------
    @classmethod
    def get_instance(cls) -> "ModelManager":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    # ------------------------------------------------------------------
    # Startup: load saved artifacts or train fresh
    # ------------------------------------------------------------------
    def load(self) -> None:
        if self._artifacts_exist():
            print("[ModelManager] Loading saved artifacts...")
            self._load_artifacts()
        else:
            print("[ModelManager] No artifacts found — training from scratch...")
            self.train_and_save()
        self.is_ready = True
        print(f"[ModelManager] Ready. R2={self.metrics.get('r2', 0):.4f}")

    def _artifacts_exist(self) -> bool:
        return all(
            (ARTIFACTS_DIR / f).exists()
            for f in ["model.json", "scaler.pkl", "features.pkl",
                      "defaults.pkl", "metrics.pkl"]
        )

    def _load_artifacts(self) -> None:
        self.model = XGBRegressor()
        self.model.load_model(str(ARTIFACTS_DIR / "model.json"))
        self.scaler          = joblib.load(ARTIFACTS_DIR / "scaler.pkl")
        self.feature_names   = joblib.load(ARTIFACTS_DIR / "features.pkl")
        self.feature_defaults = joblib.load(ARTIFACTS_DIR / "defaults.pkl")
        self.metrics         = joblib.load(ARTIFACTS_DIR / "metrics.pkl")

    # ------------------------------------------------------------------
    # Train & persist
    # ------------------------------------------------------------------
    def train_and_save(self) -> dict:
        print("[ModelManager] Fetching Ames Housing dataset...")
        dataset = fetch_openml(name="house_prices", version=1, as_frame=True, parser="auto")
        df = dataset.frame.copy()

        df[TARGET] = pd.to_numeric(df[TARGET], errors="coerce")
        df = df.dropna(subset=[TARGET])

        num_cols = [c for c in df.select_dtypes(include=[np.number]).columns if c != TARGET]
        cat_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()

        num_imp = SimpleImputer(strategy="median")
        cat_imp = SimpleImputer(strategy="most_frequent")
        df[num_cols] = num_imp.fit_transform(df[num_cols])
        if cat_cols:
            df[cat_cols] = cat_imp.fit_transform(df[cat_cols])

        df = pd.get_dummies(df, columns=cat_cols, drop_first=True)

        # Derived features
        if "YearBuilt" in df.columns:
            df["HouseAge"] = 2010 - df["YearBuilt"]
        if "YearRemodAdd" in df.columns:
            df["YearsSinceRemod"] = 2010 - df["YearRemodAdd"]
        if "TotalBsmtSF" in df.columns and "GrLivArea" in df.columns:
            df["TotalSF"] = df["TotalBsmtSF"] + df["GrLivArea"]
        if "FullBath" in df.columns and "HalfBath" in df.columns:
            df["TotalBaths"] = df["FullBath"] + 0.5 * df["HalfBath"]

        features = [c for c in df.columns if c != TARGET]
        X, y = df[features], df[TARGET]

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        scaler = StandardScaler()
        X_train_sc = scaler.fit_transform(X_train)
        X_test_sc  = scaler.transform(X_test)

        print("[ModelManager] Training XGBoost...")
        model = XGBRegressor(
            n_estimators=500, learning_rate=0.05, max_depth=5,
            min_child_weight=3, subsample=0.8, colsample_bytree=0.8,
            reg_alpha=0.1, reg_lambda=1.0, random_state=42,
            n_jobs=-1, verbosity=0,
        )
        model.fit(X_train_sc, y_train, eval_set=[(X_test_sc, y_test)], verbose=False)

        y_pred = model.predict(X_test_sc)
        metrics = {
            "r2":   float(r2_score(y_test, y_pred)),
            "mae":  float(mean_absolute_error(y_test, y_pred)),
            "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred))),
            "mape": float(np.mean(np.abs((y_test - y_pred) / y_test)) * 100),
        }

        # Defaults = training-set medians (fills unseen/optional features)
        defaults = X_train.median().to_dict()

        # Persist
        ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
        model.save_model(str(ARTIFACTS_DIR / "model.json"))
        joblib.dump(scaler,   ARTIFACTS_DIR / "scaler.pkl")
        joblib.dump(features, ARTIFACTS_DIR / "features.pkl")
        joblib.dump(defaults, ARTIFACTS_DIR / "defaults.pkl")
        joblib.dump(metrics,  ARTIFACTS_DIR / "metrics.pkl")
        print("[ModelManager] Artifacts saved.")

        self.model            = model
        self.scaler           = scaler
        self.feature_names    = features
        self.feature_defaults = defaults
        self.metrics          = metrics
        return metrics

    # ------------------------------------------------------------------
    # Inference
    # ------------------------------------------------------------------
    def predict(self, input_features: dict) -> float:
        """Accept a partial dict of known features; fill rest with training medians."""
        row = {**self.feature_defaults, **input_features}
        df  = pd.DataFrame([row])[self.feature_names]
        scaled = self.scaler.transform(df)
        return float(self.model.predict(scaled)[0])

    def predict_batch(self, inputs: list[dict]) -> list[float]:
        rows = [{**self.feature_defaults, **inp} for inp in inputs]
        df   = pd.DataFrame(rows)[self.feature_names]
        scaled = self.scaler.transform(df)
        return self.model.predict(scaled).tolist()

    def top_features(self, n: int = 10) -> list[dict]:
        importance = pd.Series(
            self.model.feature_importances_, index=self.feature_names
        )
        return [
            {"feature": feat, "importance": round(float(score), 6)}
            for feat, score in importance.nlargest(n).items()
        ]
