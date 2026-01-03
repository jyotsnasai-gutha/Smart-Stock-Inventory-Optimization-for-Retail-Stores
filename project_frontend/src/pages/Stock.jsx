import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../AuthContext';

const Stock = () => {
  const { user, isManager, token } = useAuth();
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ quantity: '' });
  const [filterProduct, setFilterProduct] = useState('');
  const [filterStore, setFilterStore] = useState('');
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);

  useEffect(() => {
    fetchStock();
    fetchProducts();
    fetchStores();
  }, []);

  const fetchStock = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/stock/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch stock');
      const data = await response.json();
      setStock(data.stock || data);
    } catch (err) {
      console.error('Error fetching stock:', err);
      setError(err.message);
      setStock([
        { id: 1, product_id: 1, product_name: 'iPhone 15', store_id: 1, store_name: 'Downtown', quantity: 50 },
        { id: 2, product_id: 2, product_name: 'Galaxy S24', store_id: 2, store_name: 'Uptown', quantity: 30 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStores(data.stores || data);
      }
    } catch (err) {
      console.error('Error fetching stores:', err);
    }
  };

  const handleOpenDialog = (item) => {
    setEditingId(item.id);
    setFormData({ quantity: item.quantity });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
  };

  const handleUpdateStock = async () => {
    try {
      const response = await fetch(`/api/stock/${editingId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update stock');

      setError('');
      handleCloseDialog();
      fetchStock();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredStock = stock.filter(s =>
    (!filterProduct || s.product_name.includes(filterProduct)) &&
    (!filterStore || s.store_name.includes(filterStore))
  );

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Stock Management</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <TextField
              select
              placeholder="Filter by product"
              size="small"
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              SelectProps={{ native: true }}
              sx={{ minWidth: 200 }}
            >
              <option value="">All Products</option>
              {products.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </TextField>
            <TextField
              select
              placeholder="Filter by store"
              size="small"
              value={filterStore}
              onChange={(e) => setFilterStore(e.target.value)}
              SelectProps={{ native: true }}
              sx={{ minWidth: 200 }}
            >
              <option value="">All Stores</option>
              {stores.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </TextField>
          </Stack>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Product</strong></TableCell>
                  <TableCell><strong>Store</strong></TableCell>
                  <TableCell align="right"><strong>Quantity</strong></TableCell>
                  {isManager && <TableCell align="center"><strong>Action</strong></TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStock.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell>{item.store_name}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    {isManager && (
                      <TableCell align="center">
                        <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpenDialog(item)}>
                          Update
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Update Stock Quantity</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleUpdateStock} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Stock;
