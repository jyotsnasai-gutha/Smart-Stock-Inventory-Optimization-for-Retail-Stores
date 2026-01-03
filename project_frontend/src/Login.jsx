import React, { useState } from 'react';
import {
    Box, Paper, Typography, TextField, Button, InputAdornment, IconButton, Link, Fade, Alert
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import BadgeIcon from '@mui/icons-material/Badge';
import { useAuth } from './AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize demo user on first load
  React.useEffect(() => {
    const appUsers = JSON.parse(localStorage.getItem('appUsers') || '[]');
    if (appUsers.length === 0) {
      const demoUsers = [
        { fullName: 'Admin Manager', username: 'admin', password: 'admin123', role: 'manager' },
        { fullName: 'Staff User', username: 'staff', password: 'staff123', role: 'staff' },
      ];
      localStorage.setItem('appUsers', JSON.stringify(demoUsers));
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    setIsLoading(true);
    const success = await login(username, password);
    setIsLoading(false);

    if (success) {
      setSuccessMsg('Login successful! Redirecting...');
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } else {
      setError('Invalid username or password. Try username: "admin" or create an account first.');
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password || !fullName) {
        setError('All fields are required');
        return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('appUsers') || '[]');
    if (storedUsers.some(u => u.username === username)) {
        setError('Username already taken');
        return;
    }

    const newUser = { fullName, username, password, role: 'staff' };
    localStorage.setItem('appUsers', JSON.stringify([...storedUsers, newUser]));

    setSuccessMsg('Account created! Please sign in.');
    setIsLoginView(true);
    setPassword('');
    setFullName('');
    setUsername('');
  };

  const toggleView = () => {
      setIsLoginView(!isLoginView);
      setError('');
      setSuccessMsg('');
      setPassword('');
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1976d2 30%, #004ba0 90%)',
        margin: 0,
        padding: 0,
        position: 'absolute',
        top: 0,
        left: 0
      }}
    >
      <Fade in={true} timeout={600}>
        <Paper elevation={10} sx={{ p: 4, width: 400, textAlign: 'center', borderRadius: 3 }}>
            <Box sx={{ mb: 2 }}>
                <img src="https://cdn-icons-png.flaticon.com/512/295/295128.png" alt="Logo" width="60" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
            {isLoginView ? 'Welcome Back' : 'Create Account'}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            {isLoginView ? 'Sign in to Smart Stock Inventory' : 'Join the management team'}
            </Typography>

            {isLoginView && (
              <Typography variant="caption" sx={{ mb: 2, display: 'block', color: '#666', fontStyle: 'italic' }}>
                Demo: admin / admin123 or staff / staff123
              </Typography>
            )}

            {error && <Alert severity="error" sx={{ mb: 2, fontSize: '0.85rem' }}>{error}</Alert>}
            {successMsg && <Alert severity="success" sx={{ mb: 2, fontSize: '0.85rem' }}>{successMsg}</Alert>}

            <form onSubmit={isLoginView ? handleLogin : handleSignup}>
            
            {!isLoginView && (
                <TextField
                    fullWidth
                    label="Full Name"
                    variant="outlined"
                    margin="dense"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><BadgeIcon color="action" /></InputAdornment>,
                    }}
                />
            )}

            <TextField
                fullWidth
                label="Username"
                variant="outlined"
                margin="dense"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isLoginView ? "Type 'admin'" : "Choose a username"}
                InputProps={{
                    startAdornment: <InputAdornment position="start"><AccountCircle color="action" /></InputAdornment>,
                }}
            />

            <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                margin="dense"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                    startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment>,
                    endAdornment: (
                        <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                        </InputAdornment>
                    )
                }}
            />

            <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                startIcon={isLoginView ? <LoginIcon /> : <PersonAddIcon />}
                sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold', fontSize: '1rem' }}
                disabled={isLoading}
            >
                {isLoading ? 'Loading...' : (isLoginView ? 'Sign In' : 'Sign Up')}
            </Button>
            </form>

            <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="textSecondary">
                    {isLoginView ? "Don't have an account? " : "Already have an account? "}
                    <Link component="button" variant="body2" onClick={toggleView} sx={{ fontWeight: 'bold', textDecoration: 'none' }}>
                        {isLoginView ? 'Sign Up' : 'Sign In'}
                    </Link>
                </Typography>
            </Box>

        </Paper>
      </Fade>
    </Box>
  );
}
