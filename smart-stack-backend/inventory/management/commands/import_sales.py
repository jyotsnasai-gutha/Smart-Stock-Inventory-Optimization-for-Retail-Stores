# inventory/management/commands/import_sales.py
import os
from django.core.management.base import BaseCommand
from datasets import load_dataset
import pandas as pd
from inventory.models import Store, Product, Transaction
from django.db import transaction as db_transaction
from tqdm import tqdm

CHUNK_SIZE = 5000  # tune based on memory

class Command(BaseCommand):
    help = "Import sales dataset from Hugging Face (or a local CSV) into Store/Product/Transaction tables."

    def add_arguments(self, parser):
        parser.add_argument("--hf-id", default="t4tiana/store-sales-time-series-forecasting",
                            help="Hugging Face dataset id")
        parser.add_argument("--csv", default=os.environ.get("SALES_CSV", ""),
                            help="Optional local CSV path (if given, skip HF download)")
        parser.add_argument("--limit", type=int, default=0,
                            help="Optional: limit number of rows imported (for testing)")

    def handle(self, *args, **options):
        hf_id = options["hf_id"]
        csv_path = options["csv"]
        limit = options["limit"]

        if csv_path:
            self.stdout.write(f"Loading CSV from: {csv_path}")
            df = pd.read_csv(csv_path, parse_dates=["date"])
        else:
            self.stdout.write(f"Downloading dataset {hf_id} from Hugging Face...")
            ds = load_dataset(hf_id)
            df = ds["train"].to_pandas()
            df["date"] = pd.to_datetime(df["date"])

        # Normalize column names to match your models
        df = df.rename(columns={
            "store_nbr": "store_id",
            "family": "sku",
            "sales": "qty"
        })[["date", "store_id", "sku", "qty"]]

        if limit and limit > 0:
            df = df.head(limit)

        # Map unique stores and skus
        stores = sorted(df["store_id"].unique())
        skus = sorted(df["sku"].unique())

        # Bulk create missing Store objects
        existing_stores = {s.name for s in Store.objects.filter(name__in=stores)}
        new_stores = [Store(name=s, location="") for s in stores if s not in existing_stores]
        if new_stores:
            Store.objects.bulk_create(new_stores)
            self.stdout.write(f"Created {len(new_stores)} stores")

        # Bulk create missing Product objects
        existing_skus = {p.sku for p in Product.objects.filter(sku__in=skus)}
        new_products = []
        for sku in skus:
            if sku not in existing_skus:
                new_products.append(Product(sku=sku, name=str(sku)))
        if new_products:
            Product.objects.bulk_create(new_products)
            self.stdout.write(f"Created {len(new_products)} products")

        # Build mapping dicts for quick lookup
        store_map = {int(s.name): s for s in Store.objects.filter(name__in=stores)}
        product_map = {p.sku: p for p in Product.objects.filter(sku__in=skus)}

        # Prepare Transaction objects and bulk insert in chunks
        rows = []
        pbar = tqdm(total=len(df), unit="rows", desc="Preparing transactions")
        for _, row in df.iterrows():
            store_key = row["store_id"]
            sku = row["sku"]
            qty = int(row["qty"]) if not pd.isna(row["qty"]) else 0
            dt = pd.to_datetime(row["date"]).date()

            store_obj = store_map.get(int(store_key)) or Store.objects.get(name=store_key)
            product_obj = product_map.get(sku)

            rows.append(Transaction(store=store_obj, product=product_obj, date=dt, qty=qty))
            if len(rows) >= CHUNK_SIZE:
                Transaction.objects.bulk_create(rows)
                rows = []
            pbar.update(1)

        if rows:
            Transaction.objects.bulk_create(rows)
        pbar.close()
        self.stdout.write(self.style.SUCCESS("Import finished."))
