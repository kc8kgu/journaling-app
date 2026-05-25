import { Chip } from '@mui/material';
import { getMood } from '../utils/moods';

export default function MoodChip({ mood, size = 'small' }) {
  const { emoji, label } = getMood(mood);
  return (
    <Chip
      label={`${emoji} ${label}`}
      size={size}
      variant="outlined"
      sx={{ fontWeight: 500 }}
    />
  );
}
