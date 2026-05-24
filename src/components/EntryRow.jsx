import { ListItem, ListItemButton, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import MoodChip from './MoodChip';
import TagPills from './TagPills';

export default function EntryRow({ entry }) {
  const navigate = useNavigate();
  const preview = entry.text.length > 120 ? entry.text.slice(0, 120) + '…' : entry.text;

  return (
    <ListItem disablePadding divider>
      <ListItemButton onClick={() => navigate(`/entry/${entry.id}`)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {dayjs(entry.date).format('MMM D, YYYY')}
            </Typography>
            <MoodChip mood={entry.mood} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {preview}
          </Typography>
          <TagPills tags={entry.tags} />
        </Box>
      </ListItemButton>
    </ListItem>
  );
}
