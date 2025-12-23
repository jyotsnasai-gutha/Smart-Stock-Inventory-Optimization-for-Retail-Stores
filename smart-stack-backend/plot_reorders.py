import pandas as pd
import matplotlib.pyplot as plt

# Load CSV
df = pd.read_csv("inventory/reorder_predictions.csv")

# Use correct column names
sku_col = "sku"
pred_col = "predicted_qty"

# Safety: remove negative values
df[pred_col] = df[pred_col].clip(lower=0)

# Sort by predicted quantity (high to low)
df = df.sort_values(by=pred_col, ascending=False)

# Plot
plt.figure(figsize=(14, 6))
plt.bar(df[sku_col], df[pred_col])
plt.xticks(rotation=90)
plt.ylabel("Predicted Reorder Quantity")
plt.title("SKU Reorder Predictions")

plt.tight_layout()
plt.show()
