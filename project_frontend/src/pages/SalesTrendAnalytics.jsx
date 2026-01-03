import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, CircularProgress, Alert, Stack, Button
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAuth } from '../AuthContext';

const SalesTrendAnalytics = () => {
  const { token } = useAuth();
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSku, setSelectedSku] = useState('SKU001');
  const [skuList, setSkuList] = useState([]);

  useEffect(() => {
    fetchSkuList();
  }, []);

  useEffect(() => {
    if (selectedSku) {
      fetchTrendData();
    }
  }, [selectedSku]);

  const fetchSkuList = async () => {
    try {
      const response = await fetch('/api/products/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const skus = (data.products || data).map(p => p.sku);
        setSkuList(skus);
        if (skus.length > 0) {
          setSelectedSku(skus[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching SKU list:', err);
    }
  };

  const fetchTrendData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/analytics/sales-trend/${selectedSku}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch trend data');
      const data = await response.json();
      setTrendData(data.trend || data);
    } catch (err) {
      console.error('Error fetching trend data:', err);
      setError(err.message);
      // Fallback mock data
      setTrendData([
        { date: 'Week 1', sales: 150, revenue: 15000, units: 15 },
        { date: 'Week 2', sales: 200, revenue: 20000, units: 20 },
        { date: 'Week 3', sales: 175, revenue: 17500, units: 17 },
        { date: 'Week 4', sales: 220, revenue: 22000, units: 22 },
        { date: 'Week 5', sales: 260, revenue: 26000, units: 26 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Sales Trend Analytics</Typography>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error} (showing demo data)</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
            <TextField
              select
              label="Select SKU"
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              SelectProps={{ native: true }}
              sx={{ minWidth: 200 }}
            >
              {skuList.map(sku => (
                <option key={sku} value={sku}>{sku}</option>
              ))}
            </TextField>
            <Button variant="outlined" onClick={fetchTrendData}>Refresh</Button>
          </Stack>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
          ) : trendData.length > 0 ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Sales Trend - {selectedSku}</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#8884d8" name="Units Sold" />
                  <Line type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue" />
                </LineChart>
              </ResponsiveContainer>

              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Units Sold by Week</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="units" fill="#8884d8" name="Units" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Typography color="textSecondary">No data available</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SalesTrendAnalytics;
