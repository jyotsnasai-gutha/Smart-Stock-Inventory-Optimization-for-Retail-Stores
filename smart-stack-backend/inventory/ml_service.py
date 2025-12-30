import os
import joblib
import pandas as pd
from pathlib import Path
from django.db.models import Sum

from .models import Product, Stock

# --------------------------------------------------
# Paths
# --------------------------------------------------
APP_DIR = Path(__file__).resolve().parent
MODEL_DIR = APP_DIR / "models"
MODEL_DIR.mkdir(exist_ok=True)


# --------------------------------------------------
# Utilities
# --------------------------------------------------
def sanitize_filename(value: str) -> str:
    """Make SKU safe for filenames"""
    return "".join(c if c.isalnum() or c in "-_" else "_" for c in value)


# --------------------------------------------------
# Dataset loader
# --------------------------------------------------
def load_sales_dataset(csv_path: str | None = None) -> pd.DataFrame:
    """
    Expected columns:
    - date
    - sku
    - qty
    """
    path = csv_path or os.environ.get("SALES_CSV")

    if not path or not os.path.exists(path):
        return pd.DataFrame(columns=["date", "sku", "qty"])

    df = pd.read_csv(path)

    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"], errors="coerce")

    return df


# --------------------------------------------------
# Model loader
# --------------------------------------------------
def load_model_for_sku(sku: str):
    safe_sku = sanitize_filename(sku)
    model_path = MODEL_DIR / f"{safe_sku}.joblib"

    if not model_path.exists():
        return None

    try:
        return joblib.load(model_path)
    except Exception:
        return None


# --------------------------------------------------
# Core prediction logic
# --------------------------------------------------
def predict_daily_demand(df: pd.DataFrame, sku: str) -> float:
    """
    Features:
    - last_day_sales
    - last_7_days_sales
    - day_of_week
    """
    model = load_model_for_sku(sku)

    sku_df = df[df["sku"] == sku].copy()

    if sku_df.empty:
        return 0.0

    if "date" in sku_df.columns:
        sku_df.set_index("date", inplace=True)
        sku_df = sku_df.resample("D").sum().fillna(0)

    last_day = float(sku_df["qty"].iloc[-1])
    last_7_days = float(sku_df["qty"].tail(7).sum())
    dow = sku_df.index[-1].dayofweek

    X = [[last_day, last_7_days, dow]]

    # Model prediction
    if model:
        try:
            pred = float(model.predict(X)[0])
            return max(0.0, pred)
        except Exception:
            pass

    # Fallback: average demand
    return round(sku_df["qty"].mean(), 2)


# --------------------------------------------------
# Reorder suggestion generator
# --------------------------------------------------
def generate_reorder_suggestions(csv_path: str | None = None) -> list[dict]:
    df = load_sales_dataset(csv_path)
    results = []

    for product in Product.objects.all():
        daily_demand = predict_daily_demand(df, product.sku)

        current_stock = (
            Stock.objects.filter(product=product)
            .aggregate(total=Sum("quantity"))["total"]
            or 0
        )

        lead_time_demand = daily_demand * max(1, product.lead_time_days)

        reorder_qty = max(
            0,
            int(round(lead_time_demand + product.safety_stock - current_stock))
        )

        results.append({
            "sku": product.sku,
            "predicted_daily_demand": round(daily_demand, 2),
            "current_stock": int(current_stock),
            "recommended_reorder_qty": reorder_qty,
        })

    return results


# --------------------------------------------------
# Single SKU API helper
# --------------------------------------------------
def predict_for_sku(sku: str, csv_path: str | None = None) -> dict:
    df = load_sales_dataset(csv_path)
    demand = predict_daily_demand(df, sku)

    return {
        "sku": sku,
        "predicted_daily_demand": round(demand, 2)
    }
