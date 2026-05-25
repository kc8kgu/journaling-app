import { useEffect, useState, useRef } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Menu, MenuItem,
  Box, List, Fab, Snackbar, Alert, CircularProgress, Button,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { getAllEntries } from '../db';
import { triggerExport, parseCSV, importCSV } from '../utils/csvHelpers';
import { seedDummyData } from '../utils/seedData';
import { sortEntriesByJournalDate } from '../utils/entrySort';
import ThemeToggle from '../components/ThemeToggle';
import EntryCard from '../components/EntryCard';
import EntryRow from '../components/EntryRow';
import ConfirmDialog from '../components/ConfirmDialog';

export default function ListView() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [snackbar, setSnackbar] = useState(null);
  const [pendingImport, setPendingImport] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    getAllEntries()
      .then((all) => setEntries(sortEntriesByJournalDate(all)))
      .finally(() => setLoading(false));
  }, []);

  function handleMenuOpen(e) { setMenuAnchor(e.currentTarget); }
  function handleMenuClose() { setMenuAnchor(null); }

  function handleExport() {
    handleMenuClose();
    triggerExport().catch(() => setSnackbar({ severity: 'error', message: 'Export failed.' }));
  }

  function handleImportClick() {
    handleMenuClose();
    fileInputRef.current?.click();
  }

  async function handleSeed() {
    handleMenuClose();
    await seedDummyData();
    const all = await getAllEntries();
    setEntries(sortEntriesByJournalDate(all));
    setSnackbar({ severity: 'success', message: 'Test data seeded.' });
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const parsed = await parseCSV(file);
      setPendingImport(parsed);
    } catch {
      setSnackbar({ severity: 'error', message: 'Failed to parse CSV.' });
    }
  }

  async function handleConfirmImport() {
    if (!pendingImport) return;
    try {
      const { imported } = await importCSV(pendingImport.entries);
      const all = await getAllEntries();
      setEntries(sortEntriesByJournalDate(all));
      const msg = pendingImport.skipped > 0
        ? `Imported ${imported} entries, skipped ${pendingImport.skipped} invalid rows.`
        : `Imported ${imported} entries.`;
      setSnackbar({ severity: 'success', message: msg });
    } catch {
      setSnackbar({ severity: 'error', message: 'Import failed.' });
    } finally {
      setPendingImport(null);
    }
  }

  function handleCancelImport() {
    setPendingImport(null);
  }

  const [featured, ...rest] = entries;

  return (
    <Box sx={{ pb: 10 }}>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            My Journal
          </Typography>
          <ThemeToggle />
          <IconButton color="inherit" onClick={handleMenuOpen} aria-label="more options">
            <MoreVertIcon />
          </IconButton>
          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
            <MenuItem onClick={handleExport}>Export CSV</MenuItem>
            <MenuItem onClick={handleImportClick}>Import CSV</MenuItem>
            {import.meta.env.DEV && (
              <MenuItem onClick={handleSeed}>Seed test data</MenuItem>
            )}
          </Menu>
        </Toolbar>
      </AppBar>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <Box sx={{ p: 2 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && entries.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2,
              mt: 12,
              textAlign: 'center',
            }}
          >
            <Typography color="text.secondary">
              No entries yet.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/entry/new')}>
              Write first entry
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
              Your journal is stored only on this device. Export a CSV backup anytime.
            </Typography>
          </Box>
        )}

        {!loading && featured && (
          <Box sx={{ mb: 2 }}>
            <EntryCard entry={featured} />
          </Box>
        )}

        {!loading && rest.length > 0 && (
          <List disablePadding>
            {rest.map((entry) => (
              <EntryRow key={entry.id} entry={entry} />
            ))}
          </List>
        )}
      </Box>

      <Fab
        color="primary"
        aria-label="new entry"
        onClick={() => navigate('/entry/new')}
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
      >
        <AddIcon />
      </Fab>

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar?.severity} onClose={() => setSnackbar(null)}>
          {snackbar?.message}
        </Alert>
      </Snackbar>

      <ConfirmDialog
        open={Boolean(pendingImport)}
        title={`Import ${pendingImport?.entries.length ?? 0} entries?`}
        message={
          pendingImport?.skipped > 0
            ? `Entries with matching IDs will be replaced. ${pendingImport.skipped} invalid rows will be skipped.`
            : 'Entries with matching IDs will be replaced.'
        }
        confirmLabel="Import"
        onConfirm={handleConfirmImport}
        onCancel={handleCancelImport}
      />
    </Box>
  );
}
