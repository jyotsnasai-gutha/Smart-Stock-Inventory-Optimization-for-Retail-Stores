import os 
import joblib
import pandas as pd
from pathlib import Path
from django.utils import timezone
from django.core.management.base import BaseCommand
from inventory.models import Product, Transaction, ReorderPrediction

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_DIR = BASE_DIR / "models"

class Command(BaseCommand):
    help = "Generate reorder quantities using trained XGBoost models"

    def handle(self, *args, **options):
        predictions = []

        for p in Product.objects.all():
            safe_sku = "".join([c if c.isalnum() else "_" for c in p.sku])
            model_path = MODEL_DIR / f"{safe_sku}.joblib"

            if not model_path.exists():
                self.stdout.write(f" - No model for SKU {p.sku}, skipping")
                continue

            model = joblib.load(model_path)

            # Last 7 days transactions
            last_tx = p.transactions.order_by('-date')[:7]
            if not last_tx:
                self.stdout.write(f" - No recent transactions for SKU {p.sku}, skipping")
                continue

            qty_list = [tx.quantity_sold for tx in reversed(last_tx)]
            while len(qty_list) < 7:
                qty_list.insert(0, 0)

            dow = last_tx[0].date.weekday()  # day of week for last date
            X_new = pd.DataFrame([[qty_list[-1], qty_list[-7], dow]],
                                 columns=["lag1", "lag7", "dow"])

            pred = model.predict(X_new)[0]
            pred_qty = max(0, round(pred))

            predictions.append({
                "sku": p.sku,
                "predicted_qty": pred_qty
            })

            # Save prediction to DB
            ReorderPrediction.objects.update_or_create(
                sku=p.sku,
                defaults={
                    "predicted_qty": pred_qty,
                    "generated_at": timezone.now()
                }
            )

            self.stdout.write(f" - Predicted {pred:.2f} for SKU {p.sku}")

        # Save CSV backup
        if predictions:
            df_pred = pd.DataFrame(predictions)
            df_pred.to_csv(BASE_DIR / "reorder_predictions.csv", index=False)
            self.stdout.write(self.style.SUCCESS(
                "Reorder predictions saved to reorder_predictions.csv and database."
            ))
        else:
            self.stdout.write("No predictions generated.")
