import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Box, CircularProgress, CssBaseline, ThemeProvider } from '@mui/material';
import { ThemeContextProvider, useTheme } from './ThemeContext';

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
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
