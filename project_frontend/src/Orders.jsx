import React, { useState } from 'react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Chip, Button, Snackbar, Alert 
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function Orders({ rows, setRows }) {
  const [success, setSuccess] = useState(false);

  // 1. Filter items that have less than 50 stock
  const lowStockItems = rows.filter(item => item.stock < 50);

  // 2. Calculate total cost
  const totalCost = lowStockItems.reduce((acc, item) => {
    const missing = 50 - item.stock;
    return acc + (missing * item.price);
  }, 0);

  // --- THE SMART LOGIC ---
  const handleRestock = () => {
      // Create a new updated list of rows
      const updatedRows = rows.map(item => {
          if (item.stock < 50) {
              // If low stock, refill it to 50
              return { ...item, stock: 50 }; 
          }
          return item;
      });

      // Save to Global State (Dashboard will update instantly)
      setRows(updatedRows);
      setSuccess(true);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Smart Reorder Recommendations</Typography>

      {/* Summary Card */}
      <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>Estimated Restock Cost</Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>${totalCost.toLocaleString()}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>To bring all inventory to safe levels (50 units)</Typography>
            </Box>
            <ShoppingCartIcon sx={{ fontSize: 80, opacity: 0.2 }} />
        </Box>
      </Paper>

      {/* Data Table */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Product Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Current Stock</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Target</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Order Qty</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Unit Price</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Cost</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lowStockItems.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                   <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                   <Typography variant="h6" color="success.main">Inventory is Healthy!</Typography>
                   <Typography color="textSecondary">No items require restocking at this time.</Typography>
                 </TableCell>
               </TableRow>
            ) : (
              lowStockItems.map((row) => {
                const needed = 50 - row.stock;
                const cost = needed * row.price;
                return (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontWeight: 'bold' }}>{row.name}</TableCell>
                    <TableCell>
                        <Chip label={row.stock} color="warning" size="small" />
                    </TableCell>
                    <TableCell>50</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>+{needed}</TableCell>
                    <TableCell>${row.price}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>${cost.toLocaleString()}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
            variant="contained" 
            size="large" 
            startIcon={<ShoppingCartIcon />} 
            disabled={lowStockItems.length === 0}
            onClick={handleRestock} // This triggers the update
            sx={{ px: 4, py: 1.5 }}
        >
            Process Order & Update Stock
        </Button>
      </Box>

      <Snackbar open={success} autoHideDuration={4000} onClose={() => setSuccess(false)}>
          <Alert severity="success" variant="filled">
              Order Processed! Inventory has been updated.
          </Alert>
      </Snackbar>
    </Box>
  );
}