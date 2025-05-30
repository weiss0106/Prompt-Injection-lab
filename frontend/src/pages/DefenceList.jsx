import { Box, Button, Typography, Card, CardContent, Avatar, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function DefenceList() {
  const navigate = useNavigate();

  return (
    <Box
    sx={{
        minHeight: '100vh',
        width: '100vw',
        background: '#0A0D17',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflow: 'hidden',
        position: 'relative',
        px: 2,
        py: 6,
      }}
    >
      {/* background decoration circle */}
      <Box
        sx={{
          position: 'absolute',
          width: '20vw',
          height: '28vh',
          borderRadius: '50%',
          background: 'radial-gradient(circle,rgb(112, 2, 163), transparent)',
          top: '10%',
          left: '5%',
          filter: 'blur(70px)',
          zIndex: 0,
          opacity: 0.4,
          minWidth: 100,
          minHeight: 100,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: '26vw',
          height: '20vh',
          borderRadius: '50%',
          background: 'radial-gradient(circle,rgb(69, 28, 157), transparent)',
          top: '10%',
          right: '10%',
          filter: 'blur(70px)',
          zIndex: 0,
          opacity: 0.3,
          minWidth: 120,
          minHeight: 120,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: '30vw',
          height: '30vh',
          borderRadius: '50%',
          background: 'radial-gradient(circle,rgb(56, 20, 132), transparent)',
          bottom: '10%',
          right: '30%',
          filter: 'blur(70px)',
          zIndex: 0,
          opacity: 0.5,
          minWidth: 80,
          minHeight: 80,
        }}
      />

      {/* 🧢 page top title part */}
      <Box sx={{ textAlign: 'center', mb: 8, zIndex: 1, width: '100%', maxWidth: '1200px', position: 'relative' }}>
        <IconButton 
          onClick={() => navigate('/modes')} 
          sx={{ 
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#fff',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h1"
          sx={{
            fontWeight: 900,
            background: 'linear-gradient(90deg, #ffffff 0%,rgb(235, 226, 255) 30%, #763AF5 80%, #A604F2 110%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '2.5rem', md: '4.5rem' },
          }}
        >
          Defence From Being Attacked
        </Typography>
      </Box>

      {/* 🧊 content card part (defence strategy list) */}
      <Box
        sx={{
          width: '100%',
          maxWidth: '1200px',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(10px)',
          p: 3,
          zIndex: 1,
        }}
      >
        {/* title and return button */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
            Defence Strategies
          </Typography>
        </Box>

        {/* system prompt strengthen card */}
        <Card 
          sx={{ 
            backgroundColor: 'rgba(30, 30, 45, 0.4)', 
            mb: 2, 
            borderRadius: 2,
            opacity: 0.6,
            cursor: 'not-allowed',
            position: 'relative',
          }}
        >
          {/* overlay to indicate feature is coming soon */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              bgcolor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              px: 1.5,
              py: 0.5,
              borderBottomLeftRadius: 8,
              borderTopRightRadius: 8,
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            Coming Soon
          </Box>
          <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2.5 }}>
            <Avatar 
              variant="rounded"
              sx={{ 
                width: 80, 
                height: 80, 
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                mr: 2.5
              }}
            >
              {/* can add icon */}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 500, opacity: 0.8 }}>
                System Prompt Hardening
              </Typography>
              <Typography variant="body2" sx={{ color: '#aaa', mt: 0.5, opacity: 0.8 }}>
                e.g. Prompt templating
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* python middle layer card */}
        <Card 
          sx={{ 
            backgroundColor: 'rgba(30, 30, 45, 0.6)', 
            borderRadius: 2,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'rgba(40, 40, 60, 0.8)',
              transform: 'translateY(-2px)',
              transition: 'all 0.2s ease-in-out',
            },
          }}
          onClick={() => navigate('/defence')}
        >
          <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2.5 }}>
            <Avatar 
              variant="rounded"
              sx={{ 
                width: 80, 
                height: 80, 
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                mr: 2.5
              }}
            >
              {/* can add icon */}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 500 }}>
                Middleware Plugin Deployment
              </Typography>
              <Typography variant="body2" sx={{ color: '#aaa', mt: 0.5 }}>
                Insert a Python middleware before the LLaMA call, and apply detection logic after the model responds.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
} 