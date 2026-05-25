import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AppBar,
  Box,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import dayjs from 'dayjs';
import { deleteEntry, getEntry } from '../db';
import MoodChip from '../components/MoodChip';
import TagPills from '../components/TagPills';
import ConfirmDialog from '../components/ConfirmDialog';

export default function ReadView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    let active = true;
    getEntry(id)
      .then((found) => {
        if (active) setEntry(found || null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  function handleMenuOpen(e) {
    setMenuAnchor(e.currentTarget);
  }

  function handleMenuClose() {
    setMenuAnchor(null);
  }

  function handleDeleteClick() {
    handleMenuClose();
    setConfirmDeleteOpen(true);
  }

  async function handleConfirmDelete() {
    await deleteEntry(id);
    navigate('/');
  }

  return (
    <Box>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => navigate('/')} aria-label="back">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Entry
          </Typography>
          {entry && (
            <>
              <Button color="inherit" onClick={() => navigate(`/entry/${entry.id}/edit`)}>
                Edit
              </Button>
              <IconButton color="inherit" onClick={handleMenuOpen} aria-label="more options">
                <MoreVertIcon />
              </IconButton>
              <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
                <MenuItem onClick={handleDeleteClick}>Delete</MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && !entry && (
          <Box sx={{ mt: 8, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Entry not found
            </Typography>
            <Button variant="contained" onClick={() => navigate('/')}>
              Back to journal
            </Button>
          </Box>
        )}

        {!loading && entry && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="subtitle1" color="text.secondary">
                {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
              </Typography>
              <MoodChip mood={entry.mood} />
            </Box>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
              {entry.text}
            </Typography>
            <TagPills tags={entry.tags} />
          </Box>
        )}
      </Box>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete entry?"
        message="This entry will be permanently removed from this device."
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </Box>
  );
}
