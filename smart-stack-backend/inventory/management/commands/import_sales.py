import pandas as pd
from django.core.management.base import BaseCommand
from inventory.models import Store, Product, Transaction
from tqdm import tqdm

try:
    from datasets import load_dataset
except ImportError:
    load_dataset = None


CHUNK_SIZE = 5000


class Command(BaseCommand):
    help = "Import sales data into Store, Product, and Transaction tables"

    def add_arguments(self, parser):
        parser.add_argument(
            "--hf-id",
            default="t4tiana/store-sales-time-series-forecasting",
            help="Hugging Face dataset ID",
        )
        parser.add_argument(
            "--csv",
            default="",
            help="Optional local CSV file path",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=0,
            help="Limit number of rows (for testing)",
        )

    def handle(self, *args, **options):
        hf_id = options["hf_id"]
        csv_path = options["csv"]
        limit = options["limit"]

        # --------------------------------------------------
        # Load dataset
        # --------------------------------------------------
        if csv_path:
            self.stdout.write(f"📂 Loading CSV from {csv_path}")
            df = pd.read_csv(csv_path, parse_dates=["date"])
        else:
            if not load_dataset:
                self.stderr.write("❌ datasets package not installed")
                return

            self.stdout.write(f"⬇ Downloading HuggingFace dataset: {hf_id}")
            dataset = load_dataset(hf_id)
            df = dataset["train"].to_pandas()
            df["date"] = pd.to_datetime(df["date"], errors="coerce")

        # --------------------------------------------------
        # Normalize columns
        # --------------------------------------------------
        df = df.rename(columns={
            "store_nbr": "store_id",
            "family": "sku",
            "sales": "quantity_sold",
        })

        df = df[["date", "store_id", "sku", "quantity_sold"]]
        df["quantity_sold"] = df["quantity_sold"].fillna(0).astype(int)

        if limit > 0:
            df = df.head(limit)

        self.stdout.write(f"📊 Rows to import: {len(df)}")

        # --------------------------------------------------
        # Stores
        # --------------------------------------------------
        store_ids = df["store_id"].astype(int).unique()
        existing_stores = {s.name: s for s in Store.objects.all()}

        new_stores = [
            Store(name=str(sid), location="Auto Imported")
            for sid in store_ids
            if str(sid) not in existing_stores
        ]

        Store.objects.bulk_create(new_stores, ignore_conflicts=True)
        store_map = {s.name: s for s in Store.objects.all()}

        # --------------------------------------------------
        # Products
        # --------------------------------------------------
        skus = df["sku"].astype(str).unique()
        existing_products = {p.sku: p for p in Product.objects.all()}

        new_products = [
            Product(
                sku=sku,
                name=sku,
                category="Imported",
            )
            for sku in skus
            if sku not in existing_products
        ]

        Product.objects.bulk_create(new_products, ignore_conflicts=True)
        product_map = {p.sku: p for p in Product.objects.all()}

        # --------------------------------------------------
        # Transactions
        # --------------------------------------------------
        transactions = []
        pbar = tqdm(total=len(df), desc="🧾 Importing Transactions")

        for _, row in df.iterrows():
            store = store_map.get(str(int(row["store_id"])))
            product = product_map.get(str(row["sku"]))

            if not store or not product:
                pbar.update(1)
                continue

            transactions.append(
                Transaction(
                    store=store,
                    product=product,
                    date=row["date"].date(),
                    quantity_sold=int(row["quantity_sold"]),
                    unit_price=product.unit_price,
                )
            )

            if len(transactions) >= CHUNK_SIZE:
                Transaction.objects.bulk_create(transactions)
                transactions.clear()

            pbar.update(1)

        if transactions:
            Transaction.objects.bulk_create(transactions)

        pbar.close()

        self.stdout.write(
            self.style.SUCCESS("✅ Sales data imported successfully")
        )
