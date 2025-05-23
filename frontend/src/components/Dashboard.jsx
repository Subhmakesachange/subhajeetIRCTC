import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid,
  Alert,
  Snackbar
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { trains } from '../services/api';
import { useLocation, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchUserBookings();
    
    // Check for booking success message from state
    if (location.state?.bookingSuccess) {
      setShowSuccess(true);
      setSuccessMessage(location.state.message);
      // Clear the state after showing the message
      window.history.replaceState({}, document.title);
    }
  }, []);

  const fetchUserBookings = async () => {
    try {
      const response = await trains.getUserBookings();
      setBookings(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch your bookings');
      setLoading(false);
    }
  };

  const handleCloseSuccess = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowSuccess(false);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {user?.username}!
        </Typography>

        {/* Success Snackbar */}
        <Snackbar
          open={showSuccess}
          autoHideDuration={6000}
          onClose={handleCloseSuccess}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSuccess}
            severity="success"
            sx={{ width: '100%' }}
            elevation={6}
            variant="filled"
          >
            {successMessage}
          </Alert>
        </Snackbar>

        {/* Success Alert (persistent) */}
        {showSuccess && (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            onClose={() => setShowSuccess(false)}
          >
            {successMessage}
          </Alert>
        )}

        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
          Your Recent Bookings
        </Typography>

        {loading && (
          <Typography>Loading your bookings...</Typography>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {bookings.map((booking) => (
            <Grid item xs={12} md={6} key={booking.booking_id}>
              <Paper 
                sx={{ 
                  p: 3,
                  backgroundColor: booking.booking_id === location.state?.bookingDetails?.bookingId 
                    ? '#e3f2fd' 
                    : 'white'
                }}
                elevation={booking.booking_id === location.state?.bookingDetails?.bookingId ? 3 : 1}
              >
                <Typography variant="h6" gutterBottom>
                  {booking.train.name}
                </Typography>
                <Typography variant="body1">
                  From: {booking.train.source}
                </Typography>
                <Typography variant="body1">
                  To: {booking.train.destination}
                </Typography>
                <Typography variant="body1">
                  Seats: {booking.seat_numbers.join(', ')}
                </Typography>
                <Typography variant="body1">
                  Status: {booking.status}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Booked on: {new Date(booking.booking_date).toLocaleDateString()}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard; 