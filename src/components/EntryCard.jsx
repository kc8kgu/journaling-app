import { Card, CardActionArea, CardContent, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import MoodChip from './MoodChip';
import TagPills from './TagPills';

export default function EntryCard({ entry }) {
  const navigate = useNavigate();
  const preview = entry.text.length > 300 ? entry.text.slice(0, 300) + '…' : entry.text;

  return (
    <Card elevation={3}>
      <CardActionArea onClick={() => navigate(`/entry/${entry.id}`)}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
            </Typography>
            <MoodChip mood={entry.mood} />
          </Box>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {preview}
          </Typography>
          <TagPills tags={entry.tags} />
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
