import { Chip } from '@mui/material';

const MOODS = {
  happy:      { emoji: '😊', label: 'Happy' },
  calm:       { emoji: '😌', label: 'Calm' },
  neutral:    { emoji: '😐', label: 'Neutral' },
  sad:        { emoji: '😔', label: 'Sad' },
  frustrated: { emoji: '😤', label: 'Frustrated' },
  anxious:    { emoji: '😰', label: 'Anxious' },
};

export default function MoodChip({ mood, size = 'small' }) {
  const { emoji, label } = MOODS[mood] ?? MOODS.neutral;
  return (
    <Chip
      label={`${emoji} ${label}`}
      size={size}
      variant="outlined"
      sx={{ fontWeight: 500 }}
    />
  );
}
