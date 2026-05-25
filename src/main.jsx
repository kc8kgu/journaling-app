import React, { Suspense, lazy, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Alert, Box, CircularProgress, CssBaseline, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ThemeContextProvider, useTheme } from './ThemeContext';
import { checkDBAvailable } from './db';

const ListView = lazy(() => import('./pages/ListView'));
const ReadView = lazy(() => import('./pages/ReadView'));
const WriteEditView = lazy(() => import('./pages/WriteEditView'));

function RouteFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <CircularProgress />
    </Box>
  );
}

function AppContent() {
  const { theme } = useTheme();
  const [dbAvailable, setDbAvailable] = useState(true);

  useEffect(() => {
    checkDBAvailable().then(setDbAvailable);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {!dbAvailable && (
          <Alert severity="warning" sx={{ borderRadius: 0 }}>
            Storage unavailable — your entries will not be saved. Try opening this app outside of private browsing mode.
          </Alert>
        )}
        <HashRouter>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<ListView />} />
              <Route path="/entry/new" element={<WriteEditView />} />
              <Route path="/entry/:id" element={<ReadView />} />
              <Route path="/entry/:id/edit" element={<WriteEditView />} />
            </Routes>
          </Suspense>
        </HashRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeContextProvider>
      <AppContent />
    </ThemeContextProvider>
  </React.StrictMode>
);
