import { IconButton } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '../ThemeContext';

export default function ThemeToggle() {
  const { isDark, setIsDark } = useTheme();

  return (
    <IconButton
      onClick={() => setIsDark(!isDark)}
      color="inherit"
      aria-label="toggle theme"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Brightness7 /> : <Brightness4 />}
    </IconButton>
  );
}
