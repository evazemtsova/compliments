import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Stage, MicroLabel, ProgressDots, LoadingDots, MoodOrb } from '../components/ui';
import { MOODS, type Mood } from '../lib/moods';

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
      {/* Top bar: progress dots */}
      <div className="flex items-center justify-center pt-2 pb-6 min-h-[24px]">
        {step > 0 && <ProgressDots total={totalSteps} current={dotsIndex} />}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="s0"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col"
          >
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
              <MicroLabel className="text-[var(--color-accent)]">ежедневный ритуал</MicroLabel>
              <h1
                className="editorial mt-3 mb-3"
                style={{ fontSize: 'clamp(34px, 5vw, 44px)', lineHeight: 1.08 }}
              >
                Один <em className="text-[var(--color-accent)]">комплимент</em><br />в день.
              </h1>
              <p className="text-[var(--color-text-muted)] max-w-sm" style={{ fontSize: 15, lineHeight: 1.55 }}>
                Маленький жест самоподдержки. Тёплое слово, написанное именно для тебя — после короткого ритуала.
              </p>
            </div>
            <div className="mt-6">
              <button onClick={() => setStep(1)} className="btn-primary w-full">
                Начать ритуал
              </button>
              <div className="text-center mt-3 text-[var(--color-text-muted)]" style={{ fontSize: 11 }}>
                ≈ 30 секунд
              </div>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="s1"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col"
          >
            <MicroLabel className="text-[var(--color-accent)]">шаг 1 из 3</MicroLabel>
            <h2
              className="editorial mt-4 mb-2"
              style={{ fontSize: 'clamp(28px, 4.6vw, 38px)' }}
            >
              Как тебя <em className="text-[var(--color-accent)]">зовут?</em>
            </h2>
            <p className="text-[var(--color-text-muted)]" style={{ fontSize: 14, lineHeight: 1.55 }}>
              Имя нужно, чтобы комплимент звучал лично. Можно пропустить.
            </p>

            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setStep(2)}
              placeholder="например, Ева"
              maxLength={40}
              className="mt-7 bg-transparent border-b border-[var(--color-line)] outline-none w-full pb-2 placeholder:text-[var(--color-text-muted)] placeholder:italic focus:border-[var(--color-accent)] transition-colors"
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: 32,
              }}
            />

            <div className="flex-1" />
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => { setName(''); setStep(2); }}
                className="btn-secondary flex-1"
              >
                Пропустить
              </button>
              <button onClick={() => setStep(2)} className="btn-primary flex-1">
                Дальше →
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="s2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col"
          >
            <MicroLabel className="text-[var(--color-accent)]">шаг 2 из 3</MicroLabel>
            <h2
              className="editorial mt-4 mb-2"
              style={{ fontSize: 'clamp(28px, 4.6vw, 38px)' }}
            >
              Как ты <em className="text-[var(--color-accent)]">сейчас?</em>
            </h2>
            <p className="text-[var(--color-text-muted)]" style={{ fontSize: 14, lineHeight: 1.55 }}>
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
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{m.label}</span>
                      <span className="text-[var(--color-text-muted)]" style={{ fontSize: 11 }}>
                        {m.desc}
                      </span>
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
              <button
                onClick={generate}
                disabled={!mood}
                className="btn-primary flex-1"
              >
                Получить
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="s3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col"
          >
            <MicroLabel className="text-[var(--color-accent)]">твой комплимент</MicroLabel>

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
                  <MicroLabel className="text-[var(--color-text-muted)]">собираем слова…</MicroLabel>
                </div>
              ) : error ? (
                <div className="w-full text-center">
                  <p className="text-[var(--color-text-muted)] mb-4">{error}</p>
                  <button onClick={generate} className="btn-secondary">Попробовать снова</button>
                </div>
              ) : (
                <div className="w-full fade-up">
                  <p
                    className="editorial"
                    style={{ fontSize: 'clamp(24px, 4vw, 32px)', lineHeight: 1.22 }}
                  >
                    <span className="text-[var(--color-accent)] italic">«</span>
                    {compliment}
                    <span className="text-[var(--color-accent)] italic">»</span>
                  </p>
                  <div
                    className="mt-7 pt-4 border-t flex justify-between text-[var(--color-text-muted)]"
                    style={{ borderColor: 'var(--color-line)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 500 }}
                  >
                    <span>{name || 'для тебя'}</span>
                    <span>{mood?.label}</span>
                  </div>
                </div>
              )}
            </div>

            {!loading && !error && compliment && mood && (
              <>
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
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Stage>
  );
}
