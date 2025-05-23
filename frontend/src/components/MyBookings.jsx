import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { trains } from '../services/api';
import BookingDetails from './BookingDetails';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [isBookingDetailsOpen, setIsBookingDetailsOpen] = useState(false);
  const [success, setSuccess] = useState('');
  const [selectedTrainId, setSelectedTrainId] = useState(null);

  useEffect(() => {
    const loadBookings = async () => {
      // Check for booking success message
      const bookingSuccess = sessionStorage.getItem('bookingSuccess');
      if (bookingSuccess) {
        try {
          const { message, bookingId, trainName, timestamp } = JSON.parse(bookingSuccess);
          console.log('MyBookings - New booking details:', {
            message,
            bookingId,
            trainName,
            timestamp: new Date(timestamp).toLocaleString()
          });
          setSuccess(message);
          
          // Set a timeout to clear both the local state and sessionStorage
          const timer = setTimeout(() => {
            setSuccess('');
            sessionStorage.removeItem('bookingSuccess');
          }, 5000);
          
          // Clean up timer if component unmounts
          return () => clearTimeout(timer);
        } catch (err) {
          console.error('Error parsing booking success:', err);
          sessionStorage.removeItem('bookingSuccess');
        }
      }
      // Fetch bookings
      await fetchUserBookings();
    };

    loadBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await trains.getUserBookings();
      console.log('User bookings response:', response);
      
      if (response && response.data) {
        // Ensure we have an array of bookings
        const bookingsData = Array.isArray(response.data) ? response.data : response.data.bookings || [];
        console.log('Processed bookings data:', bookingsData);
        setBookings(bookingsData);
      } else {
        setBookings([]);
        setError('No booking data available');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to fetch your bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBookingDetails = (bookingId, trainId) => {
    setSelectedBookingId(bookingId);
    setSelectedTrainId(trainId);
    setIsBookingDetailsOpen(true);
  };

  const handleBookingDetailsClose = () => {
    setIsBookingDetailsOpen(false);
    setSelectedBookingId(null);
    setSelectedTrainId(null);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={3}>
        <CircularProgress sx={{ color: '#ff9933' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ color: '#213d77' }}>
        My Bookings
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {bookings.length === 0 ? (
        <Alert severity="info" sx={{ backgroundColor: '#fff3e0' }}>
          You haven't made any bookings yet. Use the "Search Trains" tab to book your journey!
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#213d77' }}>
                <TableCell sx={{ color: 'white' }}>Booking ID</TableCell>
                <TableCell sx={{ color: 'white' }}>Train</TableCell>
                <TableCell sx={{ color: 'white' }}>Route</TableCell>
                <TableCell sx={{ color: 'white' }}>Date</TableCell>
                <TableCell sx={{ color: 'white' }}>Status</TableCell>
                <TableCell sx={{ color: 'white' }}>Seats</TableCell>
                <TableCell sx={{ color: 'white' }}>Total Price</TableCell>
                <TableCell sx={{ color: 'white' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.booking_id || booking.id}>
                  <TableCell>{booking.booking_id || booking.id}</TableCell>
                  <TableCell>
                    {booking.train?.name}
                    <Typography variant="caption" display="block" color="textSecondary">
                      {booking.train?.train_id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {booking.train?.source} →
                    </Typography>
                    <Typography variant="body2">
                      {booking.train?.destination}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={(booking.status || 'N/A').toUpperCase()}
                      color={getStatusColor(booking.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{booking.num_seats || 'N/A'}</TableCell>
                  <TableCell>₹{booking.total_price || 0}</TableCell>
                  <TableCell>
                    <Tooltip title="View Booking Details">
                      <IconButton
                        onClick={() => handleViewBookingDetails(
                          booking.booking_id || booking.id,
                          booking.train?.train_id
                        )}
                        sx={{ color: '#ff9933' }}
                      >
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <BookingDetails
        open={isBookingDetailsOpen}
        onClose={handleBookingDetailsClose}
        bookingId={selectedBookingId}
        trainId={selectedTrainId}
      />
    </Box>
  );
};

export default MyBookings; 