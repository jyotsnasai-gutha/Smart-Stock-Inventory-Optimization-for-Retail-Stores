import os
import pandas as pd
from pathlib import Path
import joblib
from .models import Product, Stock
from django.db.models import Sum

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(exist_ok=True)


# SKU-safe file names
def sanitize_filename(name: str):
    return (
        name.replace("/", "_").replace("\\", "_").replace(" ", "_")
            .replace(":", "_").replace("*", "_").replace("?", "_")
            .replace('"', "_").replace("<", "_").replace(">", "_")
            .replace("|", "_")
    )


# Load sales dataset (CSV)
def load_sales_dataset(csv_path=None):
    csv = csv_path or os.environ.get("SALES_CSV", "")
    if csv and os.path.exists(csv):
        df = pd.read_csv(csv)

        if "date" in df.columns:
            df["date"] = pd.to_datetime(df["date"], errors="coerce")

        return df

    return pd.DataFrame(columns=["date", "store_id", "sku", "qty"])


# Load trained model for a SKU
def load_model_for_sku(sku):
    safe = sanitize_filename(sku)
    model_path = MODEL_DIR / f"{safe}.joblib"

    if not model_path.exists():
        return None

    try:
        return joblib.load(model_path)
    except Exception:
        return None


# Main prediction logic
def predict_daily_for_sku_from_df(df, sku):
    """
    Predict daily demand for a sku using:
    - lag1 (yesterday)
    - lag7 (sum of last 7 days)
    - dow (day of week)
    """

    model = load_model_for_sku(sku)
    if model is None:
        return 0.0

    # Filter dataset for this SKU
    sku_df = df[df["sku"] == sku].copy()

    if sku_df.empty or "qty" not in sku_df.columns:
        # default safe prediction features
        last = 0.0
        lag7 = 0.0
        dow = pd.Timestamp.today().dayofweek
    else:
        # ensure date exists and is datetime
        if "date" in sku_df.columns:
            sku_df["date"] = pd.to_datetime(sku_df["date"], errors="coerce")
            sku_df.set_index("date", inplace=True)

            if isinstance(sku_df.index, pd.DatetimeIndex):
                # daily resample
                sku_df = sku_df.resample("D").sum().fillna(0)

        # lag features
        last = float(sku_df["qty"].iloc[-1]) if len(sku_df) > 0 else 0.0
        lag7 = float(sku_df["qty"].tail(7).sum()) if len(sku_df) >= 7 else last
        dow = (
            int(sku_df.index[-1].dayofweek)
            if isinstance(sku_df.index, pd.DatetimeIndex)
            else pd.Timestamp.today().dayofweek
        )

    # Same feature format used in train_models.py
    X = [[last, lag7, dow]]

    try:
        y_pred = float(model.predict(X)[0])
    except Exception:
        y_pred = 0.0

    return max(0.0, y_pred)


# Build reorder recommendations for all products
def generate_reorder_suggestions(csv_path=None):
    df = load_sales_dataset(csv_path)
    out = []

    for p in Product.objects.all():
        pred = predict_daily_for_sku_from_df(df, p.sku)

        stock_sum = (
            Stock.objects.filter(product=p).aggregate(total=Sum("quantity"))["total"]
            or 0
        )

        demand_over_lead = pred * max(1, p.lead_time_days)
        reorder = max(0, int(round(demand_over_lead + p.safety_stock - stock_sum)))

        out.append({
            "sku": p.sku,
            "predicted_daily_demand": round(pred, 2),
            "current_stock": int(stock_sum),
            "recommended_reorder_qty": int(reorder),
        })

    return out


# API prediction for a single SKU
def predict_for_sku(sku, csv_path=None):
    df = load_sales_dataset(csv_path)
    pred = predict_daily_for_sku_from_df(df, sku)
    return {
        "sku": sku,
        "predicted_daily_demand": round(pred, 2)
    }
