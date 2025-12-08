import React, { useState, useEffect } from 'react';
import { 
  Box, AppBar, Toolbar, Typography, CssBaseline, Drawer, 
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, Switch, 
  FormControlLabel, ThemeProvider, createTheme, IconButton, Avatar
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LogoutIcon from '@mui/icons-material/Logout';
import InventoryPage from './InventoryPage';
import OrdersPage from './Orders';
import LoginPage from './Login';

const drawerWidth = 260; 

const initialRows = [
  { id: 1, name: 'iPhone 15', category: 'Electronics', stock: 50, price: 999 },
  { id: 2, name: 'Galaxy S24', category: 'Electronics', stock: 30, price: 899 },
  { id: 3, name: 'Nike Air Max', category: 'Shoes', stock: 100, price: 150 },
  { id: 4, name: 'Sony Headphones', category: 'Audio', stock: 15, price: 299 },
  { id: 5, name: 'Dell XPS 15', category: 'Computers', stock: 45, price: 1800 },
];

// Helper to get initials (e.g., "John Doe" -> "JD")
const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};

function App() {
  // --- STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // NEW: State to store the current user's info
  const [currentUser, setCurrentUser] = useState({ name: 'Guest', role: 'Viewer' });
  
  const [darkMode, setDarkMode] = useState(false);
  const [view, setView] = useState('inventory'); 

  const [rows, setRows] = useState(() => {
    const savedData = localStorage.getItem('inventoryData');
    return savedData ? JSON.parse(savedData) : initialRows;
  });

  useEffect(() => {
    localStorage.setItem('inventoryData', JSON.stringify(rows));
  }, [rows]);

  // --- THEME ---
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

  // --- HANDLE LOGIN ---
  const handleLoginSuccess = (user) => {
      setCurrentUser(user); // Save user details
      setIsLoggedIn(true);  // Allow access
  };

  if (!isLoggedIn) {
      return (
          <ThemeProvider theme={theme}>
              <CssBaseline />
              {/* Pass the handleLoginSuccess function to the Login Page */}
              <LoginPage onLogin={handleLoginSuccess} />
          </ThemeProvider>
      );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, boxShadow: 1 }}>
          <Toolbar>
            <img src="https://cdn-icons-png.flaticon.com/512/9073/9073032.png" alt="logo" width="30" style={{marginRight: 15}}/>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Smart Stock Inventory
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControlLabel control={<Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />} label="Dark Mode" />
                <IconButton color="inherit" onClick={() => setIsLoggedIn(false)}>
                    <LogoutIcon />
                </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', borderRight: 'none', bgcolor: darkMode ? '#1e1e1e' : '#fff' },
          }}
        >
          <Toolbar /> 
          <Box sx={{ overflow: 'auto', mt: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                {/* DYNAMIC AVATAR AND NAME */}
                <Avatar sx={{ width: 60, height: 60, margin: '0 auto', bgcolor: 'primary.main', mb: 1, fontSize: '1.5rem' }}>
                    {getInitials(currentUser.name)}
                </Avatar>
                <Typography variant="subtitle1" fontWeight="bold">
                    {currentUser.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                    {currentUser.role}
                </Typography>
            </Box>
            <List>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton onClick={() => setView('inventory')} selected={view === 'inventory'} sx={{ borderRadius: '0 20px 20px 0' }}>
                  <ListItemIcon><DashboardIcon color={view === 'inventory' ? 'primary' : 'inherit'} /></ListItemIcon>
                  <ListItemText primary="Dashboard Overview" />
                </ListItemButton>
              </ListItem>
              
              <ListItem disablePadding>
                <ListItemButton onClick={() => setView('orders')} selected={view === 'orders'} sx={{ borderRadius: '0 20px 20px 0' }}>
                  <ListItemIcon><ShoppingCartIcon color={view === 'orders' ? 'primary' : 'inherit'} /></ListItemIcon>
                  <ListItemText primary="Smart Reorder System" />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 4, minHeight: '100vh' }}>
          <Toolbar /> 
          {view === 'inventory' ? (
            // UPDATE THIS LINE: Pass 'currentUser' to the page
            <InventoryPage rows={rows} setRows={setRows} currentUser={currentUser} />
          ) : (
            <OrdersPage rows={rows} setRows={setRows} />
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;