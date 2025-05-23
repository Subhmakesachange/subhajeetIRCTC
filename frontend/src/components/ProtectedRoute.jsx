import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user } = useAuth();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const adminApiKey = localStorage.getItem('admin_api_key');

  // If no token, redirect to login with return path
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // For admin routes, check all admin requirements
  if (requireAdmin) {
    if (!user.is_admin || !adminApiKey) {
      console.log('Admin access denied:', {
        isAdmin: user.is_admin,
        hasAdminKey: !!adminApiKey
      });
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // For non-admin routes, prevent admin access (they should use admin routes)
  if (!requireAdmin && user.is_admin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute; 