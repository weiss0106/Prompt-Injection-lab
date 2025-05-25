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
    // 从 public 目录加载动画文件
    fetch('./animations/cat.json')
      .then(response => response.json())
      .then(data => {
        setAnimationData(data);
        // 动画数据加载后，我们需要等待下一个渲染周期确保 lottieRef 已经设置
        setTimeout(() => {
          if (lottieRef.current?.animationItem) {
            lottieRef.current.animationItem.goToAndStop(24, true);
            startAutoRotation();
          }
        }, 100);
      })
      .catch(error => console.error('Error loading animation:', error));

    // 清理函数
    return () => {
      if (lottieRef.current?.animationItem) {
        lottieRef.current.animationItem.destroy();
      }
      if (autoRotateRef.current) {
        cancelAnimationFrame(autoRotateRef.current);
      }
    };
  }, []);  // 保持空依赖数组，但确保清理

  // 确保组件重新挂载时重新开始自动旋转
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

  // 在组件卸载时停止所有动画
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
        
        // 基础旋转速度（0.2倍速）
        const baseRotationSpeed = 0.2 * deltaTime / 16.67; // 16.67ms 是在 60fps 下的一帧时间
        
        // 结合鼠标接近效果的额外速度
        const mouseSpeedBoost = mouseProgressRef.current * 2; // 鼠标接近时最多增加2倍速
        
        // 计算下一帧
        let nextFrame = currentFrame + baseRotationSpeed * (1 + mouseSpeedBoost);
        
        // 自然循环：如果超过总帧数，减去总帧数继续从头播放
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
    
    // Get container dimensions and position
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate distance from mouse to container center
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Maximum distance to consider (in pixels)
    const maxDistance = 800;
    
    // Calculate progress based on distance (closer = higher progress)
    let progress = 1 - Math.min(distance / maxDistance, 1);
    progress = Math.pow(progress, 1.5); // 让过渡更平滑
    
    // 更新鼠标进度引用值
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
            In the attack part, your task is to make our AI assistant – Nicole reveal the secret password in each level. Then you will
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