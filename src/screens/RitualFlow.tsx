import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronDown } from 'lucide-react';
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

const FEEL_TAGS = [
  'благодарность',
  'воодушевление',
  'грусть',
  'желание',
  'задумчивость',
  'интерес',
  'лёгкость',
  'меланхолия',
  'нежность',
  'ностальгия',
  'одиночество',
  'предвкушение',
  'сила',
  'сомнение',
  'спокойствие',
  'тепло',
  'томление',
  'тревога',
  'удивление',
  'усталость',
] as const;

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
  const [feelTags, setFeelTags] = useState<string[]>(() =>
    initialFeel
      ? initialFeel
          .split(',')
          .map(s => s.trim())
          .filter(s => (FEEL_TAGS as readonly string[]).includes(s))
      : []
  );
  const [offering, setOffering] = useState<string | null>(initialOffering);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareLabel, setShareLabel] = useState('Поделиться');
  const [feelMenuOpen, setFeelMenuOpen] = useState(false);

  const fieldsValid = seeText.trim().length >= 3 && feelTags.length >= 1;

  const toggleTag = (tag: string) => {
    setFeelTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

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
          card: { title: card.title, question: card.question },
          see: seeText.trim(),
          feel: feelTags.join(', '),
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
        feel: feelTags.join(', '),
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
            <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-14 items-center justify-center">
              <div className="shrink-0">
                <div className="lg:hidden">
                  <PhyllotaxisOrb size={240} />
                </div>
                <div className="hidden lg:block">
                  <PhyllotaxisOrb size={360} />
                </div>
              </div>

              <div className="max-w-[520px] text-center lg:text-left">
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
            </div>
          </motion.section>
        )}

        {step === 1 && (
          <motion.section
            key="s1"
            {...fadeStep}
            className="flex-1 flex items-center justify-center py-8 lg:py-0"
          >
            <div className="w-full max-w-[560px] mx-auto text-center">
              <StepIndicator current={1} total={4} />
              <h2 className="type-display mb-4">
                Как тебя <em>зовут?</em>
              </h2>
              <p className="type-body mb-8 max-w-md mx-auto">
                Имя нужно, чтобы слова звучали лично. Можно пропустить.
              </p>

              <input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && setStep(2)}
                placeholder="например, Ева"
                maxLength={40}
                className="field-input type-italic max-w-md mx-auto block"
              />

              <div className="flex flex-row gap-3 mt-12 sm:justify-center">
                <button
                  onClick={() => {
                    setName('');
                    setStep(2);
                  }}
                  className="btn-secondary flex-1 sm:flex-none sm:min-w-[160px]"
                >
                  Пропустить
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="btn-primary flex-1 sm:flex-none sm:min-w-[180px]"
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
            <div className="w-full max-w-[560px] mx-auto text-center">
              <StepIndicator current={2} total={4} />
              <h2 className="type-display mb-4">
                Как ты <em>сейчас?</em>
              </h2>
              <p className="type-body mb-8 max-w-md mx-auto">
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
                        background: 'rgba(255, 255, 255, 0.35)',
                        border: `1px solid ${active ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.55)'}`,
                        backdropFilter: 'blur(14px) saturate(140%)',
                        WebkitBackdropFilter: 'blur(14px) saturate(140%)',
                        boxShadow:
                          'inset 0 1px 0 rgba(255, 255, 255, 0.55), 0 6px 18px -10px rgba(26, 22, 18, 0.25)',
                      }}
                    >
                      <MoodOrb hue={m.hue} size={30} />
                      <span
                        className="type-body flex-1 min-w-0"
                        style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}
                      >
                        {m.label}
                      </span>
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

              <div className="flex flex-row gap-3 mt-10 sm:justify-center">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1 sm:flex-none sm:min-w-[160px]"
                >
                  ← Назад
                </button>
                <button
                  onClick={() => mood && setStep(3)}
                  disabled={!mood}
                  className="btn-primary flex-1 sm:flex-none sm:min-w-[180px]"
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
            className="flex-1 flex flex-col py-2 lg:py-4"
          >
            <StepIndicator current={3} total={4} />
            <div className="w-full text-center mb-5 lg:mb-8">
              <h2 className="type-display mb-3">
                Твоя <em>карта.</em>
              </h2>
              <p className="type-body">
                Ты ее видишь именно сейчас не просто так.
              </p>
            </div>

            <div className="w-full flex flex-col lg:flex-row justify-center items-center gap-4 lg:gap-12 flex-1">
              <div>
                <div className="gallery-wall p-2 sm:p-5 lg:p-6">
                  <div className="hidden sm:block">
                    <MACCard card={card} size="lg" showCaption={false} />
                  </div>
                  <div className="sm:hidden">
                    <MACCard card={card} size="md" showCaption={false} />
                  </div>
                </div>
              </div>

              <div className="w-full max-w-[460px] lg:w-[440px] flex flex-col gap-5 lg:gap-6 mt-2 lg:mt-0">
                <div>
                  <p
                    className="type-caption mb-3"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {card.question}
                  </p>
                  <textarea
                    value={seeText}
                    onChange={e => setSeeText(e.target.value)}
                    placeholder="... твой текст..."
                    rows={1}
                    className="field-textarea max-w-[360px]"
                  />
                </div>

                <div>
                  <p
                    className="type-caption mb-3"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Что в тебе отзывается?
                  </p>
                  <button
                    type="button"
                    onClick={() => setFeelMenuOpen(true)}
                    className="w-full max-w-[360px] rounded-full flex items-center justify-between gap-2 transition-all duration-200"
                    style={{
                      background: 'rgba(255, 255, 255, 0.35)',
                      border: '1px solid rgba(255, 255, 255, 0.55)',
                      backdropFilter: 'blur(14px) saturate(140%)',
                      WebkitBackdropFilter: 'blur(14px) saturate(140%)',
                      boxShadow:
                        'inset 0 1px 0 rgba(255, 255, 255, 0.55), 0 6px 18px -10px rgba(26, 22, 18, 0.25)',
                      padding: '10px 18px',
                      color: 'var(--color-text-primary)',
                      fontSize: '14px',
                    }}
                  >
                    <span
                      className="truncate flex-1 text-left"
                      style={{
                        opacity: feelTags.length === 0 ? 0.55 : 1,
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {feelTags.length === 0
                        ? 'выбери одно или несколько'
                        : feelTags.join(', ')}
                    </span>
                    <ChevronDown
                      className="w-4 h-4 shrink-0"
                      strokeWidth={1.5}
                    />
                  </button>
                </div>

                <div className="flex flex-row gap-3 mt-2">
                  <button
                    onClick={() => setStep(2)}
                    className="btn-secondary flex-1 sm:flex-none sm:min-w-[140px]"
                  >
                    ← Назад
                  </button>
                  <button
                    onClick={generateOffering}
                    disabled={!fieldsValid}
                    className="btn-primary flex-1 sm:flex-none sm:min-w-[220px]"
                  >
                    <span className="sm:hidden">Для тебя →</span>
                    <span className="hidden sm:inline">Слова для тебя →</span>
                  </button>
                </div>
              </div>
            </div>

            {feelMenuOpen && (
              <div
                className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
                onClick={() => setFeelMenuOpen(false)}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'rgba(26, 22, 18, 0.32)',
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)',
                  }}
                />
                <div
                  onClick={e => e.stopPropagation()}
                  className="relative w-full sm:max-w-md sm:mx-4 rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
                  style={{
                    background: 'rgba(251, 248, 241, 0.98)',
                    backdropFilter: 'blur(20px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(150%)',
                    border: '1px solid rgba(255, 255, 255, 0.55)',
                    boxShadow: '0 -24px 60px -16px rgba(26, 22, 18, 0.4)',
                    maxHeight: '80vh',
                  }}
                >
                  <div className="sm:hidden flex justify-center pt-3 pb-1">
                    <div
                      style={{
                        width: 36,
                        height: 4,
                        borderRadius: 2,
                        background: 'var(--color-line)',
                      }}
                    />
                  </div>

                  <div className="px-5 pt-3 sm:pt-6 pb-3">
                    <MicroLabel className="text-muted">Что в тебе отзывается?</MicroLabel>
                  </div>

                  <div className="px-2 overflow-y-auto" style={{ minHeight: 0, flex: 1 }}>
                    {FEEL_TAGS.map(tag => {
                      const active = feelTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl transition-colors"
                          style={{
                            background: active ? 'rgba(163, 138, 88, 0.10)' : 'transparent',
                            color: 'var(--color-text-primary)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '14px',
                            textAlign: 'left',
                          }}
                        >
                          <span>{tag}</span>
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

                  <div
                    className="px-5 py-4 border-t"
                    style={{ borderColor: 'var(--color-line)' }}
                  >
                    <button
                      type="button"
                      onClick={() => setFeelMenuOpen(false)}
                      className="btn-primary w-full"
                    >
                      Готово
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.section>
        )}

        {step === 4 && (
          <motion.section
            key="s4"
            {...fadeStep}
            className="flex-1 flex items-center justify-center py-4 lg:py-6"
          >
            <div className="w-full max-w-[820px] mx-auto text-center">
              <StepIndicator current={4} total={4} />
              {loading ? (
                <div className="flex flex-col items-center gap-5">
                  <PhyllotaxisOrb size={180} />
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
                  <div className="mb-5 lg:mb-7">
                    <MACCard card={card} size="sm" showCaption={false} />
                  </div>

                  <div className="type-micro text-muted mb-5 lg:mb-6">
                    — {name || 'для тебя'}
                  </div>

                  <p className="type-display">
                    <span className="text-accent italic">«</span>
                    {offering}
                    <span className="text-accent italic">»</span>
                  </p>

                  <div className="mt-8 lg:mt-10 flex items-center justify-center gap-7">
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
