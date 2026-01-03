import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Button, Chip, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, 
  Snackbar, Alert, List, ListItem, ListItemText, ListItemIcon, Divider, LinearProgress, Fade, Avatar
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid'; 
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import EditIcon from '@mui/icons-material/Edit';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'; 
import PersonIcon from '@mui/icons-material/Person'; // Icon for the user
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// --- HELPERS ---
const normalizeCategory = (cat) => {
  if (!cat) return "Uncategorized";
  const clean = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
  if (clean === 'Electronic') return 'Electronics'; 
  return clean;
};

const getCategoryData = (rows) => {
  const counts = {};
  rows.forEach(item => {
    const cleanCat = normalizeCategory(item.category);
    counts[cleanCat] = (counts[cleanCat] || 0) + 1;
  });
  return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
};

// --- STAT CARD ---
function StatCard({ title, value, icon, color }) {
  return (
    <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%', boxShadow: 1, borderRadius: 3 }}>
      <Box>
        <Typography color="textSecondary" variant="subtitle2" sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>{title}</Typography>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', mt: 1 }}>{value}</Typography>
      </Box>
      <Box sx={{ color: color, p: 1.5, borderRadius: '12px', bgcolor: `${color}15` }}>{icon}</Box>
    </Paper>
  );
}

// --- UPDATED: NOW ACCEPTS 'currentUser' ---
export default function InventoryPage({ rows, setRows, currentUser }) {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false); 
  const [currentId, setCurrentId] = useState(null); 
  const [newItem, setNewItem] = useState({ id: '', name: '', category: '', stock: '', price: '' });
  
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800); 
    return () => clearTimeout(timer);
  }, []);

  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('inventoryHistory');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  useEffect(() => {
    localStorage.setItem('inventoryHistory', JSON.stringify(history));
  }, [history]);

  // --- UPDATED LOGGING: SAVES USER NAME ---
  const addToHistory = (action, itemName, details = '') => {
    const newEntry = {
      id: Date.now(),
      action: action,
      item: itemName,
      details: details,
      // Save the name of the person who is currently logged in
      user: currentUser?.name || 'Unknown User', 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString()
    };
    setHistory([newEntry, ...history].slice(0, 15));
  };

  const handleDelete = (id) => {
    const itemToDelete = rows.find(r => r.id === id);
    if (itemToDelete) {
      addToHistory('Deleted', itemToDelete.name);
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const handleEditClick = (row) => {
    setNewItem({
        id: row.id,
        name: row.name,
        category: row.category,
        stock: row.stock,
        price: row.price
    });
    setIsEditing(true);
    setCurrentId(row.id);
    setOpen(true);
  };

  const handleAddClick = () => {
    setNewItem({ id: '', name: '', category: '', stock: '', price: '' });
    setIsEditing(false);
    setOpen(true);
  };

  const handleSave = () => {
    if (isEditing) {
        const oldRow = rows.find(r => r.id === currentId);
        const updatedRows = rows.map(row => {
            if (row.id === currentId) {
                return { 
                    ...row, 
                    id: newItem.id, 
                    name: newItem.name, 
                    category: normalizeCategory(newItem.category), 
                    stock: Number(newItem.stock), 
                    price: Number(newItem.price) 
                };
            }
            return row;
        });
        setRows(updatedRows);
        
        if (oldRow.stock !== Number(newItem.stock)) addToHistory('Stock Adj.', newItem.name, `${oldRow.stock} ➝ ${newItem.stock}`);
        if (oldRow.price !== Number(newItem.price)) addToHistory('Price Adj.', newItem.name, `$${oldRow.price} ➝ $${newItem.price}`);
        if (oldRow.name !== newItem.name) addToHistory('Renamed', newItem.name, `${oldRow.name} ➝ ${newItem.name}`);
        if (oldRow.id !== newItem.id) addToHistory('ID Change', newItem.name, `${oldRow.id} ➝ ${newItem.id}`);
        
        setAlertMessage('Item Updated Successfully!');
    } else {
        const newProduct = {
            id: newItem.id || Math.floor(Math.random() * 10000),
            name: newItem.name,
            category: normalizeCategory(newItem.category),
            stock: Number(newItem.stock),
            price: Number(newItem.price),
        };
        if (rows.some(r => r.id == newProduct.id)) {
            setAlertMessage('Error: ID already exists!');
            setAlertOpen(true);
            return;
        }
        setRows([...rows, newProduct]);
        addToHistory('New Entry', newItem.name, `Stock: ${newProduct.stock}`);
        setAlertMessage('Product Added Successfully!');
    }
    setOpen(false);
    setAlertOpen(true);
  };

  const processRowUpdate = (newRow, oldRow) => {
    const updatedRows = rows.map((row) => (row.id === oldRow.id ? newRow : row));
    setRows(updatedRows);
    
    if (newRow.stock !== oldRow.stock) addToHistory('Stock Adj.', newRow.name, `${oldRow.stock} ➝ ${newRow.stock}`);
    if (newRow.price !== oldRow.price) addToHistory('Price Adj.', newRow.name, `$${oldRow.price} ➝ $${newRow.price}`);
    if (newRow.name !== oldRow.name) addToHistory('Renamed', newRow.name, `${oldRow.name} ➝ ${newRow.name}`);
    
    return newRow;
  };

  const handleProcessRowUpdateError = (error) => {
    setAlertMessage('Error: ' + error.message);
    setAlertOpen(true);
  };

  const columns = [
    { 
        field: 'id', headerName: 'ID', width: 90, editable: true, 
        renderCell: (p) => <b style={{ color: '#555' }}>{p.value}</b> 
    },
    { field: 'name', headerName: 'Product Name', width: 220, editable: true, renderCell: (p) => <b>{p.value}</b> },
    { field: 'category', headerName: 'Category', width: 150, editable: true },
    { 
      field: 'stock', headerName: 'Stock Level', type: 'number', width: 130, editable: true,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value < 40 ? 'error' : 'success'} 
          variant={params.value < 40 ? 'filled' : 'outlined'}
          size="small" 
        />
      )
    },
    { field: 'price', headerName: 'Unit Price', type: 'number', width: 130, editable: true, renderCell: (params) => `$${params.value}` },
    {
      field: 'actions', headerName: 'Actions', width: 120,
      renderCell: (params) => (
        <Box>
            <IconButton color="primary" onClick={() => handleEditClick(params.row)} size="small">
                <EditIcon />
            </IconButton>
            <IconButton color="error" onClick={() => handleDelete(params.row.id)} size="small">
                <DeleteIcon />
            </IconButton>
        </Box>
      )
    }
  ];

  const categoryData = getCategoryData(rows);

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <LinearProgress sx={{ width: '50%', mb: 2 }} />
        <Typography color="text.secondary">Loading Enterprise Dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Fade in={!loading} timeout={800}>
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard title="Total Products" value={rows.length} icon={<InventoryIcon fontSize="large" />} color="#005eb8" />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard title="Critical Stock" value={rows.filter(r => r.stock < 40).length} icon={<WarningIcon fontSize="large" />} color="#d32f2f" />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard title="Active Categories" value={categoryData.length} icon={<LocalOfferIcon fontSize="large" />} color="#ed6c02" />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard title="Asset Value" value={`$${rows.reduce((acc, item) => acc + (item.price * item.stock), 0).toLocaleString()}`} icon={<TrendingUpIcon fontSize="large" />} color="#2e7d32" />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, height: 450, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Real-time Stock Levels</Typography>
            <Box sx={{ height: 350, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rows} margin={{ bottom: 70, left: 0, right: 0, top: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" interval={0} angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                  <YAxis />
                  <RechartsTooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="stock" fill="#005eb8" barSize={30} radius={[4, 4, 0, 0]} name="Units" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: 450, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Category Split</Typography>
            <Box sx={{ height: 350, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={80} outerRadius={100} paddingAngle={5} dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 9 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={600}>Inventory Database</Typography>
                <Box>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick} sx={{ boxShadow: 2 }}>New Entry</Button>
                </Box>
            </Box>
            <Paper sx={{ height: 600, width: '100%', borderRadius: 3, overflow: 'hidden', boxShadow: 2 }}>
                <DataGrid 
                    rows={rows} 
                    columns={columns} 
                    initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }} 
                    pageSizeOptions={[5, 10, 20]} 
                    checkboxSelection 
                    disableRowSelectionOnClick 
                    slots={{ toolbar: GridToolbar }} 
                    slotProps={{ toolbar: { showQuickFilter: true } }}
                    processRowUpdate={processRowUpdate}
                    onProcessRowUpdateError={handleProcessRowUpdateError}
                    getRowClassName={(params) => 
                        params.row.stock < 40 ? 'super-app-theme--LowStock' : ''
                    }
                />
            </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, mt: 1, fontWeight: 600 }}>Audit Log</Typography>
            <Paper sx={{ height: 600, overflow: 'auto', borderRadius: 3, boxShadow: 2 }}>
                <List>
                    {history.length === 0 && <Typography sx={{ p: 3, color: 'gray', fontSize: '0.9rem' }}>No recent activity recorded.</Typography>}
                    {history.map((item) => (
                        <React.Fragment key={item.id}>
                            <ListItem alignItems="flex-start">
                                <ListItemIcon sx={{ minWidth: 35, mt: 0.5 }}>
                                    {item.action.includes('Deleted') ? <DeleteIcon fontSize="small" color="error" /> : 
                                     item.action.includes('New') ? <AddIcon fontSize="small" color="success" /> :
                                     <EditIcon fontSize="small" color="info" />}
                                </ListItemIcon>
                                <ListItemText 
                                    primary={
                                        <Typography variant="body2" fontWeight={600} color="text.primary">
                                            {item.action}
                                        </Typography>
                                    }
                                    secondary={
                                        <Box component="span">
                                            <Typography component="span" variant="caption" display="block" color="text.primary" fontWeight={500}>
                                                {item.item}
                                            </Typography>
                                            
                                            {item.details && (
                                                <Typography component="span" variant="caption" display="flex" alignItems="center" color="primary.main" sx={{ my: 0.5, bgcolor: '#f0f7ff', p: 0.5, borderRadius: 1 }}>
                                                    <ArrowForwardIcon sx={{ fontSize: 12, mr: 0.5 }} /> {item.details}
                                                </Typography>
                                            )}
                                            
                                            {/* --- SHOW USER NAME HERE --- */}
                                            <Typography component="span" variant="caption" display="flex" alignItems="center" color="text.secondary" sx={{ mt: 0.5 }}>
                                                <PersonIcon sx={{ fontSize: 14, mr: 0.5, color: 'gray' }} /> 
                                                {item.user || 'Unknown'}
                                            </Typography>

                                            <Typography component="span" variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                                {item.time} • {item.date}
                                            </Typography>
                                        </Box>
                                    } 
                                />
                            </ListItem>
                            <Divider variant="inset" component="li" />
                        </React.Fragment>
                    ))}
                </List>
            </Paper>
        </Grid>
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        <DialogContent>
          <TextField 
            autoFocus margin="dense" label="ID (SKU)" fullWidth 
            value={newItem.id} 
            onChange={(e) => setNewItem({ ...newItem, id: e.target.value })} 
            helperText="Leave blank to auto-generate"
            disabled={isEditing}
          />
          <TextField margin="dense" label="Product Name" fullWidth value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
          <TextField margin="dense" label="Category" fullWidth value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} />
          <TextField margin="dense" label="Stock Quantity" type="number" fullWidth value={newItem.stock} onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })} />
          <TextField margin="dense" label="Unit Price ($)" type="number" fullWidth value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSave} variant="contained">{isEditing ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={alertOpen} autoHideDuration={3000} onClose={() => setAlertOpen(false)}>
        <Alert severity="success" variant="filled" sx={{ width: '100%' }}>{alertMessage}</Alert>
      </Snackbar>
    </Box>
    </Fade>
  );
}