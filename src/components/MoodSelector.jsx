import { Box, Chip, Typography } from '@mui/material';
import { MOOD_OPTIONS, coerceMood } from '../utils/moods';

export default function MoodSelector({ value = 'neutral', onChange }) {
  const selectedMood = coerceMood(value);

  return (
    <Box>
      <Typography variant="subtitle2" component="div" sx={{ mb: 1 }}>
        Mood
      </Typography>
      <Box
        role="radiogroup"
        aria-label="Mood"
        sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}
      >
        {MOOD_OPTIONS.map(({ key, emoji, label }) => {
          const selected = key === selectedMood;
          return (
            <Chip
              key={key}
              label={`${emoji} ${label}`}
              clickable
              color={selected ? 'primary' : 'default'}
              variant={selected ? 'filled' : 'outlined'}
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(key)}
              sx={{ fontWeight: selected ? 700 : 500 }}
            />
          );
        })}
      </Box>
    </Box>
  );
}
