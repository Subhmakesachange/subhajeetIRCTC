import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogContent,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Train as TrainIcon,
  List as ListIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import AdminManagement from './AdminManagement';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isAdminManagementOpen, setIsAdminManagementOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Double-check admin status
    const adminApiKey = localStorage.getItem('admin_api_key');
    if (!user?.is_admin || !adminApiKey) {
      console.log('Unauthorized access attempt to admin dashboard');
      navigate('/unauthorized');
      return;
    }

    // Check for success message in navigation state
    if (location.state?.message) {
      setAlertMessage(location.state.message);
      setAlertType(location.state.type || 'success');
      setShowAlert(true);
      // Clear the state after showing the message
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [user, navigate, location]);

  const handleAddTrain = () => {
    navigate('/admin/add-train');
  };

  const handleViewAllTrains = () => {
    navigate('/admin/view-trains');
  };

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  if (!user?.is_admin) {
    return null; // Prevent flash of content while redirecting
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="h1" sx={{ mb: 4 }}>
        Admin Dashboard
      </Typography>

      <Snackbar 
        open={showAlert} 
        autoHideDuration={6000} 
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleAlertClose} severity={alertType} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>

      <Alert severity="info" sx={{ mb: 4 }}>
        Welcome, Admin! You have full access to manage trains, stations, and user permissions.
      </Alert>

      <Grid container spacing={4}>
        {/* Add Train Card */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#f5f5f5'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AddIcon sx={{ fontSize: 40, color: '#213d77', mr: 2 }} />
                <Typography variant="h6" component="h2">
                  Add New Train
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Create new train routes, set schedules, and manage seating capacity.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddTrain}
                variant="contained"
                sx={{
                  backgroundColor: '#213d77',
                  '&:hover': {
                    backgroundColor: '#152a54'
                  }
                }}
              >
                Add Train
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* View Trains Card */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#f5f5f5'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrainIcon sx={{ fontSize: 40, color: '#213d77', mr: 2 }} />
                <Typography variant="h6" component="h2">
                  View All Trains
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                View and manage all train routes, schedules, and availability.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                startIcon={<ListIcon />}
                onClick={handleViewAllTrains}
                variant="contained"
                sx={{
                  backgroundColor: '#213d77',
                  '&:hover': {
                    backgroundColor: '#152a54'
                  }
                }}
              >
                View Trains
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* User Management Card */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#f5f5f5'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ fontSize: 40, color: '#213d77', mr: 2 }} />
                <Typography variant="h6" component="h2">
                  User Management
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Manage user roles and permissions. Grant or revoke admin privileges.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                startIcon={<PeopleIcon />}
                onClick={() => setIsAdminManagementOpen(true)}
                variant="contained"
                sx={{
                  backgroundColor: '#213d77',
                  '&:hover': {
                    backgroundColor: '#152a54'
                  }
                }}
              >
                Manage Users
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Admin Management Dialog */}
      <Dialog 
        open={isAdminManagementOpen} 
        onClose={() => setIsAdminManagementOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <AdminManagement />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 