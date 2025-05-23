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
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';

export default function AttackPage() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [challengeInfo, setChallengeInfo] = useState(null);
  const navigate = useNavigate();

  // 获取挑战信息
  useEffect(() => {
    async function fetchChallengeInfo() {
      try {
        const response = await fetch('http://localhost:8001/attacker/c1');
        if (response.ok) {
          const data = await response.json();
          setChallengeInfo(data);
        }
      } catch (err) {
        console.error('Error fetching challenge info:', err);
      }
    }
    
    fetchChallengeInfo();
  }, []);

  const handleAsk = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8001/attacker/c1/process', {
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
      setError('Failed to get response from the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    
    setSubmitting(true);
    setError('');
    
    // 这里检查答案是否正确
    // 在实际应用中，这应该是通过API调用后端进行验证
    // 这里为了简单，我们直接比较是否等于Hello_World
    const isCorrectAnswer = answer.trim() === 'Hello_World';
    setIsCorrect(isCorrectAnswer);
    
    if (isCorrectAnswer) {
      setCompleted(true);
    }
    
    // 显示对话框
    setDialogOpen(true);
    setSubmitting(false);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
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
            value={33}
            sx={{ mb: 1, height: 6, borderRadius: 3 }}
          />
          <Typography variant="h6" fontWeight={600}>
            {challengeInfo ? `${challengeInfo.name}: ${challengeInfo.description}` : "Challenge Level 1"}
          </Typography>
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
          {error && (
            <Typography 
              variant="caption" 
              sx={{ color: 'error.main', mt: 1, width: '100%' }}
            >
              {error}
            </Typography>
          )}
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
        {response && !completed && (
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
              }}
            >
              {submitting ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
            </Button>
          </Box>
        )}

        {/* 成功消息 */}
        {completed && (
          <Box 
            sx={{ 
              mt: 3, 
              p: 2, 
              borderRadius: 2, 
              backgroundColor: 'rgba(76, 175, 80, 0.1)', 
              border: '1px solid #4CAF50' 
            }}
          >
            <Typography color="#4CAF50" fontWeight={600}>
              Congratulations! You've successfully completed this challenge!
            </Typography>
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
            {isCorrect ? "Correct! 🎉" : "Incorrect ❌"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {isCorrect 
                ? "You've found the correct secret key! Challenge completed."
                : "That's not the correct secret key. Try a different prompt."}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} autoFocus>
              {isCorrect ? "Next Challenge" : "Try Again"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
