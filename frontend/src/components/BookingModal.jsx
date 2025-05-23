import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { trains } from '../services/api';
import BookingDetails from './BookingDetails';

const BookingModal = ({ open, onClose, train }) => {
  const { user } = useAuth();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bookingId, setBookingId] = useState(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [seatMatrix, setSeatMatrix] = useState([]);

  useEffect(() => {
    if (train) {
      fetchSeatMatrix();
    }
  }, [train]);

  useEffect(() => {
    let successTimer;
    if (success) {
      console.log('Booking Success:', success);
      successTimer = setTimeout(() => {
        setSuccess('');
      }, 5000);
    }
    return () => {
      if (successTimer) clearTimeout(successTimer);
    };
  }, [success]);

  const fetchSeatMatrix = async () => {
    try {
      const response = await trains.getSeatMatrix(train.train_id);
      setSeatMatrix(response.seat_matrix);
    } catch (err) {
      console.error('Error fetching seat matrix:', err);
      setError('Failed to load seat information. Please try again.');
    }
  };

  const handleSeatClick = (seatNumber) => {
    setSelectedSeats(prev => {
      const newSelection = prev.includes(seatNumber)
        ? prev.filter(num => num !== seatNumber)
        : [...prev, seatNumber];
      return newSelection;
    });
    setError('');
  };

  const handleBooking = async () => {
    setLoading(true);
    setError(null);
    setSuccess('');
    
    try {
        if (!user) {
            setError('Please login to book tickets');
            return;
        }

        const response = await trains.bookSeat(
            train.train_id, 
            user.id, 
            selectedSeats
        );
        
        // Check if the response indicates success (either through status field or HTTP status)
        if (response.data.status === 'success' || response.status === 201) {
            console.log('Booking successful:', {
                bookingId: response.data.booking_id,
                seats: selectedSeats,
                trainId: train.train_id,
                trainName: train.name
            });
            
            // Set success message with booking details
            setSuccess(
                <Alert 
                    severity="success"
                    sx={{ 
                        mb: 2,
                        '& .MuiAlert-message': { 
                            whiteSpace: 'pre-line',
                            fontWeight: 500 
                        }
                    }}
                >
                    Booking Successful!
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        Booking ID: {response.data.booking_id}
                        {'\n'}Seats: {selectedSeats.join(', ')}
                        {'\n'}Total Price: ₹{response.data.total_price || selectedSeats.length * 500}
                    </Typography>
                </Alert>
            );
            
            // Reset selected seats and refresh matrix
            setSelectedSeats([]);
            await fetchSeatMatrix();
            
            // Set a timeout to close the modal after showing the success message
            setTimeout(() => {
                onClose();
            }, 3000);
        }
    } catch (err) {
        console.error('Booking Error:', err);
        const errorData = err.response?.data;
        
        if (errorData?.error_type === 'seats_taken') {
            setError(
                <div>
                    <p>{errorData.message}</p>
                    <p>Available seats: {errorData.available_seats.join(', ')}</p>
                    <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => {
                            setSelectedSeats([]);
                            fetchSeatMatrix();
                            setError(null);
                        }}
                        sx={{ mt: 2 }}
                    >
                        Modify Selection
                    </Button>
                </div>
            );
        } else if (errorData?.error_type === 'invalid_seats') {
            setError(
                <div>
                    <p>{errorData.message}</p>
                    <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => {
                            setSelectedSeats([]);
                            fetchSeatMatrix();
                            setError(null);
                        }}
                        sx={{ mt: 2 }}
                    >
                        Choose Different Seats
                    </Button>
                </div>
            );
        } else if (errorData?.error_type === 'concurrent_booking') {
            setError(
                <div>
                    <p>{errorData.message}</p>
                    <p>Available seats: {errorData.available_seats.join(', ')}</p>
                    <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => {
                            setSelectedSeats([]);
                            fetchSeatMatrix();
                            setError(null);
                        }}
                        sx={{ mt: 2 }}
                    >
                        Choose New Seats
                    </Button>
                </div>
            );
        } else {
            setError(errorData?.message || 'Failed to book seats. Please try again.');
        }
        // Refresh seat matrix after any error
        fetchSeatMatrix();
    } finally {
        setLoading(false);
    }
  };

  const handleCloseBookingDetails = () => {
    setShowBookingDetails(false);
    onClose();
  };

  const getSeatColor = (seat) => {
    if (seat.status === 'BOOKED') {
      return '#ff9933'; // Orange for booked seats
    }
    if (selectedSeats.includes(seat.seat_number)) {
      return '#213D77'; // Dark blue for selected seats
    }
    return 'white'; // White for available seats
  };

  // If we have a booking ID and showBookingDetails is true, show the booking details
  if (showBookingDetails && bookingId) {
    return (
      <BookingDetails
        open={true}
        onClose={handleCloseBookingDetails}
        bookingId={bookingId}
        trainId={train?.train_id}
      />
    );
  }

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
            Book Seats - {train.name}
          </Typography>
          <Typography component="div" variant="subtitle1" color="textSecondary">
            Available Seats: {train.available_seats}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ mt: 2, mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Seats: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
          </Typography>
          <Typography variant="subtitle2" color="primary">
            Price per seat: ₹30
          </Typography>
          {selectedSeats.length > 0 && (
            <Typography variant="subtitle2" color="primary">
              Total Price: ₹{selectedSeats.length * 30}
            </Typography>
          )}
        </Box>

        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            p: 2,
            border: '1px solid #ddd',
            borderRadius: 1,
            backgroundColor: '#f9f9f9'
          }}
        >
          {/* Seat Matrix */}
          {seatMatrix.map((row, rowIndex) => (
            <Box 
              key={rowIndex} 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 1, 
                width: '100%' 
              }}
            >
              {row.map((seat) => (
                <Tooltip 
                  key={seat.seat_number}
                  title={
                    seat.status === 'BOOKED'
                      ? 'Seat already booked'
                      : selectedSeats.includes(seat.seat_number)
                      ? 'Selected seat'
                      : `Seat ${seat.seat_number}`
                  }
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: seat.status === 'AVAILABLE' ? 'pointer' : 'not-allowed',
                      border: '1px solid #ccc',
                      borderRadius: 1,
                      backgroundColor: getSeatColor(seat),
                      color: (seat.status === 'BOOKED' || selectedSeats.includes(seat.seat_number)) ? 'white' : 'black'
                    }}
                    onClick={() => seat.status === 'AVAILABLE' && handleSeatClick(seat.seat_number)}
                  >
                    {seat.seat_number}
                  </Box>
                </Tooltip>
              ))}
            </Box>
          ))}

          {/* Legend */}
          <Box sx={{ mt: 2, display: 'flex', gap: 3, justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 20, height: 20, backgroundColor: '#ff9933', border: '1px solid #ccc' }} />
              <Typography variant="caption">Booked</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 20, height: 20, backgroundColor: '#213D77', border: '1px solid #ccc' }} />
              <Typography variant="caption">Selected</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 20, height: 20, backgroundColor: 'white', border: '1px solid #ccc' }} />
              <Typography variant="caption">Available</Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleBooking}
          variant="contained"
          disabled={loading || selectedSeats.length === 0}
          sx={{
            backgroundColor: '#213D77',
            '&:hover': {
              backgroundColor: '#1a2f5c'
            }
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Book Selected Seats'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingModal; 