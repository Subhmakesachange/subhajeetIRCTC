import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { auth } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check token expiration
  const checkTokenExpiration = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch (error) {
      return false;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      // Check if token is still valid
      if (checkTokenExpiration(token)) {
        setUser(JSON.parse(storedUser));
      } else {
        // Token expired, clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('admin_api_key');
        setUser(null);
        navigate('/login', { replace: true });
      }
    }
  }, [navigate]);

  const login = async (credentials) => {
    try {
      const response = await auth.login(credentials);
      
      if (response.status_code === 200) {
        // Verify token before storing
        const token = response.access_token;
        if (checkTokenExpiration(token)) {
          // If this is an admin login attempt, verify admin status
          if (credentials.is_admin && !response.is_admin) {
            throw new Error('This account does not have admin privileges');
          }

          localStorage.setItem('token', token);
          const userData = {
            id: response.user_id,
            is_admin: response.is_admin || false,
            username: credentials.username
          };
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Store admin API key if provided and user is admin
          if (response.admin_api_key && response.is_admin) {
            localStorage.setItem('admin_api_key', response.admin_api_key);
          }
          
          setUser(userData);
          return { success: true, isAdmin: userData.is_admin };
        } else {
          throw new Error('Invalid or expired token received');
        }
      }
      throw new Error('Login failed. Please check your credentials.');
    } catch (error) {
      console.error('Login Error in context:', error);
      // Clear any stored auth data on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('admin_api_key');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('admin_api_key');
    setUser(null);
    navigate('/', { replace: true });
  };

  const value = {
    user,
    login,
    logout,
    isAdmin: user?.is_admin || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 