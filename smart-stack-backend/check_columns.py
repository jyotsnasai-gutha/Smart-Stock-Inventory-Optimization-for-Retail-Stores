from datasets import load_dataset

ds = load_dataset("t4tiana/store-sales-time-series-forecasting")
df = ds["train"].to_pandas()

print(df.columns)
