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
  DialogActions,
  Tooltip,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';

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
  const [uploadedFile, setUploadedFile] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [defensePlugins, setDefensePlugins] = useState([]);
  const navigate = useNavigate();
  const { challengeId = 'c1' } = useParams(); // 从URL获取挑战ID，默认为c1

  // define allowed file types
  const ALLOWED_FILE_TYPES = {
    '.txt': 'Text file',
    '.md': 'Markdown',
    '.json': 'JSON file',
    '.yaml': 'YAML file',
    '.yml': 'YAML file',
    '.ini': 'INI file',
    '.csv': 'CSV file',
  };
  
  // check if file type is allowed
  const isFileTypeAllowed = (file) => {
    const fileName = file.name.toLowerCase();
    return Object.keys(ALLOWED_FILE_TYPES).some(ext => fileName.endsWith(ext));
  };

  // get all challenges and user score information
  useEffect(() => {
    async function fetchChallengesAndScore() {
      try {
        // get all challenges
        const challengesResponse = await fetch('http://localhost:8001/attacker/');
        if (challengesResponse.ok) {
          const challengesData = await challengesResponse.json();
          setAllChallenges(challengesData);
        }
        
        // get user score
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

  // get challenge information
  useEffect(() => {
    async function fetchChallengeInfo() {
      try {
        const response = await fetch(`http://localhost:8001/attacker/${challengeId}`);
        if (response.ok) {
          const data = await response.json();
          setChallengeInfo(data);
          // reset all dialog states
          setQuestion('');
          setResponse('');
          setAnswer('');
          setCompleted(false);
          setShouldHideAnswerUI(false);
        }
      } catch (err) {
        console.error('Error fetching challenge info:', err);
      }
    }
    
    fetchChallengeInfo();
  }, [challengeId]);

  // get defense plugin information
  useEffect(() => {
    async function fetchDefensePlugins() {
      try {
        const response = await fetch('http://localhost:8001/defender/defenses');
        if (response.ok) {
          const plugins = await response.json();
          setDefensePlugins(plugins);
        }
      } catch (err) {
        console.error('Error fetching defense plugins:', err);
      }
    }
    
    fetchDefensePlugins();
  }, []);

  // check if defense plugin is activated
  useEffect(() => {
    async function checkDefensePlugins() {
      if (challengeId === 'final') {
        try {
          const response = await fetch('http://localhost:8001/defender/defenses');
          if (response.ok) {
            const plugins = await response.json();
            const hasActiveDefense = plugins.some(plugin => plugin.info.is_active);
            setShouldHideAnswerUI(!hasActiveDefense);
          }
        } catch (error) {
          console.error('Error checking defense plugins:', error);
        }
      }
    }

    checkDefensePlugins();
  }, [challengeId]);

  // calculate progress percentage
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
      
      // no longer automatically set completion status
      // subsequent judgment is done after the user submits the answer
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
      
      // set correct or incorrect based on response status
      if (response.ok) {
        const data = await response.json();
        setIsCorrect(true);
        setCompleted(true);
        
        // re-get user score to update progress bar
        const scoreResponse = await fetch('http://localhost:8001/attacker/score');
        if (scoreResponse.ok) {
          const scoreData = await scoreResponse.json();
          setUserScore(scoreData);
        }
      } else {
        // set to incorrect if validation fails
        setIsCorrect(false);
      }
      
      // display dialog box regardless of success or failure
      setDialogOpen(true);
    } catch (err) {
      // handle network errors and other technical issues
      console.error('Error validating answer:', err);
      // mark as technical error
      setIsTechnicalError(true);
      setDialogOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    
    // if answer is correct and challenge is completed, navigate to next challenge or return to list
    if (isCorrect && completed) {
      // hide answer UI
      setShouldHideAnswerUI(true);
      
      // if final challenge, directly return to modes page
      if (challengeId === 'final') {
        navigate('/modes');
        return;
      }
      
      // find the position of the current challenge in the list
      const currentIndex = allChallenges.findIndex(c => c.id === challengeId);
      
      // if current is indirect challenge and has next challenge
      if (challengeId === 'indirect' && currentIndex >= 0 && currentIndex < allChallenges.length - 1) {
        // check if there is an activated defense plugin
        const hasActiveDefense = defensePlugins.some(plugin => plugin.info.is_active);
        
        if (hasActiveDefense) {
          // if there is an activated defense plugin, enter final challenge
          navigate('/attack/final');
        } else {
          // if there is no activated defense plugin, jump
          navigate('/modes');
          // display prompt message
          setSnackbar({
            open: true,
            message: 'Please activate at least one defense plugin before proceeding to the final challenge',
            severity: 'info'
          });
        }
      } else if (currentIndex >= 0 && currentIndex < allChallenges.length - 1) {
        // other challenges enter next
        const nextChallenge = allChallenges[currentIndex + 1];
        navigate(`/attack/${nextChallenge.id}`);
      } else {
        // if last challenge, return to challenge list
        navigate('/modes');
      }
    }
  };

  const handleFileUpload = async (file) => {
    if (!isFileTypeAllowed(file)) {
      setSnackbar({
        open: true,
        message: 'Unsupported file type. Please upload a text file.',
        severity: 'error'
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`http://localhost:8001/attacker/${challengeId}/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        setUploadedFile(file);
        setSnackbar({
          open: true,
          message: 'File uploaded successfully',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to upload file',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setSnackbar({
        open: true,
        message: 'Error uploading file',
        severity: 'error'
      });
    }
  };

  const handleDeleteFile = () => {
    setUploadedFile(null);
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
          Guess The Password!
        </Typography>
      </Box>

      {/* main card */}
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
        {shouldHideAnswerUI ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
              Final Challenge Locked
            </Typography>
            <Typography sx={{ color: '#aaa', mb: 3 }}>
              You need to deploy at least one defense plugin before attempting the final challenge.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/defencelist')}
              sx={{
                background: 'linear-gradient(to right, #bb86fc, #9b59b6)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(to right, #c996ff, #a969c9)',
                },
              }}
            >
              Go to Defense Page
            </Button>
          </Box>
        ) : (
          <>
            <Box mb={2}>
              <Tooltip 
                title={`Progress: ${userScore.attacker_score} / ${allChallenges.length} challenges`}
                arrow
                placement="top"
              >
                <LinearProgress
                  variant="determinate"
                  value={calculateProgress()}
                  sx={{ mb: 2, height: 6, borderRadius: 3 }}
                />
              </Tooltip>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 5 }}>
                <Typography variant="h6" fontWeight={600}>
                  {challengeInfo ? challengeInfo.name : "Challenge"}
                </Typography>
                <Typography variant="body2" sx={{ color: '#aaa' }}>
                  {challengeInfo ? "Your goal: " + challengeInfo.description : "Prompt Injection"}
                </Typography>
              </Box>
            </Box>

            {/* virtual character avatar and input */}
            <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
              <Avatar
                src="/images/avatar.png"
                sx={{ width: 60, height: 60, mb: 1 }}
              />
              <Typography variant="body1" sx={{ mb: 2 }}>
                {challengeInfo?.type === "indirect_injection" 
                  ? "Please upload a file and ask me questions about it"
                  : challengeInfo?.type === "final_challenge"
                    ? "I'm equipped with enhanced defenses. Can you defeat me?"
                    : "Hej, I'm Nicole, ask me a question:"}
              </Typography>

              {/* file upload section - only show in indirect_injection challenge */}
              {challengeInfo?.type === "indirect_injection" && (
                <Box 
                  sx={{ 
                    width: '100%', 
                    mb: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <Box
                    component={uploadedFile ? 'div' : 'label'}
                    sx={{
                      width: '100%',
                      minHeight: '78px',
                      border: uploadedFile ? '2px solid rgba(187, 134, 252, 0.5)' : '2px dashed rgba(187, 134, 252, 0.3)',
                      borderRadius: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 2,
                      cursor: uploadedFile ? 'default' : 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: uploadedFile ? 'rgba(187, 134, 252, 0.05)' : 'rgba(187, 134, 252, 0.03)',
                      '&:hover': uploadedFile ? {} : {
                        borderColor: 'rgba(187, 134, 252, 0.5)',
                        backgroundColor: 'rgba(187, 134, 252, 0.05)'
                      }
                    }}
                    onDragOver={(e) => {
                      if (uploadedFile) return;
                      e.preventDefault();
                      e.currentTarget.style.borderColor = 'rgba(187, 134, 252, 0.8)';
                      e.currentTarget.style.backgroundColor = 'rgba(187, 134, 252, 0.08)';
                    }}
                    onDragLeave={(e) => {
                      if (uploadedFile) return;
                      e.preventDefault();
                      e.currentTarget.style.borderColor = 'rgba(187, 134, 252, 0.3)';
                      e.currentTarget.style.backgroundColor = 'rgba(187, 134, 252, 0.03)';
                    }}
                    onDrop={(e) => {
                      if (uploadedFile) return;
                      e.preventDefault();
                      e.currentTarget.style.borderColor = 'rgba(187, 134, 252, 0.3)';
                      e.currentTarget.style.backgroundColor = 'rgba(187, 134, 252, 0.03)';
                      
                      const file = e.dataTransfer.files[0];
                      if (file) {
                        handleFileUpload(file);
                      }
                    }}
                  >
                    {uploadedFile ? (
                      <Chip
                        icon={<AttachFileIcon />}
                        label={uploadedFile.name}
                        onDelete={(e) => {
                          e.stopPropagation();
                          handleDeleteFile();
                        }}
                        deleteIcon={<CloseIcon />}
                        variant="outlined"
                        sx={{
                          borderColor: 'rgba(187, 134, 252, 0.5)',
                          color: '#bb86fc',
                          '& .MuiChip-icon': {
                            color: '#bb86fc'
                          },
                          '& .MuiChip-deleteIcon': {
                            color: '#bb86fc',
                            '&:hover': {
                              color: '#c996ff'
                            }
                          }
                        }}
                      />
                    ) : (
                      <>
                        <Typography sx={{ color: '#bb86fc', textAlign: 'center' }}>
                          <Box component="span" sx={{ 
                            textDecoration: 'underline', 
                            color: '#c996ff',
                            fontWeight: 500
                          }}>Choose</Box> a file or drag & drop it here
                        </Typography>
                        <Typography sx={{ 
                          color: '#bb86fc80', 
                          fontSize: '0.75rem', 
                          mt: 0.5, 
                          textAlign: 'center' 
                        }}>
                          Supported formats: {Object.entries(ALLOWED_FILE_TYPES).map(([ext, desc], index, arr) => (
                            <span key={ext}>
                              {ext}{index < arr.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </Typography>
                        <input
                          type="file"
                          hidden
                          accept={Object.keys(ALLOWED_FILE_TYPES).join(',')}
                          onChange={async (e) => {
                            if (e.target.files?.[0]) {
                              handleFileUpload(e.target.files[0]);
                            }
                          }}
                        />
                      </>
                    )}
                  </Box>
                </Box>
              )}

              <TextField
                fullWidth
                multiline
                minRows={2}
                maxRows={8}
                variant="outlined"
                placeholder={challengeInfo?.type === "indirect_injection" 
                  ? "Type your question, e.g. Can you write a conclusion for the uploaded file?"
                  : "Type your question"}
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
            </Box>

            {/* response message bubble */}
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

            {/* answer submission */}
            {response && (
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
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
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
          </>
        )}

        {/* result dialog */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {isTechnicalError ? "Technical Error" : isCorrect ? (challengeId === 'final' ? "Congratulations! 🎉" : "Correct! 🎉") : "Incorrect ❌"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {isTechnicalError 
                ? "Something went wrong. Please try again later."
                : isCorrect 
                  ? (challengeId === 'final'
                    ? "You've found all the secret keys! Great work!"
                    : "You've found the correct secret key! Challenge completed.")
                  : "That's not the correct secret key. Try a different prompt."}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} autoFocus>
              {isTechnicalError 
                ? "OK" 
                : isCorrect 
                  ? (challengeId === 'final'
                    ? "Finish"
                    : "Next Challenge") 
                  : "Try Again"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for upload notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
