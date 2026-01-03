import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, CircularProgress, Alert, Button, Dialog, TextField, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InventoryIcon from '@mui/icons-material/Inventory';
import StoreIcon from '@mui/icons-material/Store';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useAuth } from '../AuthContext';

const Dashboard = () => {
  const { user, isManager, token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retrainDialogOpen, setRetrainDialogOpen] = useState(false);
  const [retraining, setRetraining] = useState(false);
  const [retrainMessage, setRetrainMessage] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const headers = {
        'Authorization': `Bearer ${token}`,
      };
      const response = await fetch('/api/dashboard/summary/', { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setSummary(data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err.message || 'Failed to load dashboard');
      setSummary({
        total_products: 150,
        total_stores: 12,
        low_stock_count: 8,
        total_sales: 45000,
        inventory_turnover: 3.2,
        data: [
          { date: 'Mon', sales: 4000, revenue: 2400 },
          { date: 'Tue', sales: 3000, revenue: 1398 },
          { date: 'Wed', sales: 2000, revenue: 9800 },
          { date: 'Thu', sales: 2780, revenue: 3908 },
          { date: 'Fri', sales: 1890, revenue: 4800 },
          { date: 'Sat', sales: 2390, revenue: 3800 },
          { date: 'Sun', sales: 3490, revenue: 4300 },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetrain = async () => {
    try {
      setRetraining(true);
      setRetrainMessage('');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      const response = await fetch('/api/ml/retrain/', { method: 'POST', headers });

      if (!response.ok) {
        throw new Error('Model retrain failed');
      }

      setRetrainMessage('Model retrained successfully!');
      setTimeout(() => setRetrainDialogOpen(false), 2000);
    } catch (err) {
      setRetrainMessage(`Error: ${err.message}`);
    } finally {
      setRetraining(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Dashboard {isManager ? '(Manager View)' : '(Staff View)'}
      </Typography>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>Total Products</Typography>
                  <Typography variant="h5">{summary?.total_products || 0}</Typography>
                </Box>
                <InventoryIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {isManager && (
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>Total Stores</Typography>
                    <Typography variant="h5">{summary?.total_stores || 0}</Typography>
                  </Box>
                  <StoreIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {isManager && (
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>Low Stock Items</Typography>
                    <Typography variant="h5" sx={{ color: summary?.low_stock_count > 0 ? 'error.main' : 'success.main' }}>
                      {summary?.low_stock_count || 0}
                    </Typography>
                  </Box>
                  <TrendingDownIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>Total Sales</Typography>
                  <Typography variant="h5">${(summary?.total_sales || 0).toLocaleString()}</Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'info.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {summary?.data && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Sales & Revenue Trends</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={summary.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" />
                <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {isManager && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6">Machine Learning Model</Typography>
                <Typography variant="body2" color="textSecondary">
                  Retrain prediction model with latest data
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AutoFixHighIcon />}
                onClick={() => setRetrainDialogOpen(true)}
              >
                Retrain Model
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      <Dialog open={retrainDialogOpen} onClose={() => setRetrainDialogOpen(false)}>
        <DialogTitle>Retrain ML Model</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            This will retrain the reorder prediction model using the latest sales and inventory data.
          </Typography>
          {retrainMessage && (
            <Alert severity={retrainMessage.includes('Error') ? 'error' : 'success'}>
              {retrainMessage}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRetrainDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleRetrain}
            variant="contained"
            disabled={retraining}
          >
            {retraining ? 'Training...' : 'Confirm Retrain'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
