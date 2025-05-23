import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import homebg from '../assets/homebg.jpg';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value.trim()
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.username || !formData.password) {
      setError('Username and password are required');
      return false;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Submitting login with:', formData);

      const response = await login(formData);
      
      console.log('Login successful:', response);

      // Navigate based on user type and return path
      if (response.success) {
        if (response.isAdmin) {
          navigate('/admin/dashboard', { replace: true });
        } else {
          // Check for return path
          const returnPath = location.state?.from || '/';
          navigate(returnPath, { replace: true });
        }
      }
    } catch (err) {
      console.error('Login Error in component:', err);
      if (err.message?.toLowerCase().includes('incorrect username/password') || 
          err.message?.toLowerCase().includes('invalid username')) {
        setError('Account not found. Please check your username or register if you don\'t have an account.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ 
        p: 4, 
        mt: 8,
        backgroundColor: '#fff',
        color: '#000',
        backgroundImage: `url(${homebg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.7)', // Reduced transparency
          zIndex: 0
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            component="h1" 
            variant="h5" 
            align="center" 
            gutterBottom
            sx={{ color: '#000' }}
          >
            Login to IRCTC
          </Typography>

          {location.state?.message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {location.state.message}
            </Alert>
          )}
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              action={
                error.includes('register') && (
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => navigate('/register')}
                  >
                    Register Now
                  </Button>
                )
              }
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              error={!!error && error.includes('username')}
              sx={{
                backgroundColor: '#fff',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#ccc',
                  },
                  '&:hover fieldset': {
                    borderColor: '#213d77',
                  },
                },
              }}
              inputProps={{
                minLength: 3,
                maxLength: 50
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              error={!!error && error.includes('password')}
              sx={{
                backgroundColor: '#fff',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#ccc',
                  },
                  '&:hover fieldset': {
                    borderColor: '#213d77',
                  },
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2,
                backgroundColor: '#213d77',
                '&:hover': {
                  backgroundColor: '#1a2f5f'
                }
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/register')}
              disabled={loading}
              sx={{ 
                color: '#ff9933',
                textTransform: 'uppercase'
              }}
            >
              Don't have an account? Register
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login; 