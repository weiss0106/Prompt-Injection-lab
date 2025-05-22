import { Box, Typography, Button, Card, CardContent, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function ModeSelectPage() {
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
        margin: 0,
        boxSizing: 'border-box',
      }}
    >

      {/* 背景渐变圆形装饰 */}
      <Box sx={{ position: 'absolute', width: '30vw', height: '30vh', borderRadius: '50%', background: 'radial-gradient(circle,rgb(112, 2, 163), transparent)', top: '10%', left: '5%', filter: 'blur(70px)', zIndex: 0, opacity: 0.4 }} />
      <Box sx={{ position: 'absolute', width: '26vw', height: '20vh', borderRadius: '50%', background: 'radial-gradient(circle,rgb(69, 28, 157), transparent)', top: '10%', right: '10%', filter: 'blur(70px)', zIndex: 0, opacity: 0.3 }} />
      <Box sx={{ position: 'absolute', width: '30vw', height: '30vh', borderRadius: '50%', background: 'radial-gradient(circle,rgb(56, 20, 132), transparent)', bottom: '10%', right: '30%', filter: 'blur(70px)', zIndex: 0, opacity: 0.5 }} />

      {/* 标题部分 */}
      <Box sx={{ textAlign: 'center', mb: 6, zIndex: 1, position: 'relative', width: '100%', maxWidth: '1200px' }}>
        <IconButton
          onClick={() => navigate('/')}
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
          Welcome!
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#ccc', mt: 1 }}>
          This is a prompt injection lab
        </Typography>
      </Box>

      {/* 模式选择卡片区域 */}
      <Box sx={{ 
        width: '100%',
        maxWidth: '1200px',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 3, md: 2.5 },
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        px: { xs: 2, md: 4 }
      }}>
        {/* Attack Card */}
        <Card sx={{ 
          width: { xs: '100%', md: 'calc(50% - 10px)' },
          height: { xs: 'auto', md: '600px' },
          minHeight: { xs: '400px', md: '600px' },
          background: '#1C1C29',
          borderRadius: 4,
          p: 2,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <CardContent sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            pb: 2,
          }}>
            <Box>
              <Box sx={{ height: 460, background: '#3a3a4a', borderRadius: 2, mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>Attack Exercise</Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => navigate('/attack')}
              sx={{
                background: 'linear-gradient(to right, #bb86fc, #9b59b6)',
                textTransform: 'none',
                fontWeight: 'bold',
                borderRadius: 2,
                px: 3,
              }}
            >
              Continue
            </Button>
          </CardContent>
        </Card>

        {/* Defence Card */}
        <Card sx={{ 
          width: { xs: '100%', md: 'calc(50% - 10px)' },
          height: { xs: 'auto', md: '600px' },
          minHeight: { xs: '400px', md: '600px' },
          background: '#1C1C29',
          borderRadius: 4,
          p: 2,
          textAlign: 'center',
          opacity: 0.5,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <CardContent sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <Box>
              <Box sx={{ height: 460, background: '#3a3a4a', borderRadius: 2, mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>Defence Exercise</Typography>
            </Box>
            <Box>
              <Button
                variant="contained"
                disabled
                sx={{
                  background: 'linear-gradient(to right, #3a3a3a, #2a2a2a)',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  px: 3,
                }}
              >
                Locked
              </Button>
              <Typography variant="caption" sx={{ color: '#aaa', mt: 1, display: 'block' }}>
                Finish the attack exercise to unlock this
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
