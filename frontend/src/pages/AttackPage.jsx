import {
  Box,
  Typography,
  TextField,
  Button,
  LinearProgress,
  Avatar,
  Paper,
  IconButton,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';

export default function AttackPage() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isTechnicalError, setIsTechnicalError] = useState(false);
  const [challengeInfo, setChallengeInfo] = useState(null);
  const [allChallenges, setAllChallenges] = useState([]);
  const [userScore, setUserScore] = useState({ attacker_score: 0, defender_score: 0 });
  const [shouldHideAnswerUI, setShouldHideAnswerUI] = useState(false);
  const navigate = useNavigate();
  const { challengeId = 'c1' } = useParams(); // 从URL获取挑战ID，默认为c1

  // 获取所有挑战以及用户分数信息
  useEffect(() => {
    async function fetchChallengesAndScore() {
      try {
        // 获取所有挑战
        const challengesResponse = await fetch('http://localhost:8001/attacker/');
        if (challengesResponse.ok) {
          const challengesData = await challengesResponse.json();
          setAllChallenges(challengesData);
        }
        
        // 获取用户分数
        const scoreResponse = await fetch('http://localhost:8001/attacker/score');
        if (scoreResponse.ok) {
          const scoreData = await scoreResponse.json();
          setUserScore(scoreData);
        }
      } catch (err) {
        console.error('Error fetching challenges and score:', err);
      }
    }
    
    fetchChallengesAndScore();
  }, []);

  // 获取挑战信息
  useEffect(() => {
    async function fetchChallengeInfo() {
      try {
        const response = await fetch(`http://localhost:8001/attacker/${challengeId}`);
        if (response.ok) {
          const data = await response.json();
          setChallengeInfo(data);
        }
      } catch (err) {
        console.error('Error fetching challenge info:', err);
      }
    }
    
    fetchChallengeInfo();
  }, [challengeId]);

  // 计算进度百分比
  const calculateProgress = () => {
    if (allChallenges.length === 0) return 0;
    return (userScore.attacker_score / allChallenges.length) * 100;
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`http://localhost:8001/attacker/${challengeId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: question
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setResponse(data.response);
      
      // 不再自动设置完成状态
      // 后续由用户提交答案后判断
    } catch (err) {
      console.error('Error calling API:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    
    setSubmitting(true);
    setIsTechnicalError(false);
    
    try {
      // Call the backend API to validate the answer
      const response = await fetch(`http://localhost:8001/attacker/${challengeId}/validate_key?key=${encodeURIComponent(answer.trim())}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // 根据响应状态设置正确或错误
      if (response.ok) {
        const data = await response.json();
        setIsCorrect(true);
        setCompleted(true);
        
        // 重新获取用户分数以更新进度条
        const scoreResponse = await fetch('http://localhost:8001/attacker/score');
        if (scoreResponse.ok) {
          const scoreData = await scoreResponse.json();
          setUserScore(scoreData);
        }
      } else {
        // 验证失败设置为不正确
        setIsCorrect(false);
      }
      
      // 无论成功还是失败都显示对话框
      setDialogOpen(true);
    } catch (err) {
      // 处理网络错误等技术问题
      console.error('Error validating answer:', err);
      // 标记为技术错误
      setIsTechnicalError(true);
      setDialogOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    
    // 如果回答正确且完成挑战，导航到下一个挑战或返回列表
    if (isCorrect && completed) {
      // 隐藏回答UI
      setShouldHideAnswerUI(true);
      
      // 找出当前挑战在列表中的位置
      const currentIndex = allChallenges.findIndex(c => c.id === challengeId);
      
      // 如果有下一个挑战，则导航到下一个挑战
      if (currentIndex >= 0 && currentIndex < allChallenges.length - 1) {
        const nextChallenge = allChallenges[currentIndex + 1];
        navigate(`/attack/${nextChallenge.id}`);
      } else {
        // 如果是最后一个挑战，返回到挑战列表
        navigate('/modes');
      }
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
      {/* 背景渐变圆形装饰 */}
      <Box sx={{ position: 'absolute', width: '30vw', height: '30vh', borderRadius: '50%', background: 'radial-gradient(circle,rgb(112, 2, 163), transparent)', top: '10%', left: '5%', filter: 'blur(70px)', zIndex: 0, opacity: 0.4 }} />
      <Box sx={{ position: 'absolute', width: '26vw', height: '20vh', borderRadius: '50%', background: 'radial-gradient(circle,rgb(69, 28, 157), transparent)', top: '10%', right: '10%', filter: 'blur(70px)', zIndex: 0, opacity: 0.3 }} />
      <Box sx={{ position: 'absolute', width: '30vw', height: '30vh', borderRadius: '50%', background: 'radial-gradient(circle,rgb(56, 20, 132), transparent)', bottom: '10%', right: '30%', filter: 'blur(70px)', zIndex: 0, opacity: 0.5 }} />

      {/* 标题部分 */}
      <Box sx={{ textAlign: 'center', mb: 6, zIndex: 1, position: 'relative', width: '100%', maxWidth: '1200px' }}>
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
          variant="h2"
          sx={{
            fontWeight: 900,
            background: 'linear-gradient(90deg, #ffffff 0%,rgb(235, 226, 255) 30%, #763AF5 80%, #A604F2 110%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '2.5rem', md: '4.5rem' },
          }}
        >
          Guess the password!
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#ccc', mt: 1 }}>
          This is a prompt injection lab
        </Typography>
      </Box>

      {/* 🧩 主卡片 */}
      <Box
        sx={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '20px',
          p: 4,
          width: '100%',
          maxWidth: '700px',
          zIndex: 1,
        }}
      >
        <Box mb={2}>
          <LinearProgress
            variant="determinate"
            value={calculateProgress()}
            sx={{ mb: 1, height: 6, borderRadius: 3 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              {challengeInfo ? `${challengeInfo.name}: ${challengeInfo.description}` : "Challenge Level 1"}
            </Typography>
            <Typography variant="body2" sx={{ color: '#aaa' }}>
              Progress: {userScore.attacker_score} / {allChallenges.length} challenges
            </Typography>
          </Box>
        </Box>

        {/* 👩‍🚀 虚拟角色头像与输入 */}
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          <Avatar
            src="/images/avatar.png"
            sx={{ width: 60, height: 60, mb: 1 }}
          />
          <Typography variant="body1" sx={{ mb: 2 }}>
            Hej, I'm Nicole, ask me a question:
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={2}
            maxRows={8}
            variant="outlined"
            placeholder="Type your question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (question.trim()) {
                  handleAsk();
                }
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ alignSelf: 'flex-end', pb: 1, pr: 0.5 }}>
                  <IconButton
                    edge="end"
                    color="primary"
                    onClick={handleAsk}
                    disabled={!question.trim() || loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      <SendIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', mt: 1 }}>
            <Typography
              variant="caption"
              sx={{ fontSize: '0.75rem', color: '#aaa' }}
            >
              Your message will be saved for progress tracking.
            </Typography>
          </Box>
        </Box>

        {/* 🤖 回复消息气泡 */}
        {response && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              mt: 3,
              gap: 1.5,
            }}
          >
            <Avatar
              src="/images/avatar.png"
              sx={{ width: 45, height: 45 }}
            />
            <Box
              sx={{
                background: 'linear-gradient(to right, #e0cfef, #c9b3e8)',
                color: '#26193c',
                borderRadius: '18px',
                px: 3,
                py: 2,
                width: 'fit-content',
                maxWidth: '100%',
                position: 'relative',
              }}
            >
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 500,
                  maxHeight: '120px',
                  overflow: 'auto'
                }}
              >
                {response}
              </Typography>
            </Box>
          </Box>
        )}

        {/* 🔐 答案提交 */}
        {response && !shouldHideAnswerUI && (
          <Box display="flex" mt={3} gap={2}>
            <TextField
              fullWidth
              multiline
              rows={1}
              variant="outlined"
              placeholder="Enter the secret key here"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                // 阻止回车键默认行为并提交
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault(); // 阻止默认行为（换行）
                  if (answer.trim()) {
                    handleSubmitAnswer();
                  }
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" sx={{ alignSelf: 'flex-end', pb: 1, pr: 0.5 }}>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="contained"
              onClick={handleSubmitAnswer}
              disabled={!answer.trim() || submitting}
              sx={{
                background: 'linear-gradient(to right, #bb86fc, #a647f5)',
                px: 3,
                fontWeight: 'bold',
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(to right, #c996ff, #b057ff)',
                  boxShadow: '0 4px 8px rgba(187, 134, 252, 0.3)',
                },
              }}
            >
              {submitting ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
            </Button>
          </Box>
        )}

        {/* 结果对话框 */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {isTechnicalError ? "Technical Error" : isCorrect ? "Correct! 🎉" : "Incorrect ❌"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {isTechnicalError 
                ? "Something went wrong. Please try again later."
                : isCorrect 
                  ? "You've found the correct secret key! Challenge completed."
                  : "That's not the correct secret key. Try a different prompt."}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} autoFocus>
              {isTechnicalError 
                ? "OK" 
                : isCorrect 
                  ? "Next Challenge" 
                  : "Try Again"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
