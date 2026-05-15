// Alphabetical Russian emotion vocabulary used in the feel-tags modal.
export const FEEL_TAGS = [
  'благодарность',
  'воодушевление',
  'грусть',
  'желание',
  'задумчивость',
  'интерес',
  'лёгкость',
  'меланхолия',
  'нежность',
  'ностальгия',
  'одиночество',
  'предвкушение',
  'сила',
  'сомнение',
  'спокойствие',
  'тепло',
  'томление',
  'тревога',
  'удивление',
  'усталость',
] as const;

export type FeelTag = (typeof FEEL_TAGS)[number];

export function isFeelTag(s: string): s is FeelTag {
  return (FEEL_TAGS as readonly string[]).includes(s);
}
