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

  const cardSize = step === 'fields' ? 'md' : 'sm';

  return (
    <Stage>
      <header className="flex items-center justify-between pb-5">
        <button onClick={onBack} className="btn-ghost">
          <ChevronLeft className="w-4 h-4" strokeWidth={1.6} />
          Назад
        </button>
        <MicroLabel>проекция</MicroLabel>
        <span className="w-16" />
      </header>

      <div className="flex justify-center py-4 transition-all duration-500">
        <MACCard card={card} size={cardSize} showCaption />
      </div>

      <AnimatePresence mode="wait">
        {step === 'fields' && (
          <motion.div key="fields" {...fadeStep} className="flex-1 flex flex-col">
            <div className="mt-4">
              <MicroLabel className="text-muted mb-2">
                Что на карте?
              </MicroLabel>
              <textarea
                value={seeText}
                onChange={e => setSeeText(e.target.value)}
                placeholder="опиши, что видишь"
                rows={2}
                className="field-textarea"
              />
            </div>

            <div className="mt-5">
              <MicroLabel className="text-muted mb-2">
                Что ты чувствуешь, глядя на неё?
              </MicroLabel>
              <textarea
                value={feelText}
                onChange={e => setFeelText(e.target.value)}
                placeholder="без оценок, просто отклик"
                rows={2}
                className="field-textarea"
              />
            </div>

            <div className="flex-1" />
            <div className="mt-8">
              <button
                onClick={finishSession}
                disabled={!fieldsValid || loading}
                className="btn-primary w-full"
              >
                {loading ? 'Слушаем…' : 'Готово'}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col"
          >
            <MicroLabel className="text-accent text-center">
              сессия завершена
            </MicroLabel>

            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              {loading ? (
                <div className="flex flex-col items-center gap-3">
                  <LoadingDots />
                  <MicroLabel className="text-muted">собираем отражение…</MicroLabel>
                </div>
              ) : error ? (
                <p className="t-body">{error}</p>
              ) : (
                <p className="t-quote-sm max-w-md mx-auto">{reflection}</p>
              )}
            </div>

            {!loading && (
              <button onClick={onNewSession} className="btn-primary w-full">
                Новая сессия
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Stage>
  );
}
