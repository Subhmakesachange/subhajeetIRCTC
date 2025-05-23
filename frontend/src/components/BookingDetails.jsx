import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { trains } from '../services/api';

const BookingDetails = ({ open, onClose, bookingId, trainId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    if (bookingId && trainId) {
      fetchBookingDetails();
    } else {
      setLoading(false);
      setError('No booking ID or train ID provided');
    }
  }, [bookingId, trainId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await trains.getBookingDetails(bookingId, trainId);
      console.log('Booking details:', response.data);
      
      if (!response.data) {
        throw new Error('No booking data received');
      }
      
      // Process the booking data with null checks
      const processedData = {
        booking_id: response.data.booking_id || bookingId,
        train_id: response.data.train_id || trainId,
        train_name: response.data.train_name || 'N/A',
        source: response.data.source || 'N/A',
        destination: response.data.destination || 'N/A',
        user_id: response.data.user_id || user?.id || 'N/A',
        no_of_seats: response.data.no_of_seats || response.data.seat_count || 0,
        seat_numbers: response.data.seat_numbers || [],
        arrival_time_at_source: response.data.arrival_time_at_source || 'N/A',
        arrival_time_at_destination: response.data.arrival_time_at_destination || 'N/A',
        total_price: response.data.total_price || 0,
        status: response.data.status || 'CONFIRMED',
        booking_date: response.data.booking_time || response.data.created_at || 'N/A',
        seats: (response.data.seat_numbers || []).map(seatNumber => ({
          seat_number: seatNumber,
          class_type: 'Standard',
          price: response.data.price_per_seat || 500
        }))
      };
      
      setBookingDetails(processedData);
    } catch (err) {
      console.error('Error fetching booking details:', err);
      setError(err.message || 'Failed to fetch booking details');
      setBookingDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box>
          <Typography component="div" variant="h6">
            Booking Details
          </Typography>
          {bookingDetails && (
            <Typography component="div" variant="subtitle1" sx={{ mt: 1, color: 'text.secondary' }}>
              {bookingDetails.source} → {bookingDetails.destination}
            </Typography>
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading && (
          <Box display="flex" justifyContent="center" my={3}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && !bookingDetails && (
          <Alert severity="info" sx={{ mb: 2 }}>
            No booking details found
          </Alert>
        )}

        {bookingDetails && (
          <Box sx={{ mt: 2 }}>
            {/* Journey Information */}
            <Paper sx={{ p: 3, mb: 2, backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderRadius: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                position: 'relative'
              }}>
                {/* Source Station */}
                <Box sx={{ textAlign: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
                  <Typography variant="h5" sx={{ color: '#213d77', fontWeight: 'bold', mb: 1 }}>
                    {bookingDetails.source}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Source
                  </Typography>
                </Box>

                {/* Arrow and Line */}
                <Box sx={{ 
                  flex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  mx: 2
                }}>
                  {/* Line */}
                  <Box sx={{ 
                    position: 'absolute',
                    height: '2px',
                    backgroundColor: '#e0e0e0',
                    width: '100%'
                  }} />
                  
                  {/* Arrow Circle */}
                  <Box sx={{ 
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#ff9933',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 1,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}>
                    <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.5rem' }}>
                      →
                    </Typography>
                  </Box>
                </Box>

                {/* Destination Station */}
                <Box sx={{ textAlign: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
                  <Typography variant="h5" sx={{ color: '#213d77', fontWeight: 'bold', mb: 1 }}>
                    {bookingDetails.destination}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Destination
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Train Information */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography component="div" variant="h6" gutterBottom>
                Train Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Typography><strong>Train Name:</strong> {bookingDetails.train_name}</Typography>
                <Typography><strong>Train ID:</strong> {bookingDetails.train_id}</Typography>
                <Typography><strong>Departure Time:</strong> {bookingDetails.arrival_time_at_source}</Typography>
                <Typography><strong>Arrival Time:</strong> {bookingDetails.arrival_time_at_destination}</Typography>
              </Box>
            </Paper>

            {/* Booking Information */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography component="div" variant="h6" gutterBottom>
                Booking Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Typography><strong>Booking ID:</strong> {bookingDetails.booking_id}</Typography>
                <Typography><strong>Booking Date:</strong> {formatDate(bookingDetails.booking_date)}</Typography>
                <Typography><strong>Number of Seats:</strong> {bookingDetails.no_of_seats}</Typography>
                <Typography><strong>Status:</strong> 
                  <Box component="span" sx={{ 
                    color: bookingDetails.status === 'confirmed' ? 'success.main' : 'warning.main',
                    ml: 1,
                    fontWeight: 'bold'
                  }}>
                    {(bookingDetails.status || 'N/A').toUpperCase()}
                  </Box>
                </Typography>
              </Box>
            </Paper>

            {/* Seat Information */}
            <Paper sx={{ p: 2 }}>
              <Typography component="div" variant="h6" gutterBottom>
                Seat Details
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#213d77' }}>
                      <TableCell sx={{ color: 'white' }}>Seat Number</TableCell>
                      <TableCell sx={{ color: 'white' }}>Class</TableCell>
                      <TableCell sx={{ color: 'white' }}>Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bookingDetails.seats && bookingDetails.seats.map((seat, index) => (
                      <TableRow key={index}>
                        <TableCell>{seat.seat_number || 'N/A'}</TableCell>
                        <TableCell>{seat.class_type || 'N/A'}</TableCell>
                        <TableCell>{formatPrice(seat.price)}</TableCell>
                      </TableRow>
                    ))}
                    {(!bookingDetails.seats || bookingDetails.seats.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">No seat information available</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Total Price */}
            <Paper sx={{ p: 2, mt: 2, backgroundColor: '#f8f8f8' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Total Price:</Typography>
                <Typography variant="h6" sx={{ color: '#213d77', fontWeight: 'bold' }}>
                  {formatPrice(bookingDetails.total_price)}
                </Typography>
              </Box>
            </Paper>
          </Box>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              backgroundColor: '#ff9933',
              '&:hover': {
                backgroundColor: '#ff8000'
              }
            }}
          >
            Close
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetails; 