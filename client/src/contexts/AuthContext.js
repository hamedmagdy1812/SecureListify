import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/api';

// Create context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const isMockEnabled = process.env.REACT_APP_USE_MOCK === 'true';
  
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth, mock mode:', isMockEnabled);
        
        // Check if token exists
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
          setIsLoading(false);
          return;
        }
        
        // Check if token is expired (except for mock token)
        if (!isMockEnabled && isTokenExpired(storedToken)) {
          console.log('Token is expired, logging out');
          await logout();
          setIsLoading(false);
          return;
        }
        
        // Set token in axios headers
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        // Get current user
        try {
          const response = await api.get('/api/auth/me');
          setUser(response.data.data || response.data.user);
          setToken(storedToken);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to get user data:', error);
          // Only clear auth if not in mock mode or if error is not 401
          if (!isMockEnabled || (error.response && error.response.status !== 401)) {
            await logout();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);
  
  // Login function
  const login = async (email, password) => {
    try {
      console.log('Logging in user:', email);
      const response = await api.post('/api/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      const { token, user } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Set token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update state
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        message: error.response?.data?.error?.message || 'Invalid credentials'
      };
    }
  };
  
  // Register function
  const register = async (name, email, password) => {
    try {
      console.log('Registering user:', { name, email });
      const response = await api.post('/api/auth/register', { name, email, password });
      console.log('Registration response:', response.data);
      
      const { token, user } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Set token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update state
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      
      // For debugging
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      } else if (error.request) {
        console.error('Error request:', error.request);
      }
      
      return {
        success: false,
        message: error.response?.data?.error?.message || 'Registration failed'
      };
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      if (isAuthenticated) {
        // Only call logout API if not using mock data
        if (!isMockEnabled) {
          await api.post('/api/auth/logout');
        }
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Remove token from localStorage
      localStorage.removeItem('token');
      
      // Remove token from axios headers
      delete api.defaults.headers.common['Authorization'];
      
      // Update state
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };
  
  // Check if token is expired
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch (error) {
      return true;
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 