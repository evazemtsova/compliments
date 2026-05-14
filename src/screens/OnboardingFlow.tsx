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

type Props = {
  initialName: string;
  initialMood?: Mood | null;
  initialCompliment?: string | null;
  onMetacard: (result: { name: string; mood: Mood; compliment: string }) => void;
  onComplimentReady: (result: { name: string; mood: Mood; compliment: string }) => void;
  onNewSession: () => void;
};

export function OnboardingFlow({
  initialName,
  initialMood = null,
  initialCompliment = null,
  onMetacard,
  onComplimentReady,
  onNewSession,
}: Props) {
  const hasSaved = !!(initialCompliment && initialMood);
  const [step, setStep] = useState<0 | 1 | 2 | 3>(hasSaved ? 3 : 0);
  const [name, setName] = useState(initialName);
  const [mood, setMood] = useState<Mood | null>(initialMood);
  const [loading, setLoading] = useState(false);
  const [compliment, setCompliment] = useState<string | null>(initialCompliment);
  const [error, setError] = useState<string | null>(null);
  const [shareLabel, setShareLabel] = useState('Поделиться');

  const generate = async () => {
    if (!mood) return;
    setLoading(true);
    setError(null);
    setCompliment(null);
    setStep(3);
    try {
      const res = await fetch('/api/compliment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), mood: mood.id }),
      });
      const data = await res.json();
      const text = data.compliment ?? 'В тебе есть тихая красота осознанности.';
      setCompliment(text);
      onComplimentReady({ name: name.trim(), mood, compliment: text });
    } catch {
      setError('Не получилось дотянуться. Попробуй ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  const share = async () => {
    if (!compliment) return;
    const text = `«${compliment}»\n\n— Ежедневный комплимент`;
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
                  ежедневный ритуал
                </MicroLabel>
                <h1 className="t-display mb-6">
                  Один <em>комплимент</em>
                  <br />в день.
                </h1>
                <p className="t-lead max-w-md mx-auto lg:mx-0">
                  Маленький жест самоподдержки. Тёплое слово, написанное именно для тебя — после короткого ритуала.
                </p>
                <div className="mt-9 lg:mt-11">
                  <button
                    onClick={() => setStep(1)}
                    className="btn-primary w-full sm:w-auto sm:px-12"
                  >
                    Начать ритуал
                  </button>
                  <div className="t-hint mt-4 sm:mt-3 hidden sm:block">займёт около двух минут</div>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center lg:justify-end order-1 lg:order-2">
                <div
                  className="rounded-full"
                  style={{
                    width: 'clamp(160px, 32vw, 380px)',
                    height: 'clamp(160px, 32vw, 380px)',
                    background:
                      'radial-gradient(circle at 35% 30%, oklch(0.94 0.06 60), oklch(0.55 0.13 50))',
                    animation: 'breathe 4.5s ease-in-out infinite',
                    boxShadow: '0 50px 100px -50px rgba(163, 138, 88, 0.45)',
                  }}
                />
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
            <div className="w-full max-w-[680px] mx-auto">
              <StepIndicator current={1} total={3} />
              <h2 className="t-heading mb-3">
                Как тебя <em>зовут?</em>
              </h2>
              <p className="t-body mb-7 max-w-md">
                Имя нужно, чтобы комплимент звучал лично. Можно пропустить.
              </p>

              <input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && setStep(2)}
                placeholder="например, Ева"
                maxLength={40}
                className="field-input t-name-input max-w-md"
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
            <div className="w-full max-w-[920px] mx-auto">
              <StepIndicator current={2} total={3} />
              <h2 className="t-heading mb-3">
                Как ты <em>сейчас?</em>
              </h2>
              <p className="t-body mb-8 max-w-md">
                {name
                  ? `${name}, выбери, что ближе всего к твоему состоянию.`
                  : 'Выбери, что ближе всего к твоему состоянию.'}
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
                          className="t-body"
                          style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}
                        >
                          {m.label}
                        </span>
                        <span className="t-hint truncate">{m.desc}</span>
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
                  onClick={generate}
                  disabled={!mood}
                  className="btn-primary w-full sm:w-auto sm:min-w-[180px]"
                >
                  Получить
                </button>
              </div>
            </div>
          </motion.section>
        )}

        {step === 3 && (
          <motion.section
            key="s3"
            {...fadeStep}
            className="flex-1 flex items-center justify-center py-10 lg:py-16"
          >
            <div className="w-full max-w-[820px] mx-auto text-center">
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
                  <p className="t-body mb-5">{error}</p>
                  <button onClick={generate} className="btn-secondary">
                    Попробовать снова
                  </button>
                </div>
              ) : (
                <div className="fade-up">
                  {mood && (
                    <div className="flex items-center justify-center gap-3 mb-8 lg:mb-10">
                      <MoodOrb hue={mood.hue} size={26} />
                      <MicroLabel className="text-muted">{mood.label}</MicroLabel>
                    </div>
                  )}

                  <p className="t-hero-quote">
                    <span className="text-accent italic">«</span>
                    {compliment}
                    <span className="text-accent italic">»</span>
                  </p>

                  <div className="micro text-muted mt-8 lg:mt-10">
                    — {name || 'для тебя'}
                  </div>

                  <div className="mt-12 lg:mt-16 flex flex-col items-center gap-6">
                    <button
                      onClick={() =>
                        compliment && mood && onMetacard({ name: name.trim(), mood, compliment })
                      }
                      className="btn-primary w-full sm:w-auto sm:min-w-[260px]"
                    >
                      Метакарта дня →
                    </button>
                    <div className="flex items-center gap-7">
                      <button onClick={share} className="action-link">
                        {shareLabel}
                      </button>
                      <button onClick={onNewSession} className="action-link">
                        Заново
                      </button>
                    </div>
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
