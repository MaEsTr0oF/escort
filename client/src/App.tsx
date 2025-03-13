import React from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ContactAdminPage from './pages/ContactAdminPage';
import LoginPage from './pages/admin/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import CitiesPage from './pages/admin/CitiesPage';
import SettingsPage from './pages/admin/SettingsPage';
import ProfilesPage from './pages/admin/ProfilesPage';
import AdminLayout from './components/admin/AdminLayout';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff6b00',
      light: '#ff943d',
      dark: '#cc5500',
    },
    secondary: {
      main: '#29b6f6',
      light: '#73e8ff',
      dark: '#0086c3',
    },
    info: {
      main: '#00bcd4',
      light: '#62efff',
      dark: '#008ba3',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    success: {
      main: '#66bb6a',
      light: '#98ee99',
      dark: '#338a3e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
    h6: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Outlet />
    </ThemeProvider>
  );
};

export default App;
