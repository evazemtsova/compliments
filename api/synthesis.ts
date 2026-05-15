import type { VercelRequest, VercelResponse } from '@vercel/node';

type CardInfo = { title?: string; artist?: string; year?: string };

const moodTexts: Record<string, string> = {
  tired: 'сегодня устаёт и пришло за мягкой опорой',
  calm: 'сегодня в ровном, хорошем состоянии',
  anxious: 'сегодня тревожится и ищет заземления',
  seeking: 'сегодня ищет ясности о себе',
  love: 'сегодня открыто сердцем',
  flow: 'сегодня в собранности и движении',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { card, see, feel, name, mood } = (req.body ?? {}) as {
    card?: CardInfo;
    see?: string;
    feel?: string;
    name?: string;
    mood?: string;
  };

  const c: CardInfo = {
    title: typeof card?.title === 'string' ? card.title.slice(0, 200) : 'без названия',
    artist: typeof card?.artist === 'string' ? card.artist.slice(0, 200) : 'неизвестно',
    year: typeof card?.year === 'string' ? card.year.slice(0, 50) : '—',
  };
  const safeSee = typeof see === 'string' ? see.trim().slice(0, 800) : '';
  const safeFeel = typeof feel === 'string' ? feel.trim().slice(0, 800) : '';
  const safeName = typeof name === 'string' ? name.trim().slice(0, 40) : '';
  const moodText = moodTexts[mood as string] ?? 'сегодня в моменте поиска';

  const prompt = `Ты завершаешь короткий тихий ритуал самоподдержки. Человек выбрал состояние, посмотрел на метафорическую карту, описал, что увидел и что в нём отозвалось. Твоя задача — собрать всё это в одно тёплое подношение: фраза, которая одновременно отражает то, что человек уже сам прожил, и звучит как тихий комплимент его вниманию.

Это не совет, не интерпретация, не диагноз. Это короткие слова, которые человек мог бы сказать сам себе, если бы умел смотреть на себя с нежностью.

КРИТИЧНО:
— Опирайся на конкретные слова человека из ответов про карту. Не выдумывай образов, которых он не назвал.
— НЕ давай советов («попробуй...», «стоит...», «возможно, тебе нужно...»).
— НЕ ставь диагнозов и НЕ интерпретируй («ты грустишь, потому что...»).
— НЕ обобщай в духе самопомощи («каждый имеет право...», «важно помнить...»).
— Может прозвучать тёплое «в тебе есть...», «ты умеешь...», «твоё...» — но только в продолжение того, что человек уже сам показал в ответах.

СТИЛЬ:
— Одно-два коротких предложения.
— Поэтичный, минималистичный, как внутренний голос.
— Без восклицательных знаков и эмодзи. Без кавычек.
— Гендерно-нейтральный: «в тебе есть», «ты несёшь», «твоё», глаголы в настоящем времени. Никаких «красивая/красивый», «сделала/сделал».
— Обращайся на «ты»${safeName ? ` (имя: ${safeName}, можно не называть)` : ''}.
— Звучит как пауза и подношение, а не как вывод.

Верни только сам текст, без кавычек и пояснений.

—

Контекст ритуала.

Тон встречи: человек ${moodText}.
Карта, на которую смотрит: «${c.title}», ${c.artist}, ${c.year}.
Что увидел: «${safeSee || '—'}»
Что отозвалось: «${safeFeel || '—'}»

Собери подношение.`;

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
  const offering =
    data.content?.[0]?.text?.trim() ??
    'В тебе есть тихое внимание к собственным образам — этого уже достаточно.';

  return res.status(200).json({ offering });
}
