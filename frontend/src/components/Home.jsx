import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import homebg from '../assets/homebg.jpg';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#f8f9fa'
      }}
    >
      {/* Background Image */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${homebg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark overlay for better text visibility
          }
        }}
      />

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
          px: { xs: 2, sm: 4, md: 6 },
          py: { xs: 4, sm: 6, md: 8 }
        }}
      >
        <Box
          sx={{
            maxWidth: '1200px',
            width: '100%',
            textAlign: 'center',
          }}
        >
          <Typography
            component="h1"
            sx={{
              color: 'white',
              fontWeight: 700,
              textAlign: 'center',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              mb: { xs: 2, sm: 3, md: 4 },
              fontSize: {
                xs: 'clamp(2rem, 8vw, 2.5rem)',
                sm: 'clamp(2.5rem, 8vw, 3.5rem)',
                md: 'clamp(3.5rem, 8vw, 4.5rem)',
              },
              lineHeight: 1.2
            }}
          >
            Welcome to IRCTC
          </Typography>
          
          <Typography
            variant="h2"
            sx={{
              color: 'white',
              textAlign: 'center',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              mb: { xs: 4, sm: 6, md: 8 },
              fontSize: {
                xs: 'clamp(1rem, 4vw, 1.2rem)',
                sm: 'clamp(1.2rem, 4vw, 1.5rem)',
                md: 'clamp(1.5rem, 4vw, 2rem)',
              },
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.4
            }}
          >
            Experience the comfort of booking your train tickets online with Indian Railways
          </Typography>

          {!user ? (
            <Box
              sx={{
                display: 'flex',
                gap: { xs: 2, sm: 3 },
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'center',
                width: '100%',
                maxWidth: { xs: '100%', sm: '600px' },
                mx: 'auto'
              }}
            >
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{
                  backgroundColor: '#213d77',
                  '&:hover': { backgroundColor: '#1a2f5f' },
                  py: { xs: 1.5, md: 2 },
                  px: { xs: 4, md: 6 },
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                  flex: { xs: '1', sm: '1 1 45%' },
                  whiteSpace: 'nowrap'
                }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{
                  backgroundColor: '#ff9933',
                  '&:hover': { backgroundColor: '#ff8000' },
                  py: { xs: 1.5, md: 2 },
                  px: { xs: 4, md: 6 },
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                  flex: { xs: '1', sm: '1 1 45%' },
                  whiteSpace: 'nowrap'
                }}
              >
                Register
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              onClick={() => navigate('/dashboard')}
              sx={{
                backgroundColor: '#ff9933',
                '&:hover': { backgroundColor: '#ff8000' },
                py: { xs: 1.5, md: 2 },
                px: { xs: 4, md: 6 },
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                maxWidth: '300px',
                width: '100%'
              }}
            >
              Go to Dashboard
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
