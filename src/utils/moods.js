export const MOODS = {
  happy: { emoji: '😊', label: 'Happy' },
  calm: { emoji: '😌', label: 'Calm' },
  neutral: { emoji: '😐', label: 'Neutral' },
  sad: { emoji: '😔', label: 'Sad' },
  frustrated: { emoji: '😤', label: 'Frustrated' },
  anxious: { emoji: '😰', label: 'Anxious' },
};

export const MOOD_OPTIONS = Object.entries(MOODS).map(([key, value]) => ({
  key,
  ...value,
}));

export function isValidMood(mood) {
  return Object.hasOwn(MOODS, mood);
}

export function coerceMood(mood) {
  return isValidMood(mood) ? mood : 'neutral';
}

export function getMood(mood) {
  return MOODS[coerceMood(mood)];
}
