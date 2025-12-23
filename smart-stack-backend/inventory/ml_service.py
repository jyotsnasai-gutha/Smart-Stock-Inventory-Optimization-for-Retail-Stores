import os
import pandas as pd
from datasets import load_dataset
from pathlib import Path
from sklearn.ensemble import RandomForestRegressor
import joblib
from .models import Product, Stock
from django.db.models import Sum

MODEL_DIR = Path(__file__).resolve().parent / "models"
MODEL_DIR.mkdir(exist_ok=True)

def load_sales_dataset(hf_id=None, csv_path=None):
    if hf_id:
        ds = load_dataset(hf_id)
        df = pd.DataFrame(ds["train"][:])
        df["date"] = pd.to_datetime(df["date"])
    elif csv_path and os.path.exists(csv_path):
        df = pd.read_csv(csv_path, parse_dates=["date"])
    else:
        return pd.DataFrame(columns=["date","store_id","sku","qty"])
    return df

def train_model(df, sku):
    s = df[df["sku"]==sku].groupby("date")["qty"].sum().reset_index()
    if s.empty: return None
    s = s.set_index("date").resample("D").sum().fillna(0)
    s["lag1"]=s["qty"].shift(1).fillna(0)
    s["lag7"]=s["qty"].shift(7).fillna(0)
    s["dow"]=s.index.dayofweek
    if len(s) < 10: return None
    model = RandomForestRegressor()
    model.fit(s[["lag1","lag7","dow"]], s["qty"])
    path = MODEL_DIR / f"{sku}.joblib"
    joblib.dump(model, path)
    return path

def generate_reorder_suggestions():
    df = load_sales_dataset(csv_path=os.environ.get("SALES_CSV",""))
    out=[]
    for p in Product.objects.all():
        path = train_model(df, p.sku)
        if path:
            model = joblib.load(path)
            sku_df = df[df["sku"]==p.sku].set_index("date").resample("D").sum().fillna(0)
            last = sku_df["qty"].iloc[-1] if not sku_df.empty else 0
            lag7 = sku_df["qty"].tail(7).sum() if len(sku_df)>=7 else last
            pred = model.predict([[last, lag7, sku_df.index[-1].dayofweek]])[0]
        else:
            pred=0

        stock_sum = Stock.objects.filter(product=p).aggregate(total=Sum("quantity"))["total"] or 0
        reorder = max(0, int(pred)*p.lead_time_days + p.safety_stock - stock_sum)

        out.append({
            "sku": p.sku,
            "predicted_demand": int(pred),
            "current_stock": stock_sum,
            "recommended_reorder_qty": reorder
        })
    return out
