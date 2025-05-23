import api from './api';

const userService = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch profile' };
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },

  // Add passenger
  addPassenger: async (passengerData) => {
    try {
      const response = await api.post('/users/passengers', passengerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add passenger' };
    }
  },

  // Get saved passengers
  getSavedPassengers: async () => {
    try {
      const response = await api.get('/users/passengers');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch passengers' };
    }
  },

  // Delete saved passenger
  deletePassenger: async (passengerId) => {
    try {
      const response = await api.delete(`/users/passengers/${passengerId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete passenger' };
    }
  },

  // Update password
  updatePassword: async (passwordData) => {
    try {
      const response = await api.put('/users/password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update password' };
    }
  },

  // Get travel history
  getTravelHistory: async () => {
    try {
      const response = await api.get('/users/travel-history');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch travel history' };
    }
  }
};

export default userService; 