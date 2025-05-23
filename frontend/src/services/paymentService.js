import api from './api';

const paymentService = {
  // Initialize payment
  initiatePayment: async (bookingId) => {
    try {
      const response = await api.post(`/payments/initiate/${bookingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Payment initiation failed' };
    }
  },

  // Verify payment status
  verifyPayment: async (paymentId, bookingId) => {
    try {
      const response = await api.post(`/payments/verify`, {
        paymentId,
        bookingId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Payment verification failed' };
    }
  },

  // Get payment history
  getPaymentHistory: async () => {
    try {
      const response = await api.get('/payments/history');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch payment history' };
    }
  },

  // Request refund
  requestRefund: async (bookingId) => {
    try {
      const response = await api.post(`/payments/refund/${bookingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Refund request failed' };
    }
  }
};

export default paymentService; 