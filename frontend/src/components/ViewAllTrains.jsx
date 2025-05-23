import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ViewAllTrains = () => {
  const [trains, setTrains] = useState([]);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [trainToDelete, setTrainToDelete] = useState(null);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const checkAuth = () => {
      const adminApiKey = localStorage.getItem('admin_api_key');
      
      if (!isAdmin || !adminApiKey) {
        navigate('/admin/login');
        return false;
      }
      return true;
    };

    const fetchTrains = async () => {
      try {
        if (!checkAuth()) return;

        const adminApiKey = localStorage.getItem('admin_api_key');
        const response = await axios.get('http://localhost:8000/api/admin/trains', {
          headers: {
            'Authorization': `Api-Key ${adminApiKey}`
          }
        });
        setTrains(response.data);
      } catch (err) {
        setError('Failed to fetch trains. Please try again later.');
        console.error('Error fetching trains:', err);
        if (err.response && err.response.status === 403) {
          navigate('/admin/login');
        }
      }
    };

    fetchTrains();
  }, [navigate, isAdmin]);

  const handleDeleteClick = (train) => {
    setTrainToDelete(train);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const adminApiKey = localStorage.getItem('admin_api_key');
      await axios.delete(`http://localhost:8000/api/admin/trains/${trainToDelete.train_id}`, {
        headers: {
          'Authorization': `Api-Key ${adminApiKey}`
        }
      });
      
      // Remove the deleted train from the state
      setTrains(trains.filter(train => train.train_id !== trainToDelete.train_id));
      setDeleteDialogOpen(false);
      setTrainToDelete(null);
    } catch (err) {
      setError('Failed to delete train. Please try again later.');
      console.error('Error deleting train:', err);
      if (err.response && err.response.status === 403) {
        navigate('/admin/login');
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTrainToDelete(null);
  };

  if (!isAdmin) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          You must be an admin to view this page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="h1" sx={{ mb: 4 }}>
        All Trains
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>Train ID</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Source</strong></TableCell>
              <TableCell><strong>Destination</strong></TableCell>
              <TableCell><strong>Total Seats</strong></TableCell>
              <TableCell><strong>Available Seats</strong></TableCell>
              <TableCell><strong>Departure Time</strong></TableCell>
              <TableCell><strong>Arrival Time</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trains.map((train) => (
              <TableRow key={train.train_id}>
                <TableCell>{train.train_id}</TableCell>
                <TableCell>{train.name}</TableCell>
                <TableCell>{train.source.station_name}</TableCell>
                <TableCell>{train.destination.station_name}</TableCell>
                <TableCell>{train.total_seats}</TableCell>
                <TableCell>{train.available_seats}</TableCell>
                <TableCell>{train.departure_time}</TableCell>
                <TableCell>{train.arrival_time}</TableCell>
                <TableCell>
                  <Box>
                    <IconButton 
                      color="error" 
                      size="small"
                      onClick={() => handleDeleteClick(train)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete train {trainToDelete?.name} ({trainToDelete?.train_id})?
          This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ViewAllTrains;