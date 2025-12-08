import axios from "axios";

const API_BASE = "http://localhost:8000/api/";

// Get all stock items
export const getStock = async () => {
  try {
    const res = await axios.get(`${API_BASE}stock/`);
    return res.data;
  } catch (err) {
    console.error("Error fetching stock:", err);
    return [];
  }
};

// Reorder suggestions (temporary frontend logic)
export const getReorderSuggestions = async () => {
  try {
    const stock = await getStock();

    return stock.map(item => ({
      ...item,
      recommended_reorder_qty:
        item.quantity < 50 ? 50 - item.quantity : 0,
      unit_price: item.unit_price
    }));
  } catch (err) {
    console.error("Error in reorder suggestions:", err);
    return [];
  }
};

// Predict demand for a single SKU
export const predictSku = async (sku) => {
  try {
    const res = await axios.get(`${API_BASE}ml/predict/`, {
      params: { sku }
    });

    return res.data;
  } catch (err) {
    console.error("Error predicting SKU:", err);
    return null;
  }
};
