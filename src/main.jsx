import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ThemeContextProvider, useTheme } from './ThemeContext';
import ListView from './pages/ListView';
import ReadView from './pages/ReadView';
import WriteEditView from './pages/WriteEditView';

function AppContent() {
  const { theme } = useTheme();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <HashRouter>
          <Routes>
            <Route path="/" element={<ListView />} />
            <Route path="/entry/new" element={<WriteEditView />} />
            <Route path="/entry/:id" element={<ReadView />} />
            <Route path="/entry/:id/edit" element={<WriteEditView />} />
          </Routes>
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
