import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Stage, MicroLabel, ProgressDots, LoadingDots, MoodOrb } from '../components/ui';
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

  const totalSteps = 3;
  const dotsIndex = step === 0 ? -1 : step - 1;

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

  return (
    <Stage>
      <div className="flex items-center justify-center pt-2 pb-6 min-h-[24px]">
        {step > 0 && <ProgressDots total={totalSteps} current={dotsIndex} />}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="s0" {...fadeStep} className="flex-1 flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div
                className="rounded-full mb-7"
                style={{
                  width: 130,
                  height: 130,
                  background:
                    'radial-gradient(circle at 35% 30%, oklch(0.92 0.07 60), oklch(0.55 0.12 50))',
                  animation: 'breathe 4.5s ease-in-out infinite',
                }}
              />
              <MicroLabel className="text-accent">ежедневный ритуал</MicroLabel>
              <h1 className="t-display mt-3 mb-3">
                Один <em>комплимент</em><br />в день.
              </h1>
              <p className="t-lead max-w-sm">
                Маленький жест самоподдержки. Тёплое слово, написанное именно для тебя — после короткого ритуала.
              </p>
            </div>
            <div className="mt-6">
              <button onClick={() => setStep(1)} className="btn-primary w-full">
                Начать ритуал
              </button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="s1" {...fadeStep} className="flex-1 flex flex-col">
            <MicroLabel className="text-accent">шаг 1 из 3</MicroLabel>
            <h2 className="t-heading mt-4 mb-2">
              Как тебя <em>зовут?</em>
            </h2>
            <p className="t-body">
              Имя нужно, чтобы комплимент звучал лично. Можно пропустить.
            </p>

            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setStep(2)}
              placeholder="например, Ева"
              maxLength={40}
              className="field-input t-name-input mt-7"
            />

            <div className="flex-1" />
            <div className="flex gap-3 mt-8">
              <button onClick={() => { setName(''); setStep(2); }} className="btn-secondary flex-1">
                Пропустить
              </button>
              <button onClick={() => setStep(2)} className="btn-primary flex-1">
                Дальше →
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" {...fadeStep} className="flex-1 flex flex-col">
            <MicroLabel className="text-accent">шаг 2 из 3</MicroLabel>
            <h2 className="t-heading mt-4 mb-2">
              Как ты <em>сейчас?</em>
            </h2>
            <p className="t-body">
              {name ? `${name}, выбери, что ближе всего к твоему состоянию.` : 'Выбери, что ближе всего к твоему состоянию.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-6">
              {MOODS.map(m => {
                const active = mood?.id === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMood(m)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all"
                    style={{
                      background: active ? 'var(--color-card)' : 'transparent',
                      border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-line)'}`,
                    }}
                  >
                    <MoodOrb hue={m.hue} size={30} />
                    <div className="flex flex-col">
                      <span className="t-body" style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                        {m.label}
                      </span>
                      <span className="t-hint">{m.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex-1" />
            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                ← Назад
              </button>
              <button onClick={generate} disabled={!mood} className="btn-primary flex-1">
                Получить
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" {...fadeStep} className="flex-1 flex flex-col">
            <MicroLabel className="text-accent">твой комплимент</MicroLabel>

            <div className="flex-1 flex items-center py-6">
              {loading ? (
                <div className="flex flex-col items-center gap-4 w-full">
                  <div
                    className="rounded-full"
                    style={{
                      width: 110,
                      height: 110,
                      background: `radial-gradient(circle at 35% 30%, oklch(0.88 0.08 ${mood?.hue ?? 60}), oklch(0.55 0.12 ${((mood?.hue ?? 60) + 30) % 360}))`,
                      animation: 'breathe 2.4s ease-in-out infinite',
                    }}
                  />
                  <LoadingDots />
                  <MicroLabel className="text-muted">собираем слова…</MicroLabel>
                </div>
              ) : error ? (
                <div className="w-full text-center">
                  <p className="t-body mb-4">{error}</p>
                  <button onClick={generate} className="btn-secondary">Попробовать снова</button>
                </div>
              ) : (
                <div className="w-full fade-up">
                  <p className="t-quote">
                    <span className="text-accent italic">«</span>
                    {compliment}
                    <span className="text-accent italic">»</span>
                  </p>
                  <div className="t-meta mt-7 pt-4 border-t flex justify-between text-muted"
                       style={{ borderColor: 'var(--color-line)' }}>
                    <span>{name || 'для тебя'}</span>
                    <span>{mood?.label}</span>
                  </div>
                </div>
              )}
            </div>

            {!loading && !error && compliment && mood && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={onNewSession} className="btn-secondary sm:flex-1">
                  Заново
                </button>
                <button
                  onClick={() => onMetacard({ name: name.trim(), mood, compliment })}
                  className="btn-primary sm:flex-1"
                >
                  Метакарта дня
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Stage>
  );
}
