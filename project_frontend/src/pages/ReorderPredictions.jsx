import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, Button
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAuth } from '../AuthContext';

const ReorderPredictions = () => {
  const { token } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch predictions
      const predResponse = await fetch('/api/analytics/reorder-predictions/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!predResponse.ok) throw new Error('Failed to fetch predictions');
      const predData = await predResponse.json();
      setPredictions(predData.predictions || predData);

      // Fetch trend data
      try {
        const trendResponse = await fetch('/api/analytics/reorder-trend/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (trendResponse.ok) {
          const trend = await trendResponse.json();
          setTrendData(trend.trend || trend);
        }
      } catch (err) {
        console.error('Error fetching trend data:', err);
      }
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setError(err.message);
      // Fallback mock data
      setPredictions([
        { id: 1, sku: 'SKU001', product_name: 'iPhone 15', predicted_reorder_date: '2025-01-05', confidence: 0.95, current_stock: 50, daily_sales: 5 },
        { id: 2, sku: 'SKU002', product_name: 'Galaxy S24', predicted_reorder_date: '2025-01-08', confidence: 0.87, current_stock: 30, daily_sales: 3 },
        { id: 3, sku: 'SKU003', product_name: 'Nike Air Max', predicted_reorder_date: '2024-12-31', confidence: 0.92, current_stock: 100, daily_sales: 15 },
      ]);
      setTrendData([
        { date: 'Week 1', reorders: 5, accuracy: 0.88 },
        { date: 'Week 2', reorders: 7, accuracy: 0.91 },
        { date: 'Week 3', reorders: 6, accuracy: 0.89 },
        { date: 'Week 4', reorders: 8, accuracy: 0.93 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Reorder Predictions</Typography>
        <Button startIcon={<RefreshIcon />} onClick={fetchPredictions}>Refresh</Button>
      </Box>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Predictions Table */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon /> Predicted Reorder Dates
          </Typography>

          {predictions.length === 0 ? (
            <Typography color="textSecondary">No predictions available</Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><strong>Product</strong></TableCell>
                    <TableCell><strong>SKU</strong></TableCell>
                    <TableCell><strong>Predicted Reorder</strong></TableCell>
                    <TableCell align="right"><strong>Confidence</strong></TableCell>
                    <TableCell align="right"><strong>Current Stock</strong></TableCell>
                    <TableCell align="right"><strong>Daily Sales</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {predictions.map(pred => (
                    <TableRow key={pred.id}>
                      <TableCell>{pred.product_name}</TableCell>
                      <TableCell><strong>{pred.sku}</strong></TableCell>
                      <TableCell>{pred.predicted_reorder_date}</TableCell>
                      <TableCell align="right">
                        <Box sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: pred.confidence > 0.9 ? '#c8e6c9' : pred.confidence > 0.8 ? '#fff9c4' : '#ffccbc',
                          color: pred.confidence > 0.9 ? '#2e7d32' : pred.confidence > 0.8 ? '#f57f17' : '#d84315'
                        }}>
                          {(pred.confidence * 100).toFixed(0)}%
                        </Box>
                      </TableCell>
                      <TableCell align="right">{pred.current_stock} units</TableCell>
                      <TableCell align="right">{pred.daily_sales} units/day</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Trend Chart */}
      {trendData.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Reorder Accuracy Trend</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="accuracy" stroke="#8884d8" name="Accuracy" />
                <Line type="monotone" dataKey="reorders" stroke="#82ca9d" name="Reorders" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ReorderPredictions;
