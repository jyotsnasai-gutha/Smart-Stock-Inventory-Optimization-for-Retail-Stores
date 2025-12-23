from datasets import load_dataset
import pandas as pd
import os

def main():
    print("Downloading dataset...")
    ds = load_dataset("t4tiana/store-sales-time-series-forecasting")

    df = ds["train"].to_pandas()

    print("Dataset loaded. Renaming columns...")

    df = df.rename(columns={
        "store_nbr": "store_id",
        "family": "sku",
        "sales": "qty"
    })

    # Keep only the columns required by your ML model
    df = df[["date", "store_id", "sku", "qty"]]

    out_path = os.path.join(os.path.dirname(__file__), "sales.csv")
    df.to_csv(out_path, index=False)

    print("sales.csv created successfully at:")
    print(out_path)

if __name__ == "__main__":
    main()
