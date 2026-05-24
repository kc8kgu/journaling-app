import { Box, Chip } from '@mui/material';

export default function TagPills({ tags = [] }) {
  if (!tags.length) return null;
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {tags.map((tag) => (
        <Chip key={tag} label={`#${tag}`} size="small" variant="filled" />
      ))}
    </Box>
  );
}
