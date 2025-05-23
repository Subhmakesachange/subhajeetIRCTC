import { 
  AppBar, 
  Toolbar, 
  Button, 
  Box, 
  Container, 
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import irctcLogo from '../assets/irctc.png';
import railwaysLogo from '../assets/logo.png';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = () => {
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleMenuClick();
  };

  const menuItems = user ? [
    { text: 'Dashboard', path: '/dashboard' },
    ...(user.is_admin ? [{ text: 'Admin Dashboard', path: '/admin/dashboard' }] : []),
    { text: 'Logout', action: handleLogout }
  ] : [
    { text: 'Login', path: '/login' },
    { text: 'Register', path: '/register' },
    { text: 'Admin Login', path: '/admin/login' }
  ];

  const drawer = (
    <Box sx={{ width: 250, pt: 2 }}>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={item.path ? Link : 'button'}
              to={item.path}
              onClick={() => {
                if (item.action) {
                  item.action();
                }
                handleMenuClick();
              }}
              sx={{
                color: item.text === 'Admin Login' ? '#ff9933' : '#213d77',
                '&:hover': {
                  backgroundColor: item.text === 'Admin Login' 
                    ? 'rgba(255, 153, 51, 0.1)' 
                    : 'rgba(33, 61, 119, 0.1)',
                }
              }}
            >
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      {/* Top Navbar */}
      <AppBar
        position="static"
        sx={{
          backgroundColor: '#fff',
          boxShadow: 'none',
          borderBottom: '1px solid #e0e0e0',
          width: '100%',
        }}
      >
        <Container maxWidth={false} disableGutters>
          <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Toolbar sx={{ justifyContent: 'space-between', padding: '0.5rem 1rem' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <img 
                  src={irctcLogo} 
                  alt="IRCTC Logo" 
                  style={{ 
                    height: isMobile ? '40px' : '50px',
                    width: 'auto'
                  }} 
                />
                <img 
                  src={railwaysLogo} 
                  alt="Indian Railways Logo" 
                  style={{ 
                    height: isMobile ? '40px' : '50px',
                    width: 'auto'
                  }} 
                />
              </Box>

              {/* Mobile Menu Icon */}
              {isMobile ? (
                <Box 
                  onClick={handleDrawerToggle}
                  sx={{ 
                    color: '#213d77',
                    display: { md: 'none' },
                    cursor: 'pointer'
                  }}
                >
                  <MenuIcon />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {user ? (
                    <>
                      {user.is_admin && (
                        <Button
                          component={Link}
                          to="/admin/dashboard"
                          sx={{
                            color: '#213d77',
                            '&:hover': { backgroundColor: 'rgba(33, 61, 119, 0.1)' },
                          }}
                        >
                          Admin Dashboard
                        </Button>
                      )}
                      <Button
                        onClick={handleLogout}
                        sx={{
                          color: '#213d77',
                          '&:hover': { backgroundColor: 'hsla(0, 0.00%, 100.00%, 0.10)' },
                        }}
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        component={Link}
                        to="/login"
                        sx={{
                          color: '#213d77',
                          '&:hover': { backgroundColor: 'rgba(33, 61, 119, 0.1)' },
                        }}
                      >
                        Login
                      </Button>
                      <Button
                        component={Link}
                        to="/register"
                        variant="contained"
                        sx={{
                          backgroundColor: '#213d77',
                          '&:hover': { backgroundColor: '#1a2f5f' },
                        }}
                      >
                        Register
                      </Button>
                      <Button
                        component={Link}
                        to="/admin/login"
                        sx={{
                          color: '#ff9933',
                          '&:hover': { backgroundColor: 'rgba(255, 153, 51, 0.1)' },
                        }}
                      >
                        Admin Login
                      </Button>
                    </>
                  )}
                </Box>
              )}
            </Toolbar>
          </Box>
        </Container>
      </AppBar>

      {/* Bottom Navbar */}
      <AppBar
        position="static"
        sx={{
          backgroundColor: '#213d77',
          width: '100%',
        }}
      >
        <Container maxWidth={false} disableGutters>
          <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Toolbar sx={{ justifyContent: 'center', gap: 4 }}>
              <Button component={Link} to="/" color="inherit" sx={{ fontWeight: 'bold' }}>
                HOME
              </Button>
              {user?.is_admin && (
                <Button 
                  component={Link} 
                  to="/admin/dashboard" 
                  color="inherit" 
                  sx={{ fontWeight: 'bold' }}
                >
                  ADMIN DASHBOARD
                </Button>
              )}
            </Toolbar>
          </Box>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
