"""
House Price Prediction Pipeline
Dataset: Ames Housing (OpenML #42165) — 2,930 homes, 79 features
Model: XGBoost Regressor
"""

import pandas as pd
import numpy as np
from sklearn.datasets import fetch_openml
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.impute import SimpleImputer
from xgboost import XGBRegressor
import warnings
warnings.filterwarnings("ignore")

print("=" * 55)
print(" HOUSE PRICE PREDICTION PIPELINE")
print(" Dataset: Ames Housing | Model: XGBoost")
print("=" * 55)

# ─────────────────────────────────────────
# 1. DOWNLOAD DATASET (via OpenML)
# ─────────────────────────────────────────
print("\n[1/5] Fetching Ames Housing dataset from OpenML...")
dataset = fetch_openml(name="house_prices", version=1, as_frame=True, parser="auto")
df = dataset.frame.copy()
print(f"      Shape: {df.shape[0]:,} rows × {df.shape[1]} columns")
print(f"      Target: SalePrice")

# ─────────────────────────────────────────
# 2. PREPROCESSING
# ─────────────────────────────────────────
print("\n[2/5] Preprocessing...")

TARGET = "SalePrice"
df[TARGET] = pd.to_numeric(df[TARGET], errors="coerce")
df = df.dropna(subset=[TARGET])

# Separate numeric and categorical
num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
cat_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()
num_cols = [c for c in num_cols if c != TARGET]

# Impute numerics with median, categoricals with mode
num_imputer = SimpleImputer(strategy="median")
cat_imputer = SimpleImputer(strategy="most_frequent")

df[num_cols] = num_imputer.fit_transform(df[num_cols])
if cat_cols:
    df[cat_cols] = cat_imputer.fit_transform(df[cat_cols])

# One-hot encode categoricals
df = pd.get_dummies(df, columns=cat_cols, drop_first=True)

# ─────────────────────────────────────────
# 3. FEATURE ENGINEERING
# ─────────────────────────────────────────
print("\n[3/5] Feature engineering & splitting...")

# Add useful derived features if base columns exist
if "YearBuilt" in df.columns:
    df["HouseAge"]   = 2010 - df["YearBuilt"]
if "YearRemodAdd" in df.columns:
    df["YearsSinceRemod"] = 2010 - df["YearRemodAdd"]
if "TotalBsmtSF" in df.columns and "GrLivArea" in df.columns:
    df["TotalSF"]    = df["TotalBsmtSF"] + df["GrLivArea"]
if "FullBath" in df.columns and "HalfBath" in df.columns:
    df["TotalBaths"] = df["FullBath"] + 0.5 * df["HalfBath"]

FEATURES = [c for c in df.columns if c != TARGET]
X = df[FEATURES]
y = df[TARGET]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

scaler = StandardScaler()
X_train_sc = scaler.fit_transform(X_train)
X_test_sc  = scaler.transform(X_test)

print(f"      Train: {X_train.shape[0]:,} | Test: {X_test.shape[0]:,} | Features: {len(FEATURES)}")

# ─────────────────────────────────────────
# 4. TRAIN MODEL
# ─────────────────────────────────────────
print("\n[4/5] Training XGBoost Regressor...")

model = XGBRegressor(
    n_estimators=500,
    learning_rate=0.05,
    max_depth=5,
    min_child_weight=3,
    subsample=0.8,
    colsample_bytree=0.8,
    reg_alpha=0.1,
    reg_lambda=1.0,
    random_state=42,
    n_jobs=-1,
    verbosity=0,
)
model.fit(X_train_sc, y_train, eval_set=[(X_test_sc, y_test)], verbose=False)

# ─────────────────────────────────────────
# 5. EVALUATE
# ─────────────────────────────────────────
y_pred = model.predict(X_test_sc)

mae  = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2   = r2_score(y_test, y_pred)
mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100

print("\n" + "-"*45)
print("  MODEL PERFORMANCE ON TEST SET")
print("-"*45)
print(f"  R2 Score : {r2:.4f}  ({r2*100:.1f}% variance explained)")
print(f"  MAE      : ${mae:>10,.0f}")
print(f"  RMSE     : ${rmse:>10,.0f}")
print(f"  MAPE     : {mape:.2f}%")
print("-"*45)

# ─────────────────────────────────────────
# 6. INFERENCE — 3 New Houses
# ─────────────────────────────────────────
print("\n[5/5] Inference — predicting on 3 new houses...\n")

# Build 3 sample houses using the training data statistics as base
sample_base = X_train.median().to_dict()

def make_house(overrides):
    h = sample_base.copy()
    h.update(overrides)
    return h

houses = [
    make_house({   # Small/cheap house
        "GrLivArea": 800, "OverallQual": 4, "OverallCond": 5,
        "GarageCars": 1, "TotalBsmtSF": 600,
        "HouseAge": 50 if "HouseAge" in sample_base else 0,
    }),
    make_house({   # Average family home
        "GrLivArea": 1800, "OverallQual": 6, "OverallCond": 6,
        "GarageCars": 2, "TotalBsmtSF": 1000,
        "HouseAge": 20 if "HouseAge" in sample_base else 0,
    }),
    make_house({   # Luxury home
        "GrLivArea": 3500, "OverallQual": 9, "OverallCond": 8,
        "GarageCars": 3, "TotalBsmtSF": 2000,
        "HouseAge": 5 if "HouseAge" in sample_base else 0,
    }),
]

new_df = pd.DataFrame(houses)[FEATURES]
new_sc  = scaler.transform(new_df)
preds   = model.predict(new_sc)

labels = ["Small/Older Home", "Average Family Home", "Luxury Home"]
for label, pred in zip(labels, preds):
    print(f"  {label:<22} => Predicted: ${pred:>10,.0f}")

# ─────────────────────────────────────────
# 7. TOP FEATURE IMPORTANCE
# ─────────────────────────────────────────
print("\n  Top 10 Most Important Features:")
importance = pd.Series(model.feature_importances_, index=FEATURES)
top10 = importance.nlargest(10)
for feat, score in top10.items():
    bar = "|" * int(score * 300)
    print(f"  {feat:<30} {bar} {score:.4f}")

print("\n  Done! Pipeline complete.")

