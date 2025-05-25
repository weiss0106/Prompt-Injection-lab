import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import HomePage from './pages/HomePage';
import ModeSelectPage from './pages/ModeSelectPage';
import AttackPage from './pages/AttackPage';
import DefenceList from './pages/DefenceList';
import DefencePage from './pages/DefencePage';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#bb86fc' },
    background: {
      default: '#121212',
      paper: '#1f1f1f',
    },
    contrastThreshold: 4.5,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '4px',
        },
        '*::-webkit-scrollbar-thumb:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
        },
        '*::-webkit-scrollbar-corner': {
          backgroundColor: 'transparent',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.4)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.6)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#bb86fc',
            },
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/modes" element={<ModeSelectPage />} />
        <Route path="/attack/:challengeId" element={<AttackPage />} />
        <Route path="/defencelist" element={<DefenceList />} />
        <Route path="/defence" element={<DefencePage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
