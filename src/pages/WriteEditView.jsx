import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { getEntry, saveEntry } from '../db';
import ConfirmDialog from '../components/ConfirmDialog';
import MoodSelector from '../components/MoodSelector';
import TagPills from '../components/TagPills';
import { extractTags } from '../utils/tagParser';
import { coerceMood } from '../utils/moods';

function todayIsoDate() {
  return dayjs().format('YYYY-MM-DD');
}

function makeInitialForm(entry) {
  if (entry) {
    return {
      date: entry.date,
      mood: coerceMood(entry.mood),
      text: entry.text,
    };
  }

  return {
    date: todayIsoDate(),
    mood: 'neutral',
    text: '',
  };
}

export default function WriteEditView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [entry, setEntry] = useState(null);
  const [initialForm, setInitialForm] = useState(() => makeInitialForm(null));
  const [form, setForm] = useState(() => makeInitialForm(null));
  const [loading, setLoading] = useState(isEditMode);
  const [notFound, setNotFound] = useState(false);
  const [textError, setTextError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  useEffect(() => {
    let active = true;

    if (!isEditMode) {
      const nextForm = makeInitialForm(null);
      setEntry(null);
      setInitialForm(nextForm);
      setForm(nextForm);
      setLoading(false);
      setNotFound(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    getEntry(id)
      .then((found) => {
        if (!active) return;
        if (!found) {
          setEntry(null);
          setNotFound(true);
          return;
        }
        const nextForm = makeInitialForm(found);
        setEntry(found);
        setInitialForm(nextForm);
        setForm(nextForm);
        setNotFound(false);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, isEditMode]);

  const detectedTags = useMemo(() => extractTags(form.text), [form.text]);
  const isDirty = (
    form.date !== initialForm.date
    || form.mood !== initialForm.mood
    || form.text !== initialForm.text
  );

  function updateForm(patch) {
    setForm((current) => ({ ...current, ...patch }));
  }

  function navigateAway() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/');
  }

  function handleBack() {
    if (isDirty) {
      setDiscardOpen(true);
      return;
    }
    navigateAway();
  }

  async function handleSave() {
    if (form.text.trim().length === 0) {
      setTextError(true);
      return;
    }

    setSaving(true);
    const now = Date.now();
    const savedEntry = {
      id: entry?.id ?? uuidv4(),
      date: form.date,
      text: form.text,
      mood: coerceMood(form.mood),
      tags: detectedTags,
      createdAt: entry?.createdAt ?? now,
      updatedAt: now,
    };

    try {
      await saveEntry(savedEntry);
      navigate(`/entry/${savedEntry.id}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleBack} aria-label="back">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {isEditMode ? 'Edit Entry' : 'New Entry'}
          </Typography>
          {!notFound && (
            <Button color="inherit" onClick={handleSave} disabled={loading || saving}>
              Save
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && notFound && (
          <Box sx={{ mt: 8, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Entry not found
            </Typography>
            <Button variant="contained" onClick={() => navigate('/')}>
              Back to journal
            </Button>
          </Box>
        )}

        {!loading && !notFound && (
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <DatePicker
              label="Date"
              value={dayjs(form.date)}
              onChange={(nextValue) => {
                if (nextValue?.isValid()) {
                  updateForm({ date: nextValue.format('YYYY-MM-DD') });
                }
              }}
              slotProps={{ textField: { fullWidth: true } }}
            />

            <MoodSelector
              value={form.mood}
              onChange={(mood) => updateForm({ mood })}
            />

            <TextField
              label="Entry"
              placeholder="What's on your mind? Use #tags to categorize."
              value={form.text}
              onChange={(event) => {
                updateForm({ text: event.target.value });
                if (textError && event.target.value.trim().length > 0) {
                  setTextError(false);
                }
              }}
              multiline
              minRows={10}
              fullWidth
              error={textError}
              helperText={textError ? 'Write something before saving.' : ' '}
            />

            <Box>
              <Typography variant="subtitle2" component="div" sx={{ mb: 1 }}>
                Detected tags:
              </Typography>
              <TagPills tags={detectedTags} />
            </Box>
          </Box>
        )}
      </Box>

      <ConfirmDialog
        open={discardOpen}
        title="Discard changes?"
        message="Your unsaved changes will be lost."
        confirmLabel="Discard"
        confirmColor="error"
        onConfirm={navigateAway}
        onCancel={() => setDiscardOpen(false)}
      />
    </Box>
  );
}
