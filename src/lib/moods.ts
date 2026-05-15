export type MoodId = 'calm' | 'happy' | 'anxious' | 'sad';

export type Mood = {
  id: MoodId;
  label: string;
  image: string;
};

export const MOODS: Mood[] = [
  { id: 'calm',    label: 'спокойно', image: '/emotions/calm.webp' },
  { id: 'happy',   label: 'радостно', image: '/emotions/happy.webp' },
  { id: 'anxious', label: 'тревожно', image: '/emotions/anxious.webp' },
  { id: 'sad',     label: 'грустно',  image: '/emotions/sad.webp' },
];

export const moodById = (id: MoodId | null | undefined): Mood | null =>
  id ? MOODS.find(m => m.id === id) ?? null : null;
