import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Lottie, { useLottie } from 'lottie-react';
import { useState, useEffect, useRef } from 'react';

export default function HomePage() {
  const navigate = useNavigate();
  const [animationData, setAnimationData] = useState(null);
  const containerRef = useRef(null);
  const lottieRef = useRef(null);
  const autoRotateRef = useRef(0);
  const lastTimeRef = useRef(0);
  const mouseProgressRef = useRef(0);

  useEffect(() => {
    // load animation from public directory
    fetch('./animations/cat.json')
      .then(response => response.json())
      .then(data => {
        setAnimationData(data);
        // after animation data is loaded, we need to wait for the next render cycle to ensure lottieRef is set
        setTimeout(() => {
          if (lottieRef.current?.animationItem) {
            lottieRef.current.animationItem.goToAndStop(24, true);
            startAutoRotation();
          }
        }, 100);
      })
      .catch(error => console.error('Error loading animation:', error));

    // cleanup function
    return () => {
      if (lottieRef.current?.animationItem) {
        lottieRef.current.animationItem.destroy();
      }
      if (autoRotateRef.current) {
        cancelAnimationFrame(autoRotateRef.current);
      }
    };
  }, []);  // keep empty dependency array, but ensure cleanup

  // ensure component remounts and starts auto-rotation
  useEffect(() => {
    if (animationData && lottieRef.current?.animationItem) {
      startAutoRotation();
    }
    return () => {
      if (autoRotateRef.current) {
        cancelAnimationFrame(autoRotateRef.current);
      }
    };
  }, [animationData]);

  // stop all animations when component unmounts
  useEffect(() => {
    return () => {
      if (lottieRef.current?.animationItem) {
        lottieRef.current.animationItem.stop();
      }
      if (autoRotateRef.current) {
        cancelAnimationFrame(autoRotateRef.current);
      }
    };
  }, []);

  const startAutoRotation = () => {
    const animate = (currentTime) => {
      if (!lastTimeRef.current) lastTimeRef.current = currentTime;
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      if (lottieRef.current?.animationItem) {
        const totalFrames = lottieRef.current.animationItem.totalFrames;
        const currentFrame = lottieRef.current.animationItem.currentFrame;
        
        // base rotation speed (0.2x speed)
        const baseRotationSpeed = 0.2 * deltaTime / 16.67; // 16.67ms is the time for one frame in 60fps
        
        // additional speed based on mouse proximity
        const mouseSpeedBoost = mouseProgressRef.current * 2; // 鼠标接近时最多增加2倍速
        
        // calculate next frame
        let nextFrame = currentFrame + baseRotationSpeed * (1 + mouseSpeedBoost);
        
        // natural loop: if exceeds total frames, subtract total frames and continue from the beginning
        if (nextFrame >= totalFrames) {
          nextFrame = nextFrame - totalFrames;
        }
        
        lottieRef.current.animationItem.goToAndStop(nextFrame, true);
      }
      
      autoRotateRef.current = requestAnimationFrame(animate);
    };
    
    autoRotateRef.current = requestAnimationFrame(animate);
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current || !lottieRef.current) return;

    const container = containerRef.current;
    
    // get container dimensions and position
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // calculate distance from mouse to container center
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // maximum distance to consider (in pixels)
    const maxDistance = 800;
    
    // calculate progress based on distance (closer = higher progress)
    let progress = 1 - Math.min(distance / maxDistance, 1);
    progress = Math.pow(progress, 1.5); // make transition smoother
    
    // update mouse progress reference value
    mouseProgressRef.current = progress;
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
      onMouseMove={handleMouseMove}
    >
      {/* background decorative circle */}
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

      {/* 🧢 page top title */}
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
      </Box>

      {/* 🧊 content card (introduction + image) */}
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
        {/* left text */}
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
            into 2 parts – attack and defense.
          </Typography>
          <Typography paragraph>
            In the attack part, your task is to make our AI assistant – Nicole reveal the secret password in each level. Then you will
            look into the backstage and implement defense strategies to prevent your assistant from being attacked.
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

        {/* right image */}
        <Box
          ref={containerRef}
          sx={{
            flex: 1,
            width: '100%',
            height: { xs: '300px', md: '400px' },
            borderRadius: '16px',
            mt: { xs: 4, md: 0 },
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {animationData ? (
            <Lottie
              key={Date.now()}
              lottieRef={lottieRef}
              animationData={animationData}
              loop={false}
              autoplay={false}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <Box sx={{ color: '#fff' }}>Loading animation...</Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}