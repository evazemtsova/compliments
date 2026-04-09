import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, mood } = req.body ?? {};

  const moodText = mood === 'tired' ? 'немного устала и нуждается в поддержке' : 'в хорошем настроении';

  const prompt = `Напиши один красивый, тёплый комплимент на русском языке${name ? ` для человека по имени ${name}` : ''}, которая сейчас ${moodText}.

Стиль: поэтичный, минималистичный, как внутренний голос. Без восклицательных знаков. Без эмодзи. Одно предложение. Только сам текст комплимента.`;

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
  const compliment = data.content?.[0]?.text?.trim() ?? 'Ты несёшь в себе тихую красоту осознанности.';

  return res.status(200).json({ compliment });
}
