import type { VercelRequest, VercelResponse } from '@vercel/node';

type CardInfo = { title?: string; artist?: string; year?: string };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { card, see, feel, question, answer, name } = (req.body ?? {}) as {
    card?: CardInfo;
    see?: string;
    feel?: string;
    question?: string;
    answer?: string;
    name?: string;
  };

  const c: CardInfo = {
    title: typeof card?.title === 'string' ? card.title.slice(0, 200) : 'без названия',
    artist: typeof card?.artist === 'string' ? card.artist.slice(0, 200) : 'неизвестно',
    year: typeof card?.year === 'string' ? card.year.slice(0, 50) : '—',
  };
  const safeSee = typeof see === 'string' ? see.trim().slice(0, 800) : '';
  const safeFeel = typeof feel === 'string' ? feel.trim().slice(0, 800) : '';
  const safeQ = typeof question === 'string' ? question.trim().slice(0, 600) : '';
  const safeA = typeof answer === 'string' ? answer.trim().slice(0, 1200) : '';
  const safeName = typeof name === 'string' ? name.trim().slice(0, 40) : '';

  const prompt = `Ты завершаешь короткую проективную сессию с метафорической картой. Твоя задача — дать тихое наблюдение-зеркало по итогу разговора. Это не совет, не диагноз, не комплимент. Это короткое поэтичное отражение того, что человек уже сам прожил в этой сессии.

КРИТИЧНО:
— НЕ давай советов («попробуй...», «стоит подумать о...», «возможно, тебе нужно...»).
— НЕ интерпретируй чувства человека («ты грустишь, потому что...»).
— НЕ обобщай в духе самопомощи («каждый имеет право...», «важно помнить...»).
— Отражай то, что прозвучало в ответах, не добавляя своих гипотез.

СТИЛЬ:
— Одно-два предложения, не больше.
— Поэтичный, минималистичный, как внутренний голос.
— Без восклицательных знаков и эмодзи.
— Гендерно-нейтральный: «в тебе есть», «ты несёшь», «твоё», глаголы в настоящем времени.
— Обращайся на «ты»${safeName ? ` (по имени: ${safeName})` : ''}.
— Звучит как пауза, а не как вывод.

Верни только сам текст, без кавычек и пояснений.

—

Сессия проективной работы с картой.

Карта: «${c.title}», ${c.artist}, ${c.year}.
Что человек увидел: «${safeSee}»
Что почувствовал: «${safeFeel}»
Углубляющий вопрос: «${safeQ}»
Ответ человека: «${safeA}»

Дай короткое наблюдение-зеркало.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 220,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  const reflection =
    data.content?.[0]?.text?.trim() ??
    'В тебе есть тихое внимание к собственным образам — этого уже достаточно.';

  return res.status(200).json({ reflection });
}
