import type { VercelRequest, VercelResponse } from '@vercel/node';

type CardInfo = { title?: string; question?: string };

const moodTexts: Record<string, string> = {
  calm: 'сегодня в спокойном, ровном состоянии',
  happy: 'сегодня в радости, в открытости',
  anxious: 'сегодня тревожится и ищет заземления',
  sad: 'сегодня в грусти, нуждается в мягкой поддержке',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured' });
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
    question:
      typeof card?.question === 'string' ? card.question.slice(0, 400) : '',
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
Карта, на которую смотрит: «${c.title}».${c.question ? `\nВопрос карты: «${c.question}»` : ''}
Ответ человека: «${safeSee || '—'}»
Что отозвалось эмоционально: «${safeFeel || '—'}»

Собери подношение.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 220,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return res
        .status(502)
        .json({ error: `Anthropic returned ${response.status}: ${errText.slice(0, 200)}` });
    }

    const data = await response.json();
    const offering = data?.content?.[0]?.text?.trim();
    if (!offering) {
      return res.status(502).json({ error: 'Empty response from Anthropic' });
    }

    return res.status(200).json({ offering });
  } catch (err) {
    return res
      .status(502)
      .json({ error: err instanceof Error ? err.message : 'Upstream error' });
  }
}
