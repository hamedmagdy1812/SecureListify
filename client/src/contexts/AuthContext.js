import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/api';
import toast from 'react-hot-toast';

// Create context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const isMockEnabled = process.env.REACT_APP_USE_MOCK === 'true';
  
  // Log important information on mount
  useEffect(() => {
    console.log('AuthProvider mounted');
    console.log('Mock mode enabled:', isMockEnabled);
    console.log('Initial token:', token ? 'exists' : 'none');
  }, []);
  
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth, mock mode:', isMockEnabled);
        
        // Check if token exists
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
          console.log('No token found in localStorage');
          setIsLoading(false);
          return;
        }
        
        console.log('Token found in localStorage');
        
        // Check if token is expired (except for mock token)
        if (!isMockEnabled && isTokenExpired(storedToken)) {
          console.log('Token is expired, logging out');
          await logout();
          setIsLoading(false);
          return;
        }
        
        // Set token in axios headers
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        console.log('Set Authorization header with token');
        
        // Get current user
        try {
          const response = await api.get('/api/auth/me');
          console.log('User data response:', response.data);
          
          const userData = response.data.data || response.data.user;
          console.log('Setting user data:', userData);
          
          setUser(userData);
          setToken(storedToken);
          setIsAuthenticated(true);
          toast.success('Welcome back!');
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
      console.log('Token saved to localStorage');
      
      // Set token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Authorization header set');
      
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
      
      // Clear any existing token
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      console.log('Cleared existing auth data');
      
      // Make the registration request
      console.log('Sending registration request with data:', { name, email, password: '***' });
      const response = await api.post('/api/auth/register', { name, email, password });
      console.log('Registration response:', response);
      console.log('Registration response data:', response.data);
      
      // Check if the response has the expected format
      if (!response.data || !response.data.token || !response.data.user) {
        console.error('Invalid registration response format:', response.data);
        return {
          success: false,
          message: 'Invalid response from server'
        };
      }
      
      const { token, user } = response.data;
      console.log('Extracted token and user from response');
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      console.log('Token saved to localStorage');
      
      // Set token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Authorization header set');
      
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
      console.log('Logging out user');
      if (isAuthenticated) {
        // Only call logout API if not using mock data
        if (!isMockEnabled) {
          console.log('Calling logout API');
          await api.post('/api/auth/logout');
        }
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Remove token from localStorage
      localStorage.removeItem('token');
      console.log('Token removed from localStorage');
      
      // Remove token from axios headers
      delete api.defaults.headers.common['Authorization'];
      console.log('Authorization header removed');
      
      // Update state
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      console.log('Auth state reset');
    }
  };
  
  // Check if token is expired
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const isExpired = decoded.exp < Date.now() / 1000;
      console.log('Token expiration check:', isExpired ? 'expired' : 'valid');
      return isExpired;
    } catch (error) {
      console.error('Error decoding token:', error);
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