import type { VercelRequest, VercelResponse } from '@vercel/node';

const moodTexts: Record<string, string> = {
  tired: 'испытывает усталость и нуждается в мягкой поддержке',
  calm: 'находится в спокойном, хорошем состоянии',
  anxious: 'испытывает тревогу и нуждается в опоре',
  seeking: 'ищет ясности и понимания себя',
  love: 'переживает открытость к любви',
  flow: 'находится в состоянии потока и собранности',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, mood } = req.body ?? {};
  const moodText = moodTexts[mood as string] ?? 'находится в моменте поиска';
  const safeName = typeof name === 'string' ? name.trim().slice(0, 40) : '';

  const prompt = `Напиши один красивый, тёплый комплимент на русском языке${safeName ? ` для человека по имени ${safeName}` : ''}.

Состояние адресата сейчас: ${moodText}.

Стиль: поэтичный, минималистичный, как внутренний голос. Без восклицательных знаков. Без эмодзи. Одно предложение.

ВАЖНО — гендерная нейтральность: избегай прилагательных и причастий с явной женской или мужской формой. Используй конструкции «в тебе есть...», «ты несёшь...», «твоё...», «ты умеешь...», глаголы в настоящем времени. Не пиши «ты красивая/красивый», «ты сделала/сделал». Обращайся на «ты».

Верни только сам текст комплимента, без кавычек и пояснений.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  const compliment = data.content?.[0]?.text?.trim() ?? 'В тебе есть тихая красота осознанности.';

  return res.status(200).json({ compliment });
}
