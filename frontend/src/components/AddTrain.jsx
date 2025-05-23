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
  Paper,
  Grid
} from '@mui/material';
import { trains } from '../services/api';

const AddTrain = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    train_name: '',
    source: '',
    destination: '',
    seat_capacity: '',
    arrival_time_at_source: '',
    arrival_time_at_destination: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.train_name) errors.train_name = 'Train name is required';
    if (!formData.source) errors.source = 'Source station is required';
    if (!formData.destination) errors.destination = 'Destination station is required';
    
    if (!formData.seat_capacity) {
      errors.seat_capacity = 'Seat capacity is required';
    } else if (isNaN(formData.seat_capacity) || parseInt(formData.seat_capacity) <= 0) {
      errors.seat_capacity = 'Seat capacity must be a positive number';
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
    if (!formData.arrival_time_at_source) {
      errors.arrival_time_at_source = 'Departure time is required';
    } else if (!timeRegex.test(formData.arrival_time_at_source)) {
      errors.arrival_time_at_source = 'Time must be in HH:MM:SS format';
    }

    if (!formData.arrival_time_at_destination) {
      errors.arrival_time_at_destination = 'Arrival time is required';
    } else if (!timeRegex.test(formData.arrival_time_at_destination)) {
      errors.arrival_time_at_destination = 'Time must be in HH:MM:SS format';
    }

    if (Object.keys(errors).length > 0) {
      setError('Please fix the following errors: ' + Object.values(errors).join(', '));
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
      // Add seconds to the time values if they're missing
      const formattedData = {
        ...formData,
        arrival_time_at_source: formData.arrival_time_at_source.includes(':') ? 
          (formData.arrival_time_at_source.length === 5 ? formData.arrival_time_at_source + ':00' : formData.arrival_time_at_source) : 
          formData.arrival_time_at_source + ':00:00',
        arrival_time_at_destination: formData.arrival_time_at_destination.includes(':') ? 
          (formData.arrival_time_at_destination.length === 5 ? formData.arrival_time_at_destination + ':00' : formData.arrival_time_at_destination) : 
          formData.arrival_time_at_destination + ':00:00'
      };

      console.log('Sending train data:', formattedData);
      const response = await trains.create(formattedData);
      
      if (response.train_id) {
        // Show success alert
        const successMessage = `Train ${response.train_details.name} has been successfully created!`;
        alert(successMessage);
        
        // Navigate to dashboard with success message
        navigate('/admin/dashboard', { 
          state: { 
            message: successMessage,
            type: 'success'
          }
        });
      } else {
        setError(response.error || 'Failed to add train');
      }
    } catch (err) {
      console.error('Add Train Error:', err);
      if (err.details) {
        // If we have detailed validation errors
        if (typeof err.details === 'object') {
          const errorMessages = Object.values(err.details).join(', ');
          setError(`Validation failed: ${errorMessages}`);
        } else {
          setError(err.details);
        }
      } else if (err.error) {
        setError(err.error);
      } else {
        setError('Failed to add train. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Add New Train
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="train_name"
                label="Train Name"
                name="train_name"
                value={formData.train_name}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="source"
                label="Source Station"
                name="source"
                value={formData.source}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="destination"
                label="Destination Station"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                id="seat_capacity"
                label="Total Seats"
                name="seat_capacity"
                type="number"
                value={formData.seat_capacity}
                onChange={handleChange}
                disabled={loading}
                inputProps={{ min: "1" }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                id="arrival_time_at_source"
                label="Departure Time (HH:MM:SS)"
                name="arrival_time_at_source"
                type="text"
                placeholder="14:00:00"
                value={formData.arrival_time_at_source}
                onChange={handleChange}
                disabled={loading}
                error={error && error.includes('time')}
                helperText="Format: HH:MM:SS (e.g., 14:00:00)"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                id="arrival_time_at_destination"
                label="Arrival Time (HH:MM:SS)"
                name="arrival_time_at_destination"
                type="text"
                placeholder="20:30:00"
                value={formData.arrival_time_at_destination}
                onChange={handleChange}
                disabled={loading}
                error={error && error.includes('time')}
                helperText="Format: HH:MM:SS (e.g., 20:30:00)"
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ 
              mt: 3, 
              mb: 2,
              backgroundColor: '#1a237e',
              '&:hover': {
                backgroundColor: '#0d47a1'
              }
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Add Train'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddTrain; 