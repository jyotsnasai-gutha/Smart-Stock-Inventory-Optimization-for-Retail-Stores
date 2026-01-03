import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, TextField, Stack
} from '@mui/material';
import { useAuth } from '../AuthContext';

const LowStockAlerts = () => {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [threshold, setThreshold] = useState(10);
  const [tempThreshold, setTempThreshold] = useState(10);

  useEffect(() => {
    fetchAlerts();
  }, [threshold]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/alerts/low-stock/?threshold=${threshold}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch alerts');
      const data = await response.json();
      setAlerts(data.alerts || data);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError(err.message);
      // Fallback mock data
      setAlerts([
        { id: 1, product_name: 'Sony Headphones', current_stock: 5, threshold: 10, store_name: 'Downtown', severity: 'critical' },
        { id: 2, product_name: 'Dell XPS', current_stock: 8, threshold: 10, store_name: 'Uptown', severity: 'warning' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleThresholdChange = () => {
    setThreshold(parseInt(tempThreshold) || 10);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Low Stock Alerts</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <TextField
              label="Stock Threshold"
              type="number"
              value={tempThreshold}
              onChange={(e) => setTempThreshold(e.target.value)}
              size="small"
              sx={{ width: 150 }}
            />
            <Box onClick={handleThresholdChange} sx={{ cursor: 'pointer', color: 'primary.main', fontWeight: 'bold' }}>
              Apply
            </Box>
          </Stack>

          {alerts.length === 0 ? (
            <Typography color="success.main">✓ All products are above the threshold!</Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><strong>Product</strong></TableCell>
                    <TableCell><strong>Store</strong></TableCell>
                    <TableCell align="right"><strong>Current Stock</strong></TableCell>
                    <TableCell align="right"><strong>Threshold</strong></TableCell>
                    <TableCell><strong>Severity</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {alerts.map(alert => (
                    <TableRow key={alert.id} sx={{
                      backgroundColor: alert.severity === 'critical' ? '#ffebee' : '#fff3e0'
                    }}>
                      <TableCell>{alert.product_name}</TableCell>
                      <TableCell>{alert.store_name}</TableCell>
                      <TableCell align="right">{alert.current_stock}</TableCell>
                      <TableCell align="right">{alert.threshold}</TableCell>
                      <TableCell sx={{
                        color: alert.severity === 'critical' ? '#d32f2f' : '#f57c00',
                        fontWeight: 'bold',
                        textTransform: 'capitalize'
                      }}>
                        {alert.severity}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default LowStockAlerts;
