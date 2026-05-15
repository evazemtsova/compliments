import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';
import {
  Stage,
  MicroLabel,
  StepIndicator,
  LoadingDots,
  MoodOrb,
} from '../components/ui';
import { MOODS, type Mood } from '../lib/moods';
import { fadeStep } from '../lib/motionPresets';
import PhyllotaxisOrb from '../components/PhyllotaxisOrb';
import { MACCard } from '../components/MACCard';
import { cardForDay, type Card } from '../lib/deck';
import { todayInfo } from '../lib/date';

type Step = 0 | 1 | 2 | 3 | 4;

export type RitualResult = {
  name: string;
  mood: Mood;
  see: string;
  feel: string;
  offering: string;
};

type Props = {
  initialName: string;
  initialMood?: Mood | null;
  initialSee?: string;
  initialFeel?: string;
  initialOffering?: string | null;
  onComplete: (result: RitualResult) => void;
  onNewSession: () => void;
};

export function RitualFlow({
  initialName,
  initialMood = null,
  initialSee = '',
  initialFeel = '',
  initialOffering = null,
  onComplete,
  onNewSession,
}: Props) {
  const today = todayInfo();
  const [card] = useState<Card>(() => cardForDay(today.day));
  const hasSaved = !!(initialOffering && initialMood);
  const [step, setStep] = useState<Step>(hasSaved ? 4 : 0);
  const [name, setName] = useState(initialName);
  const [mood, setMood] = useState<Mood | null>(initialMood);
  const [seeText, setSeeText] = useState(initialSee);
  const [feelText, setFeelText] = useState(initialFeel);
  const [offering, setOffering] = useState<string | null>(initialOffering);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareLabel, setShareLabel] = useState('Поделиться');

  const fieldsValid = seeText.trim().length >= 3 && feelText.trim().length >= 3;

  const generateOffering = async () => {
    if (!mood) return;
    setLoading(true);
    setError(null);
    setOffering(null);
    setStep(4);
    try {
      const res = await fetch('/api/synthesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          mood: mood.id,
          card: { title: card.title, artist: card.artist, year: card.year },
          see: seeText.trim(),
          feel: feelText.trim(),
        }),
      });
      const data = await res.json();
      const text =
        (data.offering ?? '').trim() ||
        'В тебе есть тихое внимание к собственным образам — этого уже достаточно.';
      setOffering(text);
      onComplete({
        name: name.trim(),
        mood,
        see: seeText.trim(),
        feel: feelText.trim(),
        offering: text,
      });
    } catch {
      setError('Не получилось дотянуться. Попробуй ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  const share = async () => {
    if (!offering) return;
    const text = `«${offering}»\n\n— Ежедневный комплимент`;
    try {
      if (typeof navigator !== 'undefined' && (navigator as Navigator).share) {
        await (navigator as Navigator).share!({ text });
      } else {
        await navigator.clipboard.writeText(text);
      }
      setShareLabel('Скопировано');
      setTimeout(() => setShareLabel('Поделиться'), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <Stage>
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.section
            key="s0"
            {...fadeStep}
            className="flex-1 flex items-center justify-center py-8 lg:py-0"
          >
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
              <div className="lg:col-span-7 max-w-[560px] mx-auto lg:mx-0 text-center lg:text-left order-2 lg:order-1">
                <MicroLabel className="text-accent mb-5 lg:mb-7">
                  Тихий ритуал самоподдержки
                </MicroLabel>
                <h1 className="type-display mb-4">
                  Это только твоя <em>минута</em>…
                </h1>
                <p className="type-body max-w-md mx-auto lg:mx-0">
                  Четыре тихих шага: настроишься, посмотришь на одну карту, и слова, родившиеся из твоего же взгляда, вернутся к тебе.
                </p>
                <div className="mt-8">
                  <button
                    onClick={() => setStep(1)}
                    className="btn-primary w-full sm:w-auto sm:px-12"
                  >
                    Начать ритуал
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center lg:justify-end order-1 lg:order-2">
                <div className="lg:hidden">
                  <PhyllotaxisOrb size={240} />
                </div>
                <div className="hidden lg:block">
                  <PhyllotaxisOrb size={380} />
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {step === 1 && (
          <motion.section
            key="s1"
            {...fadeStep}
            className="flex-1 flex items-center justify-center py-8 lg:py-0"
          >
            <div className="w-full max-w-[560px] mx-auto">
              <StepIndicator current={1} total={4} />
              <h2 className="type-display mb-4">
                Как тебя <em>зовут?</em>
              </h2>
              <p className="type-body mb-8 max-w-md">
                Имя нужно, чтобы слова звучали лично. Можно пропустить.
              </p>

              <input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && setStep(2)}
                placeholder="например, Ева"
                maxLength={40}
                className="field-input type-italic max-w-md"
              />

              <div className="flex flex-col sm:flex-row gap-3 mt-12 sm:justify-end">
                <button
                  onClick={() => {
                    setName('');
                    setStep(2);
                  }}
                  className="btn-secondary w-full sm:w-auto sm:min-w-[160px]"
                >
                  Пропустить
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="btn-primary w-full sm:w-auto sm:min-w-[180px]"
                >
                  Дальше →
                </button>
              </div>
            </div>
          </motion.section>
        )}

        {step === 2 && (
          <motion.section
            key="s2"
            {...fadeStep}
            className="flex-1 flex items-center justify-center py-8 lg:py-0"
          >
            <div className="w-full max-w-[560px] mx-auto">
              <StepIndicator current={2} total={4} />
              <h2 className="type-display mb-4">
                Как ты <em>сейчас?</em>
              </h2>
              <p className="type-body mb-8 max-w-md">
                {name
                  ? `${name}, выбери, что ближе к твоему состоянию.`
                  : 'Выбери, что ближе к твоему состоянию.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {MOODS.map(m => {
                  const active = mood?.id === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMood(m)}
                      className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all duration-200 hover:-translate-y-0.5"
                      style={{
                        background: active
                          ? 'var(--color-card)'
                          : 'rgba(255,255,255,0.32)',
                        border: `1.5px solid ${active ? 'var(--color-accent)' : 'rgba(26,22,18,0.08)'}`,
                        boxShadow: active
                          ? '0 14px 36px -18px rgba(163,138,88,0.45)'
                          : 'none',
                      }}
                    >
                      <MoodOrb hue={m.hue} size={30} />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span
                          className="type-body"
                          style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}
                        >
                          {m.label}
                        </span>
                        <span className="type-caption truncate">{m.desc}</span>
                      </div>
                      {active && (
                        <Check
                          className="w-4 h-4 shrink-0"
                          strokeWidth={2.2}
                          style={{ color: 'var(--color-accent)' }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-10 sm:justify-end">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary w-full sm:w-auto sm:min-w-[160px]"
                >
                  ← Назад
                </button>
                <button
                  onClick={() => mood && setStep(3)}
                  disabled={!mood}
                  className="btn-primary w-full sm:w-auto sm:min-w-[180px]"
                >
                  Дальше →
                </button>
              </div>
            </div>
          </motion.section>
        )}

        {step === 3 && (
          <motion.section
            key="s3"
            {...fadeStep}
            className="flex-1 flex flex-col py-6 lg:py-8"
          >
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center flex-1">
              <div className="lg:col-span-7 flex justify-center lg:justify-end order-1">
                <div className="gallery-wall p-4 sm:p-7 lg:p-10">
                  <div className="hidden sm:block">
                    <MACCard card={card} size="lg" showCaption />
                  </div>
                  <div className="sm:hidden">
                    <MACCard card={card} size="md" showCaption />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 w-full max-w-[460px] mx-auto lg:mx-0 flex flex-col gap-6 order-2">
                <StepIndicator current={3} total={4} />
                <div>
                  <h2 className="type-display mb-4">
                    Посмотри <em>сюда.</em>
                  </h2>
                  <p className="type-body">
                    Эта карта пришла к тебе на сегодня. Побудь с ней пару секунд.
                  </p>
                </div>

                <div>
                  <MicroLabel className="text-muted mb-2">Что ты видишь?</MicroLabel>
                  <textarea
                    value={seeText}
                    onChange={e => setSeeText(e.target.value)}
                    placeholder="опиши, что бросается в глаза"
                    rows={3}
                    className="field-textarea"
                  />
                </div>

                <div>
                  <MicroLabel className="text-muted mb-2">Что в тебе отзывается?</MicroLabel>
                  <textarea
                    value={feelText}
                    onChange={e => setFeelText(e.target.value)}
                    placeholder="без оценок, просто отклик"
                    rows={3}
                    className="field-textarea"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-2 sm:justify-end">
                  <button
                    onClick={() => setStep(2)}
                    className="btn-secondary w-full sm:w-auto sm:min-w-[140px]"
                  >
                    ← Назад
                  </button>
                  <button
                    onClick={generateOffering}
                    disabled={!fieldsValid}
                    className="btn-primary w-full sm:w-auto sm:min-w-[220px]"
                  >
                    Слова для тебя →
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {step === 4 && (
          <motion.section
            key="s4"
            {...fadeStep}
            className="flex-1 flex items-center justify-center py-10 lg:py-16"
          >
            <div className="w-full max-w-[820px] mx-auto text-center">
              <StepIndicator current={4} total={4} />
              {loading ? (
                <div className="flex flex-col items-center gap-5">
                  <div
                    className="rounded-full"
                    style={{
                      width: 140,
                      height: 140,
                      background: `radial-gradient(circle at 35% 30%, oklch(0.88 0.08 ${mood?.hue ?? 60}), oklch(0.55 0.12 ${((mood?.hue ?? 60) + 30) % 360}))`,
                      animation: 'breathe 2.4s ease-in-out infinite',
                    }}
                  />
                  <LoadingDots />
                  <MicroLabel className="text-muted">собираем слова…</MicroLabel>
                </div>
              ) : error ? (
                <div className="w-full">
                  <p className="type-body mb-5">{error}</p>
                  <button onClick={generateOffering} className="btn-primary">
                    Попробовать снова
                  </button>
                </div>
              ) : (
                <div className="fade-up flex flex-col items-center">
                  <div className="mb-9 lg:mb-12">
                    <MACCard card={card} size="sm" showCaption={false} />
                  </div>

                  {mood && (
                    <div className="flex items-center justify-center gap-3 mb-7 lg:mb-9">
                      <MoodOrb hue={mood.hue} size={20} />
                      <MicroLabel className="text-muted">{mood.label}</MicroLabel>
                    </div>
                  )}

                  <p className="type-display">
                    <span className="text-accent italic">«</span>
                    {offering}
                    <span className="text-accent italic">»</span>
                  </p>

                  <div className="type-micro text-muted mt-8 lg:mt-10">
                    — {name || 'для тебя'}
                  </div>

                  <div className="mt-12 lg:mt-16 flex items-center justify-center gap-7">
                    <button onClick={share} className="action-link">
                      {shareLabel}
                    </button>
                    <button onClick={onNewSession} className="btn-ghost">
                      Завершить ритуал
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </Stage>
  );
}
