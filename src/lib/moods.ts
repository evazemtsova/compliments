export type MoodId = 'tired' | 'calm' | 'anxious' | 'seeking' | 'love' | 'flow';

export type Mood = {
  id: MoodId;
  label: string;
  desc: string;
  hue: number;
};

export const MOODS: Mood[] = [
  { id: 'tired',   label: 'немного устаю', desc: 'нужна мягкая опора',     hue: 28  },
  { id: 'calm',    label: 'всё хорошо',    desc: 'ровное состояние',       hue: 140 },
  { id: 'anxious', label: 'тревожно',      desc: 'хочется заземлиться',    hue: 280 },
  { id: 'seeking', label: 'ищу ясности',   desc: 'нужна оптика',           hue: 220 },
  { id: 'love',    label: 'в любви',       desc: 'открыт сердцем',         hue: 10  },
  { id: 'flow',    label: 'в потоке',      desc: 'собран и в движении',    hue: 60  },
];

export const moodById = (id: MoodId | null | undefined): Mood | null =>
  id ? MOODS.find(m => m.id === id) ?? null : null;
