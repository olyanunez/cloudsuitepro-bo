'use client';

import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ReactNode } from 'react';

// Creamos un tema personalizado con colores armónicos
const theme = createTheme({
  palette: {
    primary: {
      main: '#900C3F',
      light: '#C70039',
      dark: '#581845',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#C70039',
      light: '#FF5733',
      dark: '#900C3F',
      contrastText: '#ffffff',
    },
    success: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    error: {
      main: '#FF5733',
      light: '#FFC300',
      dark: '#C70039',
    },
    warning: {
      main: '#FFC300',
      light: '#FFE082',
      dark: '#FF8F00',
    },
    info: {
      main: '#581845',
      light: '#900C3F',
      dark: '#3B0B2E',
    },
    background: {
      default: '#FFF5F7',
      paper: '#ffffff',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#555555',
    },
  },
  typography: {
    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontWeight: 600,
      color: '#343a40',
    },
    h2: {
      fontWeight: 600,
      color: '#343a40',
    },
    h3: {
      fontWeight: 600,
      color: '#343a40',
    },
    h4: {
      fontWeight: 600,
      color: '#343a40',
    },
    h5: {
      fontWeight: 600,
      color: '#343a40',
    },
    h6: {
      fontWeight: 600,
      color: '#343a40',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#e9ecef',
        },
      },
    },
  },
});

// Componente proveedor de tema
export default function ThemeRegistry({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
