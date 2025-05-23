import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Log request details
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });

    // For admin routes and train creation, use admin API key
    if (config.url && (config.url.includes('/admin') || config.url.includes('/trains/create'))) {
      const adminApiKey = localStorage.getItem('admin_api_key');
      if (adminApiKey) {
        config.headers['Authorization'] = `Api-Key ${adminApiKey}`;
      }
    } 
    // For all other routes, use JWT token
    else {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Log final request details
    console.log('Debug - Final request headers:', config.headers);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Enhanced error logging
    const errorDetails = {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config,
      url: error.config?.url,
      method: error.config?.method,
      requestData: error.config?.data ? JSON.parse(error.config.data) : {}
    };
    console.log('API Error Details:', errorDetails);
    
    // Handle network errors
    if (!error.response) {
      return Promise.reject({ 
        message: 'Unable to connect to the server. Please check if the backend server is running.',
        details: errorDetails
      });
    }

    // Handle authentication errors
    if (error.response.status === 401) {
      // Check if this is a login attempt
      if (error.config.url.includes('/login')) {
        return Promise.reject({
          message: 'Incorrect username/password provided. Please check your credentials or register if you don\'t have an account.',
          details: errorDetails
        });
      }
      
      // For other 401 errors (session expired, etc.)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('admin_api_key');
      window.location.href = '/';
      return Promise.reject({
        message: 'Session expired. Please login again.',
        details: errorDetails
      });
    }

    // Return detailed error information
    return Promise.reject({
      message: error.response.data.detail || 
               error.response.data.message || 
               error.response.data.error || 
               error.response.data.status || 
               'Something went wrong. Please try again.',
      details: errorDetails,
      validationErrors: error.response.data
    });
  }
);

// Define API endpoints with proper request format
export const auth = {
  signup: async (userData) => {
    try {
      console.log('Signup Request Data:', userData);
      const response = await api.post('/signup', userData);
      console.log('Signup Response:', response);
      return response;
    } catch (error) {
      console.error('Signup Error:', error);
      throw error;
    }
  },
  login: async (credentials) => {
    try {
      // Log the request data
      console.log('Login Request:', {
        url: `${API_BASE_URL}/login`,
        data: credentials
      });

      const response = await api.post('/login', {
        username: credentials.username,
        password: credentials.password
      });
      
      console.log('Login Response:', response.data);

      // Store token and user data if login successful
      if (response.data.status_code === 200) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify({ 
          id: response.data.user_id,
          is_admin: response.data.is_admin || false,
          username: credentials.username
        }));

        // Store admin API key if user is admin
        if (response.data.is_admin && response.data.admin_api_key) {
          console.log('Storing admin API key:', response.data.admin_api_key);
          localStorage.setItem('admin_api_key', response.data.admin_api_key);
        }
      }
      
      return response.data;
    } catch (error) {
      // Log the full error
      console.error('Login Error Full Details:', {
        error,
        response: error.response,
        data: error.response?.data
      });
      throw error;
    }
  }
};

export const trains = {
  searchTrains: (source, destination) => 
    api.get(`/trains/availability?source=${source}&destination=${destination}`),
  
  getSeatMatrix: async (trainId) => {
    try {
      const response = await api.get(`/trains/${trainId}/seats`);
      return response.data;
    } catch (error) {
      throw {
        ...error.response,
        message: error.response?.data?.message || 
                'Failed to fetch seat matrix. Please try again.'
      };
    }
  },

  bookSeat: async (trainId, userId, seatNumbers) => {
    try {
      const response = await api.post(`/trains/${trainId}/book`, { 
        user_id: userId, 
        seat_numbers: seatNumbers 
      });
      return response;
    } catch (error) {
      if (error.response?.status === 409) {
        throw error.response;
      }
      throw {
        ...error.response,
        message: error.response?.data?.message || 
                error.response?.data?.error || 
                'Failed to book seats. Please try again.'
      };
    }
  },
  
  getTrainDetails: async (trainId) => {
    try {
      const response = await api.get(`/trains/${trainId}`);
      return response;
    } catch (error) {
      console.error('Error fetching train details:', error);
      throw {
        ...error,
        message: error.response?.data?.message || 
                'Failed to fetch train details. Please try again.'
      };
    }
  },

  getBookingDetails: async (bookingId, trainId) => {
    try {
      const response = await api.get(`/trains/${trainId}/booking/${bookingId}`);
      return response;
    } catch (error) {
      console.error('Error fetching booking details:', error);
      throw {
        ...error,
        message: error.response?.data?.message || 
                'Failed to fetch booking details. Please try again.'
      };
    }
  },

  getUserBookings: async () => {
    try {
      const response = await api.get('/user/bookings');
      return response;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw {
        ...error,
        message: error.response?.data?.message || 
                'Failed to fetch your bookings. Please try again.'
      };
    }
  },

  create: async (trainData) => {
    try {
      console.log('Making train creation request with data:', trainData);
      const adminApiKey = localStorage.getItem('admin_api_key');
      if (!adminApiKey) {
        throw new Error('Admin API key not found. Please login as admin.');
      }
      
      // Create a new instance of axios for this specific request
      const response = await axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Api-Key ${adminApiKey}`
        }
      }).post('/trains/create', trainData);
      
      return response.data;
    } catch (error) {
      console.error('Train creation error:', error);
      throw error;
    }
  }
};

export default api; 