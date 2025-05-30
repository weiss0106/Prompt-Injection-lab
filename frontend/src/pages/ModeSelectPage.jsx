import { Box, Typography, Button, Card, CardContent, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Lottie from 'lottie-react';

export default function ModeSelectPage() {
  const navigate = useNavigate();
  const [userScore, setUserScore] = useState({ attacker_score: 0, defender_score: 0 });
  const [attackAnimation, setAttackAnimation] = useState(null);
  const [defenceAnimation, setDefenceAnimation] = useState(null);
  const attackLottieRef = useRef(null);
  const defenceLottieRef = useRef(null);
  const isDefenceUnlocked = userScore.attacker_score >= 3;
  const [hasActiveDefense, setHasActiveDefense] = useState(false);

  // get user score
  useEffect(() => {
    async function fetchUserScore() {
      try {
        const response = await fetch('http://localhost:8001/attacker/score');
        if (response.ok) {
          const data = await response.json();
          setUserScore(data);
        }
      } catch (err) {
        console.error('Error fetching user score:', err);
      }
    }
    
    fetchUserScore();
  }, []);

  // check defense plugin status
  useEffect(() => {
    async function checkDefensePlugins() {
      try {
        const response = await fetch('http://localhost:8001/defender/defenses');
        if (response.ok) {
          const plugins = await response.json();
          setHasActiveDefense(plugins.some(plugin => plugin.info.is_active));
        }
      } catch (err) {
        console.error('Error checking defense plugins:', err);
      }
    }
    
    checkDefensePlugins();
  }, []);

  // load animation files
  useEffect(() => {
    // load attack animation
    fetch('./animations/attack.json')
      .then(response => response.json())
      .then(data => {
        setAttackAnimation(data);
        // set random starting frame
        setTimeout(() => {
          if (attackLottieRef.current?.animationItem) {
            const totalFrames = attackLottieRef.current.animationItem.totalFrames;
            const randomFrame = Math.floor(Math.random() * totalFrames);
            attackLottieRef.current.animationItem.goToAndPlay(randomFrame, true);
          }
        }, 100);
      })
      .catch(error => console.error('Error loading attack animation:', error));

    // load defence animation
    fetch('./animations/defence.json')
      .then(response => response.json())
      .then(data => {
        setDefenceAnimation(data);
        // set animation based on unlock status
        setTimeout(() => {
          if (defenceLottieRef.current?.animationItem) {
            if (isDefenceUnlocked) {
              const totalFrames = defenceLottieRef.current.animationItem.totalFrames;
              const randomFrame = Math.floor(Math.random() * totalFrames);
              defenceLottieRef.current.animationItem.goToAndPlay(randomFrame, true);
            } else {
              defenceLottieRef.current.animationItem.goToAndStop(0, true);
            }
          }
        }, 100);
      })
      .catch(error => console.error('Error loading defence animation:', error));
  }, [isDefenceUnlocked]);

  // listen to unlock status change
  useEffect(() => {
    if (defenceLottieRef.current?.animationItem) {
      if (isDefenceUnlocked) {
        const totalFrames = defenceLottieRef.current.animationItem.totalFrames;
        const randomFrame = Math.floor(Math.random() * totalFrames);
        defenceLottieRef.current.animationItem.goToAndPlay(randomFrame, true);
      } else {
        defenceLottieRef.current.animationItem.goToAndStop(0, true);
      }
    }
  }, [isDefenceUnlocked]);

  const handleAttackContinue = async () => {
    try {
      console.log('Starting handleAttackContinue...');
      
      // get all challenges and scores
      const challengesResponse = await fetch('http://localhost:8001/attacker/');
      const scoreResponse = await fetch('http://localhost:8001/attacker/score');
      const defenseResponse = await fetch('http://localhost:8001/defender/defenses');
      
      if (challengesResponse.ok && scoreResponse.ok && defenseResponse.ok) {
        const challengesData = await challengesResponse.json();
        const scoreData = await scoreResponse.json();
        const defensePlugins = await defenseResponse.json();
        
        // check if the first three challenges are completed
        const hasCompletedIndirect = scoreData.attacker_score >= 3;
        
        // find the first uncompleted challenge based on score
        const firstUncompletedChallenge = challengesData.find((challenge, index) => {
          // if current score is less than or equal to the index of the current challenge, this challenge is not completed
          return index >= scoreData.attacker_score;
        });

        if (firstUncompletedChallenge) {
          // if there is an uncompleted challenge, enter the challenge
          navigate(`/attack/${firstUncompletedChallenge.id}`);
        } else if (hasCompletedIndirect) {
          // if the first three challenges are completed, enter the final challenge
          navigate('/attack/final');
        }
      }
    } catch (err) {
      console.error('Error in handleAttackContinue:', err);
    }
  };

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

      {/* background gradient circle decoration */}
      <Box sx={{ position: 'absolute', width: '30vw', height: '30vh', borderRadius: '50%', background: 'radial-gradient(circle,rgb(112, 2, 163), transparent)', top: '10%', left: '5%', filter: 'blur(70px)', zIndex: 0, opacity: 0.4 }} />
      <Box sx={{ position: 'absolute', width: '26vw', height: '20vh', borderRadius: '50%', background: 'radial-gradient(circle,rgb(69, 28, 157), transparent)', top: '10%', right: '10%', filter: 'blur(70px)', zIndex: 0, opacity: 0.3 }} />
      <Box sx={{ position: 'absolute', width: '30vw', height: '30vh', borderRadius: '50%', background: 'radial-gradient(circle,rgb(56, 20, 132), transparent)', bottom: '10%', right: '30%', filter: 'blur(70px)', zIndex: 0, opacity: 0.5 }} />

      {/* title section */}
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
          Choose Your Role
        </Typography>
      </Box>

      {/* mode selection card area */}
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
          p: 3,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <CardContent sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%'
          }}>
            <Box>
              <Box sx={{ 
                height: '380px', 
                borderRadius: 2, 
                mb: 2,
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {attackAnimation ? (
                  <Lottie
                    lottieRef={attackLottieRef}
                    animationData={attackAnimation}
                    loop={true}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <Box sx={{ color: '#fff' }}>Loading animation...</Box>
                )}
              </Box>
              <Typography variant="h6" sx={{ color: '#fff', mb: 4, fontWeight: 600 }}>
                Attack 
                <Typography 
                  component="span" 
                  sx={{ 
                    color: '#bb86fc',
                    fontSize: '0.9rem',
                    ml: 1,
                    opacity: 0.9
                  }}
                >
                  ({userScore.attacker_score}/4 completed)
                </Typography>
              </Typography>
            </Box>
            <Box>
              <Button
                variant="contained"
                onClick={handleAttackContinue}
                sx={{
                  background: 'linear-gradient(to right, #bb86fc, #9b59b6)',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  px: 3,
                  width: '100%',
                  mb: 2,
                  position: 'relative',
                  '&:hover': {
                    background: 'linear-gradient(to right, #c996ff, #a969c9)',
                    boxShadow: '0 4px 8px rgba(187, 134, 252, 0.3)',
                  },
                }}
              >
                Continue
                {hasActiveDefense && userScore.attacker_score >= 3 && userScore.attacker_score < 4 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      background: 'linear-gradient(45deg, #ff4081, #f50057)',
                      borderRadius: '12px',
                      px: 1,
                      py: 0.25,
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      color: '#fff',
                      boxShadow: '0 2px 4px rgba(255, 64, 129, 0.3)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    NEW
                  </Box>
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Defence Card */}
        <Card sx={{ 
          width: { xs: '100%', md: 'calc(50% - 10px)' },
          height: { xs: 'auto', md: '600px' },
          minHeight: { xs: '400px', md: '600px' },
          background: '#1C1C29',
          borderRadius: 4,
          p: 3,
          textAlign: 'center',
          opacity: isDefenceUnlocked ? 1 : 0.7,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <CardContent sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%'
          }}>
            <Box>
              <Box sx={{ 
                height: '380px', 
                borderRadius: 2, 
                mb: 2,
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                filter: isDefenceUnlocked ? 'none' : 'grayscale(50%)'
              }}>
                {defenceAnimation ? (
                  <Lottie
                    lottieRef={defenceLottieRef}
                    animationData={defenceAnimation}
                    loop={isDefenceUnlocked}
                    autoplay={isDefenceUnlocked}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <Box sx={{ color: '#fff' }}>Loading animation...</Box>
                )}
              </Box>
              <Typography variant="h6" sx={{ color: '#fff', mb: 4, fontWeight: 600 }}>Defense</Typography>
            </Box>
            <Box>
              <Button
                variant="contained"
                disabled={!isDefenceUnlocked}
                onClick={isDefenceUnlocked ? () => navigate('/defencelist') : undefined}
                sx={{
                  background: isDefenceUnlocked 
                    ? 'linear-gradient(to right, #bb86fc, #9b59b6)' 
                    : 'linear-gradient(to right, #3a3a3a, #2a2a2a)',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  px: 3,
                  width: '100%',
                  mb: 2,
                  '&:hover': isDefenceUnlocked ? {
                    background: 'linear-gradient(to right, #c996ff, #a969c9)',
                    boxShadow: '0 4px 8px rgba(187, 134, 252, 0.3)',
                  } : {},
                }}
              >
                {isDefenceUnlocked ? "Start" : "Locked"}
              </Button>
              {!isDefenceUnlocked && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#aaa',
                    display: 'block',
                    opacity: 1
                  }}
                >
                  Finish the first 3 attack exercises to unlock this.
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
