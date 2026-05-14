import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { Stage, MicroLabel, LoadingDots } from '../components/ui';
import { MACCard } from '../components/MACCard';
import { cardForDay, type Card } from '../lib/deck';
import { todayInfo } from '../lib/date';
import { fadeStep } from '../lib/motionPresets';

type Step = 'fields' | 'done';

type Props = {
  name: string;
  onBack: () => void;
  onNewSession: () => void;
};

export function MetacardSession({ name, onBack, onNewSession }: Props) {
  const date = todayInfo();
  const [card] = useState<Card>(() => cardForDay(date.day));
  const [step, setStep] = useState<Step>('fields');
  const [seeText, setSeeText] = useState('');
  const [feelText, setFeelText] = useState('');
  const [reflection, setReflection] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fieldsValid = seeText.trim().length >= 3 && feelText.trim().length >= 3;

  const finishSession = async () => {
    setLoading(true);
    setError(null);
    setStep('done');
    try {
      const res = await fetch('/api/synthesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card: { title: card.title, artist: card.artist, year: card.year },
          see: seeText.trim(),
          feel: feelText.trim(),
          name: name.trim(),
        }),
      });
      const data = await res.json();
      setReflection(
        (data.reflection ?? '').trim() ||
          'В тебе есть тихое внимание к собственным образам — этого уже достаточно.'
      );
    } catch {
      setError('Не получилось дотянуться. Попробуй ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stage>
      <div className="flex items-center justify-between mb-2 lg:mb-4">
        <button onClick={onBack} className="btn-ghost">
          <ChevronLeft className="w-4 h-4" strokeWidth={1.6} />
          Назад
        </button>
        <MicroLabel className="text-muted">проекция</MicroLabel>
        <span className="w-16" aria-hidden />
      </div>

      <AnimatePresence mode="wait">
        {step === 'fields' && (
          <motion.section
            key="fields"
            {...fadeStep}
            className="flex-1 flex items-center py-6 lg:py-10"
          >
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
              <div className="lg:col-span-7 flex justify-center lg:justify-end">
                <div className="gallery-wall p-4 sm:p-7 lg:p-10">
                  <div className="hidden sm:block">
                    <MACCard card={card} size="lg" showCaption />
                  </div>
                  <div className="sm:hidden">
                    <MACCard card={card} size="md" showCaption />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 w-full max-w-[460px] mx-auto lg:mx-0 flex flex-col gap-7">
                <div>
                  <MicroLabel className="text-muted mb-3">Что на карте?</MicroLabel>
                  <textarea
                    value={seeText}
                    onChange={e => setSeeText(e.target.value)}
                    placeholder="опиши, что видишь"
                    rows={3}
                    className="field-textarea"
                  />
                </div>

                <div>
                  <MicroLabel className="text-muted mb-3">
                    Что ты чувствуешь, глядя на неё?
                  </MicroLabel>
                  <textarea
                    value={feelText}
                    onChange={e => setFeelText(e.target.value)}
                    placeholder="без оценок, просто отклик"
                    rows={3}
                    className="field-textarea"
                  />
                </div>

                <div className="mt-2">
                  <button
                    onClick={finishSession}
                    disabled={!fieldsValid || loading}
                    className="btn-primary w-full sm:w-auto sm:min-w-[200px]"
                  >
                    {loading ? 'Слушаем…' : 'Готово'}
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {step === 'done' && (
          <motion.section
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col items-center justify-center py-10 lg:py-16 relative"
          >
            <div className="hidden lg:block absolute top-2 right-2 opacity-90">
              <MACCard card={card} size="sm" showCaption={false} />
            </div>

            <div className="w-full max-w-[760px] mx-auto text-center">
              <div className="lg:hidden flex justify-center mb-8">
                <MACCard card={card} size="sm" showCaption={false} />
              </div>

              <MicroLabel className="text-accent mb-8 lg:mb-10">
                сессия завершена
              </MicroLabel>

              {loading ? (
                <div className="flex flex-col items-center gap-3 py-10">
                  <LoadingDots />
                  <MicroLabel className="text-muted">собираем отражение…</MicroLabel>
                </div>
              ) : error ? (
                <p className="type-body">{error}</p>
              ) : (
                <p className="type-display">{reflection}</p>
              )}

              {!loading && (
                <div className="mt-14 lg:mt-20">
                  <button onClick={onNewSession} className="action-link">
                    Завершить ритуал
                  </button>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </Stage>
  );
}
