# inventory/management/commands/train_models.py

import os
from django.core.management.base import BaseCommand
import pandas as pd
from inventory.models import Product, Transaction
from xgboost import XGBRegressor

from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib
from pathlib import Path
from django.db.models import Sum
import math
import datetime


# Sanitize SKU for safe filename
def sanitize_filename(name: str):
    return (
        name.replace("/", "_")
            .replace("\\", "_")
            .replace(" ", "_")
            .replace(":", "_")
            .replace("*", "_")
            .replace("?", "_")
            .replace('"', "_")
            .replace("<", "_")
            .replace(">", "_")
            .replace("|", "_")
    )


# Directories
BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_DIR = BASE_DIR / "models"
LOG_FILE = MODEL_DIR / "training_logs.csv"

MODEL_DIR.mkdir(exist_ok=True)


class Command(BaseCommand):
    help = "Train RandomForestRegressor per SKU using daily-aggregated transactions."

    def add_arguments(self, parser):
        parser.add_argument("--min-days", type=int, default=30,
                            help="Minimum number of days of history required to train a model.")
        parser.add_argument("--n-estimators", type=int, default=100)
        parser.add_argument("--force", action="store_true",
                            help="Retrain models even if model file exists")

    def handle(self, *args, **options):
        min_days = options["min_days"]
        n_estimators = options["n_estimators"]
        force = options["force"]

        products = Product.objects.all()
        if not products.exists():
            self.stdout.write("No products found. Run import_sales first.")
            return

        # Create log file if not exists
        if not LOG_FILE.exists():
            pd.DataFrame(columns=[
                "timestamp",
                "sku",
                "days_used",
                "mae",
                "rmse",
                "model_path"
            ]).to_csv(LOG_FILE, index=False)

        for p in products:
            sku = p.sku
            safe_sku = sanitize_filename(sku)

            self.stdout.write(f"Processing SKU: {sku}")

            qs = (
                Transaction.objects.filter(product=p)
                .values("date")
                .annotate(qty=Sum("qty"))
                .order_by("date")
            )

            if not qs:
                self.stdout.write(f" - no transactions for {sku}, skipping")
                continue

            df = pd.DataFrame(list(qs))
            df["date"] = pd.to_datetime(df["date"])
            df = df.set_index("date").resample("D").sum().fillna(0)

            if len(df) < min_days:
                self.stdout.write(f" - only {len(df)} days of data; need {min_days}, skipping")
                continue

            # Feature engineering
            df["lag1"] = df["qty"].shift(1).fillna(0)
            df["lag7"] = df["qty"].shift(7).fillna(0)
            df["dow"] = df.index.dayofweek

            df = df.dropna()

            X = df[["lag1", "lag7", "dow"]]
            y = df["qty"]

            # Train model
            model = XGBRegressor(
                    n_estimators=n_estimators,
                    learning_rate=0.1,
                    max_depth=6,
                    subsample=0.9,
                    colsample_bytree=0.9,
                    objective="reg:squarederror",
                    random_state=42,
                )

            model.fit(X, y)


            # Predictions for metric evaluation
            preds = model.predict(X)

            mae = mean_absolute_error(y, preds)
            rmse = math.sqrt(mean_squared_error(y, preds))

            model_path = MODEL_DIR / f"{safe_sku}.joblib"

            if model_path.exists() and not force:
                self.stdout.write(f" - model exists at {model_path}; use --force to overwrite")
                continue

            joblib.dump(model, model_path)

            self.stdout.write(self.style.SUCCESS(
                f" - Model saved for {sku} | MAE={mae:.2f} | RMSE={rmse:.2f}"
            ))

            # Save training log
            log_row = {
                "timestamp": datetime.datetime.now().isoformat(),
                "sku": sku,
                "days_used": len(df),
                "mae": round(mae, 4),
                "rmse": round(rmse, 4),
                "model_path": str(model_path)
            }

            log_df = pd.DataFrame([log_row])
            log_df.to_csv(LOG_FILE, mode="a", header=False, index=False)

        self.stdout.write(self.style.SUCCESS("Training complete. Logs saved."))

