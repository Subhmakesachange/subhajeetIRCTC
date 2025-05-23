import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Grid,
  IconButton,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useAuth } from '../context/AuthContext';
import { trains } from '../services/api';
import BookingModal from './BookingModal';
import BookingDetails from './BookingDetails';
import MyBookings from './MyBookings';

const UserDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useState({
    source: '',
    destination: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [selectedTrainId, setSelectedTrainId] = useState(null);
  const [isBookingDetailsOpen, setIsBookingDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [activeView, setActiveView] = useState(null);

  // Enhanced useEffect for success message handling
  useEffect(() => {
    const bookingSuccess = sessionStorage.getItem('bookingSuccess');
    if (bookingSuccess) {
      try {
        const { message, bookingId, trainName, timestamp } = JSON.parse(bookingSuccess);
        console.log('Booking success details:', {
          message,
          bookingId,
          trainName,
          timestamp: new Date(timestamp).toLocaleString()
        });
        
        setSuccess(message);
        // Switch to My Bookings tab
        setActiveTab(1);
      } catch (err) {
        console.error('Error parsing booking success:', err);
      }
    }
  }, []);

  // Add useEffect for success message handling - only clear local state
  useEffect(() => {
    let successTimer;
    if (success) {
      console.log('Dashboard Success:', success);
      successTimer = setTimeout(() => {
        setSuccess('');
      }, 5000);
    }
    return () => {
      if (successTimer) clearTimeout(successTimer);
    };
  }, [success]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchParams.source || !searchParams.destination) {
      setError('Please enter both source and destination stations');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setSearchResults([]);

    try {
      const response = await trains.searchTrains(searchParams.source, searchParams.destination);
      console.log('Search response:', response);
      
      if (response.data && response.data.length > 0) {
        // Transform the data to include all necessary fields
        const transformedData = response.data.map(train => ({
          ...train,
          name: train.train_name, // Ensure name is available for BookingModal
          total_seats: parseInt(train.total_seats || 50), // Ensure total_seats is a number
          available_seats: parseInt(train.available_seats || 0) // Ensure available_seats is a number
        }));
        setSearchResults(transformedData);
        setSuccess('Trains found successfully!');
      } else {
        setError('No trains found for this route');
      }
    } catch (err) {
      console.error('Search Error:', err);
      setError(err.message || 'Failed to search trains. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (train) => {
    console.log('Selected train for booking:', train);
    setSelectedTrain(train);
    setIsBookingModalOpen(true);
  };

  const handleBookingModalClose = () => {
    setIsBookingModalOpen(false);
    setSelectedTrain(null);
    
    // Check for new booking success message
    const bookingSuccess = sessionStorage.getItem('bookingSuccess');
    if (bookingSuccess) {
      const { message } = JSON.parse(bookingSuccess);
      setSuccess(message);
      // Switch to My Bookings tab
      setActiveTab(1);
      // Don't remove the success message here, let MyBookings component handle it
    }
    
    // Refresh search results if needed
    if (searchParams.source && searchParams.destination) {
      handleSearch({ preventDefault: () => {} });
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Only clear success message if it's not a booking success
    if (newValue === 1 && !sessionStorage.getItem('bookingSuccess')) {
      setSuccess('');
    }
    // Clear search results when switching to My Bookings
    if (newValue === 1) {
      setSearchResults([]);
      setError('');
    }
  };

  const renderMobileView = () => (
    <Grid container spacing={2} sx={{ display: { xs: 'flex', md: 'none' } }}>
      <Grid item xs={6}>
        <Paper
          elevation={3}
          onClick={() => setActiveView('search')}
          sx={{
            p: 2,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: activeView === 'search' ? '#f5f5f5' : 'white',
            '&:hover': { bgcolor: '#f5f5f5' }
          }}
        >
          <Typography variant="h6" sx={{ color: '#213d77', fontSize: '1rem' }}>
            Search Trains
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={6}>
        <Paper
          elevation={3}
          onClick={() => setActiveView('bookings')}
          sx={{
            p: 2,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: activeView === 'bookings' ? '#f5f5f5' : 'white',
            '&:hover': { bgcolor: '#f5f5f5' }
          }}
        >
          <Typography variant="h6" sx={{ color: '#213d77', fontSize: '1rem' }}>
            My Bookings
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderDesktopView = () => (
    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              color: '#213d77',
              '&.Mui-selected': {
                color: '#ff9933',
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#ff9933',
            }
          }}
        >
          <Tab label="Search Trains" />
          <Tab label="My Bookings" />
        </Tabs>
      </Box>

      {activeTab === 0 ? (
        <>
          <Box component="form" onSubmit={handleSearch} noValidate sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={5}>
                <TextField
                  required
                  fullWidth
                  id="source"
                  label="Source Station"
                  name="source"
                  value={searchParams.source}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  required
                  fullWidth
                  id="destination"
                  label="Destination Station"
                  name="destination"
                  value={searchParams.destination}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    height: '56px',
                    backgroundColor: '#ff9933',
                    '&:hover': {
                      backgroundColor: '#ff8000'
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Search'}
                </Button>
              </Grid>
            </Grid>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}

          {searchResults.length > 0 && (
            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#213d77' }}>
                    <TableCell sx={{ color: 'white' }}>Train ID</TableCell>
                    <TableCell sx={{ color: 'white' }}>Train Name</TableCell>
                    <TableCell sx={{ color: 'white' }}>Available Seats</TableCell>
                    <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {searchResults.map((train) => (
                    <TableRow key={train.train_id}>
                      <TableCell>{train.train_id}</TableCell>
                      <TableCell>{train.name}</TableCell>
                      <TableCell>{train.available_seats}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            color="primary"
                            disabled={train.available_seats === 0}
                            onClick={() => handleBookClick(train)}
                            sx={{
                              backgroundColor: '#ff9933',
                              '&:hover': {
                                backgroundColor: '#ff8000'
                              }
                            }}
                          >
                            Book Now
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      ) : (
        <MyBookings />
      )}
    </Box>
  );

  const renderMobileContent = () => {
    if (!activeView) return null;
    
    return (
      <Box sx={{ mt: 2 }}>
        {activeView === 'search' ? (
          <Box component="form" onSubmit={handleSearch} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="source"
                  label="Source Station"
                  name="source"
                  value={searchParams.source}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="destination"
                  label="Destination Station"
                  name="destination"
                  value={searchParams.destination}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    height: '56px',
                    backgroundColor: '#ff9933',
                    '&:hover': {
                      backgroundColor: '#ff8000'
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Search'}
                </Button>
              </Grid>
            </Grid>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {success}
              </Alert>
            )}

            {searchResults.length > 0 && (
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#213d77' }}>
                      <TableCell sx={{ color: 'white' }}>Train Name</TableCell>
                      <TableCell sx={{ color: 'white' }}>Available Seats</TableCell>
                      <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {searchResults.map((train) => (
                      <TableRow key={train.train_id}>
                        <TableCell>{train.name}</TableCell>
                        <TableCell>{train.available_seats}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            disabled={train.available_seats === 0}
                            onClick={() => handleBookClick(train)}
                            sx={{
                              backgroundColor: '#ff9933',
                              '&:hover': {
                                backgroundColor: '#ff8000'
                              }
                            }}
                          >
                            Book Now
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        ) : (
          <MyBookings />
        )}
      </Box>
    );
  };

  return (
    <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography component="h1" variant="h5" gutterBottom>
          Welcome, {user?.username}!
        </Typography>

        {/* Mobile View */}
        {renderMobileView()}
        {renderMobileContent()}

        {/* Desktop View */}
        {renderDesktopView()}
      </Paper>

      {selectedTrain && (
        <BookingModal
          open={isBookingModalOpen}
          onClose={handleBookingModalClose}
          train={selectedTrain}
        />
      )}

      <BookingDetails
        open={isBookingDetailsOpen}
        onClose={handleBookingDetailsClose}
        bookingId={selectedBookingId}
        trainId={selectedTrainId}
      />
    </Container>
  );
};

export default UserDashboard; 