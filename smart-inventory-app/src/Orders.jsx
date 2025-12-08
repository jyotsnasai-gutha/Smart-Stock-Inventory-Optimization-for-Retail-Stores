import React, { useState, useEffect } from "react";
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, Snackbar, Alert, TextField
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function Orders({ rows, setRows }) {
  const [success, setSuccess] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [sku, setSku] = useState("");
  const [prediction, setPrediction] = useState(null);

  // Fetch stock data from backend
  useEffect(() => {
    fetch("http://localhost:8000/api/stock/")
      .then(res => res.json())
      .then(data => {
        // Map backend stock data to frontend rows
        const mappedRows = data.map(item => ({
          id: item.id,
          sku: item.product_name || item.product, // adjust if nested
          stock: item.quantity,
          price: item.unit_price || 0,
        }));
        setRows(mappedRows);
        setSuggestions(mappedRows);
      })
      .catch(err => console.error("Fetch stock failed:", err));
  }, [setRows]);

  // Filter items that need reorder (stock < 50)
  const lowStockItems = suggestions.filter(item => item.stock < 50);

  // Calculate total cost
  const totalCost = lowStockItems.reduce(
    (acc, item) => acc + (50 - item.stock) * item.price,
    0
  );

  // Handle restock
  const handleRestock = () => {
    const updatedRows = rows.map(item => {
      const suggestion = lowStockItems.find(s => s.id === item.id);
      if (suggestion) {
        return { ...item, stock: 50 };
      }
      return item;
    });
    setRows(updatedRows);
    setSuccess(true);
  };

  // Predict SKU (example API)
  const handlePredict = async () => {
    if (!sku) return;
    try {
      const res = await fetch("http://localhost:8000/api/ml/predict/?sku=" + sku);
      const data = await res.json();
      setPrediction(data);
    } catch (err) {
      console.error("Prediction failed:", err);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        Smart Reorder Recommendations
      </Typography>

      {/* Predict SKU */}
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <TextField
          label="Enter SKU"
          variant="outlined"
          value={sku}
          onChange={e => setSku(e.target.value)}
          size="small"
        />
        <Button variant="contained" onClick={handlePredict}>
          Predict
        </Button>
      </Box>
      {prediction && (
        <Paper sx={{ p: 2, mb: 3, backgroundColor: "#e0f7fa" }}>
          <Typography>SKU: {prediction.sku}</Typography>
          <Typography>
            Predicted Daily Demand: {prediction.predicted_daily_demand}
          </Typography>
        </Paper>
      )}

      {/* Summary Card */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
          color: "white"
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Estimated Restock Cost
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: "bold", my: 1 }}>
              ${totalCost.toLocaleString()}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              To bring all inventory to safe levels (50 units)
            </Typography>
          </Box>
          <ShoppingCartIcon sx={{ fontSize: 80, opacity: 0.2 }} />
        </Box>
      </Paper>

      {/* Data Table */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>SKU / Product Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Current Stock</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>
                Order Qty
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Unit Price</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                Total Cost
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lowStockItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                  <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" color="success.main">
                    Inventory is Healthy!
                  </Typography>
                  <Typography color="textSecondary">
                    No items require restocking at this time.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              lowStockItems.map((item, idx) => {
                const cost = (50 - item.stock) * item.price;
                return (
                  <TableRow key={idx} hover>
                    <TableCell sx={{ fontWeight: "bold" }}>{item.sku}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.stock}
                        color={item.stock < 40 ? "error" : "success"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>
                      +{50 - item.stock}
                    </TableCell>
                    <TableCell>${item.price}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      ${cost.toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<ShoppingCartIcon />}
          disabled={lowStockItems.length === 0}
          onClick={handleRestock}
          sx={{ px: 4, py: 1.5 }}
        >
          Process Order & Update Stock
        </Button>
      </Box>

      <Snackbar
        open={success}
        autoHideDuration={4000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" variant="filled">
          Order Processed! Inventory has been updated.
        </Alert>
      </Snackbar>
    </Box>
  );
}
