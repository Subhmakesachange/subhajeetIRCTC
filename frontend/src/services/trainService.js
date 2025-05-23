import api from './api';

const trainService = {
  // Search trains based on source, destination and date
  searchTrains: async (searchParams) => {
    try {
      const response = await api.get('/trains/search', { params: searchParams });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Train search failed' };
    }
  },

  // Get train details by train number
  getTrainDetails: async (trainNumber) => {
    try {
      const response = await api.get(`/trains/${trainNumber}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch train details' };
    }
  },

  // Get seat availability
  checkAvailability: async (trainNumber, date, classType) => {
    try {
      const response = await api.get(`/trains/${trainNumber}/availability`, {
        params: { date, classType }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to check availability' };
    }
  },

  // Book tickets
  bookTicket: async (bookingData) => {
    try {
      const response = await api.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Booking failed' };
    }
  },

  // Get user's bookings
  getUserBookings: async () => {
    try {
      const response = await api.get('/bookings/user');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch bookings' };
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId) => {
    try {
      const response = await api.post(`/bookings/${bookingId}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to cancel booking' };
    }
  },

  // Get PNR status
  getPnrStatus: async (pnr) => {
    try {
      const response = await api.get(`/pnr/${pnr}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch PNR status' };
    }
  }
};

export default trainService; 