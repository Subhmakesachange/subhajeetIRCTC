import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, Box } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import AdminLogin from './components/AdminLogin';
import AddTrain from './components/AddTrain';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import ViewAllTrains from './components/ViewAllTrains';
import Unauthorized from './components/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';

import { jwtDecode } from 'jwt-decode';


const theme = createTheme({
  palette: {
    primary: {
      main: '#213d77',
    },
    secondary: {
      main: '#ff9933',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AuthProvider>
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            width: '100%',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Navbar />
            <Box sx={{
              flex: 1,
              width: '100%',
              position: 'relative',
              overflowY: 'auto',
              overflowX: 'hidden'
            }}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Protected admin routes */}
                <Route path="/admin/*" element={
                  <ProtectedRoute requireAdmin={true}>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="add-train" element={<AddTrain />} />
                      <Route path="view-trains" element={<ViewAllTrains />} />
                      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                    </Routes>
                  </ProtectedRoute>
                } />

                {/* Protected user routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                } />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
