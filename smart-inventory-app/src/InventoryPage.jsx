import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  LinearProgress,
  Snackbar,
  Alert,
  IconButton
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  LocalOffer as LocalOfferIcon,
  TrendingUp as TrendingUpIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

import { getStock } from "./api";

const normalizeCategory = (cat) => {
  if (!cat) return "Uncategorized";
  const c = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
  if (c === "Electronic") return "Electronics";
  return c;
};

const getCategoryData = (rows) => {
  const count = {};
  rows.forEach((item) => {
    const c = normalizeCategory(item.category);
    count[c] = (count[c] || 0) + 1;
  });
  return Object.keys(count).map((key) => ({ name: key, value: count[key] }));
};

function StatCard({ title, value, icon, color }) {
  return (
    <Paper
      sx={{
        p: 3,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: "100%",
        boxShadow: 1,
        borderRadius: 3
      }}
    >
      <Box>
        <Typography
          color="textSecondary"
          variant="subtitle2"
          sx={{
            fontWeight: "bold",
            textTransform: "uppercase",
            fontSize: "0.75rem"
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", color: "#333", mt: 1 }}
        >
          {value}
        </Typography>
      </Box>
      <Box sx={{ color: color, p: 1.5, borderRadius: "12px", bgcolor: `${color}15` }}>
        {icon}
      </Box>
    </Paper>
  );
}

export default function InventoryPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    const loadStock = async () => {
      try {
        const data = await getStock();

        const mapped = data.map((item) => ({
          id: item.id,
          name: item.product_name,
          category: item.category || "Uncategorized",
          stock: item.quantity,
          price: item.unit_price
        }));

        setRows(mapped);
      } catch (err) {
        console.error("Failed to load stock:", err);
        setAlertMessage("Unable to load inventory data.");
        setAlertOpen(true);
      } finally {
        setLoading(false);
      }
    };

    loadStock();
  }, []);

  const categoryData = getCategoryData(rows);

  if (loading) {
    return (
      <Box sx={{ width: "100%", mt: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <LinearProgress sx={{ width: "50%", mb: 2 }} />
        <Typography color="text.secondary">Loading Inventory...</Typography>
      </Box>
    );
  }

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Product Name", width: 220 },
    { field: "category", headerName: "Category", width: 140 },
    {
      field: "stock",
      headerName: "Stock Level",
      type: "number",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value < 40 ? "error" : "success"}
          variant={params.value < 40 ? "filled" : "outlined"}
          size="small"
        />
      )
    },
    {
      field: "price",
      headerName: "Unit Price",
      type: "number",
      width: 140,
      renderCell: (params) => `₹${params.value}`
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: () => (
        <Box>
          <IconButton color="primary" size="small">
            <EditIcon />
          </IconButton>
          <IconButton color="error" size="small">
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Products"
            value={rows.length}
            icon={<InventoryIcon fontSize="large" />}
            color="#005eb8"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Critical Stock"
            value={rows.filter((r) => r.stock < 40).length}
            icon={<WarningIcon fontSize="large" />}
            color="#d32f2f"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Active Categories"
            value={categoryData.length}
            icon={<LocalOfferIcon fontSize="large" />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Asset Value"
            value={`₹${rows.reduce((sum, item) => sum + item.stock * item.price, 0).toLocaleString()}`}
            icon={<TrendingUpIcon fontSize="large" />}
            color="#2e7d32"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ height: 600, width: "100%", borderRadius: 3, overflow: "hidden", boxShadow: 2 }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSizeOptions={[5, 10, 20]}
              checkboxSelection
              disableRowSelectionOnClick
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true } }}
            />
          </Paper>
        </Grid>
      </Grid>

      <Snackbar open={alertOpen} autoHideDuration={4000} onClose={() => setAlertOpen(false)}>
        <Alert severity="error" variant="filled">{alertMessage}</Alert>
      </Snackbar>
    </Box>
  );
}
