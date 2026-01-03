import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize user from token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      let decoded = null;
      try {
        decoded = jwtDecode(storedToken);
      } catch (jwtError) {
        try {
          // Try to decode as base64 JSON (for mock tokens)
          decoded = JSON.parse(atob(storedToken));
        } catch (base64Error) {
          console.error('Invalid token:', jwtError, base64Error);
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
          setLoading(false);
          return;
        }
      }
      setUser({
        id: decoded.id || decoded.sub,
        name: decoded.name || decoded.username || 'User',
        role: decoded.role || 'staff',
        email: decoded.email,
      });
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      let accessToken = null;
      let userData = null;

      // First, try to call the backend API
      try {
        const response = await fetch('/api/auth/login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
          const data = await response.json();
          accessToken = data.access_token || data.token;

          if (accessToken) {
            try {
              const decoded = jwtDecode(accessToken);
              userData = {
                id: decoded.id || decoded.sub,
                name: decoded.name || decoded.username || 'User',
                role: decoded.role || 'staff',
                email: decoded.email,
              };
            } catch (decodeError) {
              console.error('Token decode error:', decodeError);
              accessToken = null;
            }
          }
        }
      } catch (apiError) {
        console.log('API unavailable, using local authentication...');
      }

      // Fallback: Check local storage for registered users
      if (!accessToken) {
        const appUsers = JSON.parse(localStorage.getItem('appUsers') || '[]');
        const user = appUsers.find(u => u.username === username && u.password === password);

        if (!user) {
          throw new Error('Invalid credentials');
        }

        // Create a mock JWT token for local auth
        const mockPayload = {
          id: username,
          name: user.fullName || username,
          username: username,
          role: user.role || 'staff',
          email: `${username}@inventory.local`,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 86400,
        };
        accessToken = btoa(JSON.stringify(mockPayload));
        userData = {
          id: username,
          name: user.fullName || username,
          role: user.role || 'staff',
          email: `${username}@inventory.local`,
        };
      }

      // Now save token and user to state
      if (accessToken && userData) {
        localStorage.setItem('token', accessToken);
        setToken(accessToken);
        setUser(userData);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role || (Array.isArray(user.role) && user.role.includes(role));
  };

  // Check if user is manager
  const isManager = () => {
    return hasRole('manager');
  };

  // Check if user is staff
  const isStaff = () => {
    return hasRole('staff');
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    hasRole,
    isManager,
    isStaff,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
