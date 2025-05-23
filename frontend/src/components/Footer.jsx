import { Box, Container, Typography, Grid, Link } from '@mui/material';

const Footer = () => (
  <Box
    component="footer"
    sx={{
      backgroundColor: '#213d77',
      color: 'white',
      py: { xs: 3, md: 4 },
      width: '100%',
      position: 'static',
      zIndex: 1000
    }}
  >
    <Container>
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
            About IRCTC
          </Typography>
          <Link href="https://www.irctc.co.in/nget/about-us" target="_blank" rel="noopener noreferrer" color="inherit" display="block" sx={{ mb: 1, fontSize: { xs: '0.875rem', md: '1rem' } }}>
            About Us
          </Link>
          <Link href="https://www.irctc.co.in/nget/terms-and-conditions" target="_blank" rel="noopener noreferrer" color="inherit" display="block" sx={{ mb: 1, fontSize: { xs: '0.875rem', md: '1rem' } }}>
            Terms of Service
          </Link>
          <Link href="https://www.irctc.co.in/nget/privacy-policy" target="_blank" rel="noopener noreferrer" color="inherit" display="block" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
            Privacy Policy
          </Link>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
            Travel Info
          </Typography>
          <Link href="https://www.irctc.co.in/nget/train-search" target="_blank" rel="noopener noreferrer" color="inherit" display="block" sx={{ mb: 1, fontSize: { xs: '0.875rem', md: '1rem' } }}>
            Train Schedule
          </Link>
          <Link href="https://www.irctc.co.in/nget/pnr-enquiry" target="_blank" rel="noopener noreferrer" color="inherit" display="block" sx={{ mb: 1, fontSize: { xs: '0.875rem', md: '1rem' } }}>
            PNR Status
          </Link>
          <Link href="https://www.irctc.co.in/nget/fare-enquiry" target="_blank" rel="noopener noreferrer" color="inherit" display="block" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
            Fare Enquiry
          </Link>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
            Help
          </Typography>
          <Link href="https://www.irctc.co.in/nget/contact-us" target="_blank" rel="noopener noreferrer" color="inherit" display="block" sx={{ mb: 1, fontSize: { xs: '0.875rem', md: '1rem' } }}>
            Contact Us
          </Link>
          <Link href="https://www.irctc.co.in/nget/FAQ" target="_blank" rel="noopener noreferrer" color="inherit" display="block" sx={{ mb: 1, fontSize: { xs: '0.875rem', md: '1rem' } }}>
            FAQs
          </Link>
          <Link href="https://www.irctc.co.in/nget/contact-us" target="_blank" rel="noopener noreferrer" color="inherit" display="block" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
            Customer Care
          </Link>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
            Connect With Us
          </Typography>
          <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
            Indian Railway Catering and Tourism Corporation Ltd.
          </Typography>
          <Link 
            href="tel:1800-111-139" 
            color="inherit" 
            sx={{ mt: 1, fontSize: { xs: '0.875rem', md: '1rem' }, textDecoration: 'none' }}
          >
            Toll Free: 1800-111-139
          </Link>
        </Grid>
      </Grid>
      <Typography
        variant="body2"
        align="center"
        sx={{
          mt: { xs: 3, md: 4 },
          borderTop: '1px solid rgba(255,255,255,0.1)',
          pt: { xs: 2, md: 2 },
          fontSize: { xs: '0.875rem', md: '1rem' }
        }}
      >
        © {new Date().getFullYear()} IRCTC. All rights reserved.
      </Typography>
    </Container>
  </Box>
);

export default Footer;