import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
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
      {/* 背景装饰圆形 */}
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

      {/* 🧢 页面顶部标题部分 */}
      <Box sx={{ textAlign: 'center', mb: 8, zIndex: 1 }}>
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

      {/* 🧊 内容卡片部分（介绍 + 图片） */}
      <Box
        sx={{
          width: '100%',
          maxWidth: '1200px',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.04)',
          /*backdropFilter: 'blur(30px)',*/
          /*border: '2px solid rgba(10,13,23,0.05)',*/
          p: { xs: 4, md: 6 },
          zIndex: 1,
        }}
      >
        {/* 左文字 */}
        <Box sx={{ flex: 1, pr: { md: 4 }}}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            Lab: Prompt Injection
          </Typography>
          <Typography paragraph>
            In this lab, you will explore prompt injection through interactive tasks. It takes about 1~2 hours. Your task is divided
            into 2 parts – attack and defence.
          </Typography>
          <Typography paragraph>
            In the attack part, your task is to make our AI assistant – Jamie reveal the secret password in each level. Then you will
            look into the backstage and implement defence strategies to prevent your assistant from being attacked.
          </Typography>

          <Button
            variant="contained"
            sx={{
              mt: 2,
              background: 'linear-gradient(to right, #bb86fc, #9b59b6)',
              color: 'white',
              fontWeight: 'bold',
              px: 3,
              py: 1,
              borderRadius: '10px',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to right, #a07dfc, #8448b6)',
              },
            }}
            onClick={() => navigate('/modes')}
          >
            Let&apos;s start 🚀
          </Button>
        </Box>

        {/* 右图像 */}
        <Box
          sx={{
            flex: 1,
            width: '100%',
            height: { xs: '300px', md: '400px' },
            backgroundImage: 'url(/images/catkeyboard.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '16px',
            mt: { xs: 4, md: 0 },
          }}
        />
      </Box>
    </Box>
  );
}