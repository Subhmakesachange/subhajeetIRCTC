import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 3
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main' }} />
        
        <Typography variant="h4" component="h1" gutterBottom>
          Access Denied
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          You do not have permission to access this page. This area is restricted to administrators only.
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{
              mr: 2,
              backgroundColor: '#213d77',
              '&:hover': {
                backgroundColor: '#152a54'
              }
            }}
          >
            Go to Home
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/admin/login')}
            sx={{
              color: '#213d77',
              borderColor: '#213d77',
              '&:hover': {
                borderColor: '#152a54',
                backgroundColor: 'rgba(33, 61, 119, 0.1)'
              }
            }}
          >
            Admin Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Unauthorized; 