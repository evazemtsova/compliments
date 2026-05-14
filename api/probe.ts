import type { VercelRequest, VercelResponse } from '@vercel/node';

type CardInfo = { title?: string; artist?: string; year?: string };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { card, see, feel, name } = (req.body ?? {}) as {
    card?: CardInfo;
    see?: string;
    feel?: string;
    name?: string;
  };

  const c: CardInfo = {
    title: typeof card?.title === 'string' ? card.title.slice(0, 200) : 'без названия',
    artist: typeof card?.artist === 'string' ? card.artist.slice(0, 200) : 'неизвестно',
    year: typeof card?.year === 'string' ? card.year.slice(0, 50) : '—',
  };
  const safeSee = typeof see === 'string' ? see.trim().slice(0, 800) : '';
  const safeFeel = typeof feel === 'string' ? feel.trim().slice(0, 800) : '';
  const safeName = typeof name === 'string' ? name.trim().slice(0, 40) : '';

  const prompt = `Ты помощник в проективной практике с метафорическими ассоциативными картами (МАК). Твоя задача — задать ОДИН открытый углубляющий вопрос, который поможет человеку соединить образ карты с его внутренним состоянием.

КРИТИЧНО:
— НЕ интерпретируй карту вместо человека.
— НЕ давай советов и не предлагай решений.
— НЕ объясняй символику изображения.
— НЕ комментируй художника или стиль.
— Вопрос должен быть открытым (нельзя ответить «да/нет»).
— Вопрос должен опираться на то, что человек УЖЕ САМ заметил и почувствовал.

СТИЛЬ:
— Поэтичный, тихий, как внутренний голос.
— Без восклицательных знаков и эмодзи.
— Одно предложение.
— Гендерно-нейтральный: используй конструкции «в тебе», «ты замечаешь», «твоё», глаголы в настоящем времени без причастий с явным родом.
— Обращайся на «ты»${safeName ? ` (по имени: ${safeName})` : ''}.

Верни только сам вопрос, без кавычек и пояснений.

—

Карта: «${c.title}», ${c.artist}, ${c.year}.

На вопрос «Что на карте?» человек ответил: «${safeSee}»

На вопрос «Что ты чувствуешь, глядя на неё?» человек ответил: «${safeFeel}»

Задай ОДИН углубляющий вопрос.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  const question =
    data.content?.[0]?.text?.trim() ??
    'Что в этом образе тебе откликается сильнее всего?';

  return res.status(200).json({ question });
}
