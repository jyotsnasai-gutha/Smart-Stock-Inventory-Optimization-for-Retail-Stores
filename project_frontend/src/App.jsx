import React, { useState } from 'react';
import {
  Box, AppBar, Toolbar, Typography, CssBaseline, Drawer,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, Switch,
  FormControlLabel, ThemeProvider, createTheme, IconButton, Avatar, Menu, MenuItem
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import InventoryIcon from '@mui/icons-material/Inventory';
import StoreIcon from '@mui/icons-material/Store';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import WarningIcon from '@mui/icons-material/Warning';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Stores from './pages/Stores';
import Stock from './pages/Stock';
import LowStockAlerts from './pages/LowStockAlerts';
import Transactions from './pages/Transactions';
import SalesTrendAnalytics from './pages/SalesTrendAnalytics';
import ReorderPredictions from './pages/ReorderPredictions';
import LoginPage from './Login';
import { useAuth } from './AuthContext';

const drawerWidth = 260;

// Helper to get initials
const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};

function App() {
  const { user, logout, isManager, loading } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [view, setView] = useState('dashboard');
  const [anchorEl, setAnchorEl] = useState(null);

  // Handle loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <ThemeProvider theme={createTheme({ palette: { mode: 'light' } })}>
        <CssBaseline />
        <LoginPage />
      </ThemeProvider>
    );
  }

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#005eb8' },
      background: { default: darkMode ? '#121212' : '#f4f6f8' }
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    components: {
      MuiButton: { styleOverrides: { root: { borderRadius: 8, textTransform: 'none', fontWeight: 600 } } },
      MuiPaper: { styleOverrides: { root: { borderRadius: 12 } } }
    }
  });

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  // Menu items based on role
  const menuItems = [
    { label: 'Dashboard', view: 'dashboard', icon: <DashboardIcon /> },
    { label: 'Products', view: 'products', icon: <ShoppingCartIcon />, requireManager: false },
    { label: 'Stores', view: 'stores', icon: <StoreIcon />, requireManager: true },
    { label: 'Stock', view: 'stock', icon: <InventoryIcon />, requireManager: false },
    { label: 'Low Stock Alerts', view: 'alerts', icon: <WarningIcon />, requireManager: true },
    { label: 'Transactions', view: 'transactions', icon: <SwapHorizIcon />, requireManager: false },
    { label: 'Sales Analytics', view: 'analytics', icon: <AnalyticsIcon />, requireManager: false },
    { label: 'Reorder Predictions', view: 'predictions', icon: <AutoFixHighIcon />, requireManager: false },
  ];

  const visibleMenuItems = menuItems.filter(item => {
    if (item.requireManager === true && !isManager) {
      return false;
    }
    return true;
  });

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products />;
      case 'stores':
        if (!isManager) {
          return <Box sx={{ p: 2 }}><Typography color="error">Access Denied: Manager role required</Typography></Box>;
        }
        return <Stores />;
      case 'stock':
        return <Stock />;
      case 'alerts':
        if (!isManager) {
          return <Box sx={{ p: 2 }}><Typography color="error">Access Denied: Manager role required</Typography></Box>;
        }
        return <LowStockAlerts />;
      case 'transactions':
        return <Transactions />;
      case 'analytics':
        return <SalesTrendAnalytics />;
      case 'predictions':
        return <ReorderPredictions />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />

        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, boxShadow: 1 }}>
          <Toolbar>
            <img src="https://cdn-icons-png.flaticon.com/512/9073/9073032.png" alt="logo" width="30" style={{ marginRight: 15 }} />
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Smart Stock Inventory
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControlLabel control={<Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />} label="Dark" />
              <IconButton color="inherit" onClick={handleMenuOpen}>
                <MoreVertIcon />
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem disabled>
                  <Typography variant="caption">{user.role.toUpperCase()}</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: 'none',
              bgcolor: darkMode ? '#1e1e1e' : '#fff'
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', mt: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar sx={{ width: 60, height: 60, margin: '0 auto', bgcolor: 'primary.main', mb: 1, fontSize: '1.5rem' }}>
                {getInitials(user.name)}
              </Avatar>
              <Typography variant="subtitle1" fontWeight="bold">
                {user.name}
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'capitalize' }}>
                {user.role}
              </Typography>
            </Box>
            <List>
              {visibleMenuItems.map((item) => (
                <ListItem key={item.view} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={() => setView(item.view)}
                    selected={view === item.view}
                    sx={{ borderRadius: '0 20px 20px 0' }}
                  >
                    <ListItemIcon>
                      {React.cloneElement(item.icon, { color: view === item.view ? 'primary' : 'inherit' })}
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 4, minHeight: '100vh', bgcolor: darkMode ? '#121212' : '#f4f6f8' }}>
          <Toolbar />
          {renderContent()}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;