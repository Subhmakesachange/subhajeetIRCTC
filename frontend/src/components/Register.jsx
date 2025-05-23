import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { auth } from '../services/api';
import homebg from '../assets/homebg.jpg';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
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
    // Reset error
    setError('');

    // Check for empty fields
    if (!formData.username || !formData.email || !formData.password) {
      setError('All fields are required');
      return false;
    }

    // Username validation
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
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
      const registrationData = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      };

      console.log('Sending registration data:', registrationData);
      const response = await auth.signup(registrationData);
      console.log('Registration response:', response);
      
      // Check for successful response based on status_code
      if (response.data && response.data.status_code === 200) {
        // Show success message and redirect to login
        navigate('/login', { 
          state: { 
            message: 'Registration successful! Please login with your credentials.' 
          }
        });
      } else {
        // Handle validation errors
        const errorMessage = response.data?.error?.username?.[0] || 
                           response.data?.error?.email?.[0] || 
                           response.data?.error?.password?.[0] ||
                           'Registration failed. Please try again.';
        setError(errorMessage);
      }
    } catch (err) {
      console.log('Registration Error:', err);
      
      // Enhanced error handling
      if (err.validationErrors) {
        // Handle specific validation errors
        const errors = [];
        if (err.validationErrors.username) {
          errors.push(`Username: ${err.validationErrors.username.join(', ')}`);
        }
        if (err.validationErrors.email) {
          errors.push(`Email: ${err.validationErrors.email.join(', ')}`);
        }
        if (err.validationErrors.password) {
          errors.push(`Password: ${err.validationErrors.password.join(', ')}`);
        }
        
        if (errors.length > 0) {
          setError(errors.join('\n'));
        } else {
          setError(err.message || 'Registration failed. Please try again.');
        }
      } else {
        // Handle other types of errors
        setError(err.message || 'Registration failed. Please try again.');
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
            Create Your IRCTC Account
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ position: 'relative', zIndex: 1 }}>
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
              id="email"
              label="Email Address"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              error={!!error && error.includes('email')}
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
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
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
              inputProps={{
                minLength: 6,
                maxLength: 50
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
                color: '#fff',
                textTransform: 'uppercase',
                '&:hover': {
                  backgroundColor: '#1a2f5f'
                }
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'REGISTER'}
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/login')}
              disabled={loading}
              sx={{ 
                color: '#ff9933',
                textTransform: 'uppercase'
              }}
            >
              Already have an account? Login
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;