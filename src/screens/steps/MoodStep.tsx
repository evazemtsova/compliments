import { motion } from 'motion/react';
import { MOODS, type Mood } from '../../lib/moods';
import { fadeStep } from '../../lib/motionPresets';

type Props = {
  mood: Mood | null;
  setMood: (m: Mood) => void;
  onBack: () => void;
  onNext: () => void;
};

export function MoodStep({ mood, setMood, onBack, onNext }: Props) {
  return (
    <motion.section
      {...fadeStep}
      className="flex-1 flex items-center justify-center py-8 lg:py-0"
    >
      <div className="w-full max-w-[480px] mx-auto text-center">
        <h2 className="type-display mb-8">
          Как ты <em>сейчас?</em>
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {MOODS.map(m => {
            const active = mood?.id === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMood(m)}
                className="flex flex-col items-center gap-2 transition-transform duration-200"
                style={{ transform: active ? 'scale(1.03)' : 'scale(1)' }}
              >
                <div
                  className="w-full rounded-2xl overflow-hidden transition-all duration-200"
                  style={{
                    border: `2px solid ${active ? 'var(--color-accent)' : 'transparent'}`,
                    boxShadow: active
                      ? '0 12px 28px -12px rgba(163, 138, 88, 0.4)'
                      : '0 6px 18px -12px rgba(26, 22, 18, 0.2)',
                  }}
                >
                  <img
                    src={m.image}
                    alt={m.label}
                    loading="lazy"
                    draggable={false}
                    className="block w-full h-auto"
                  />
                </div>
                <span className="type-micro text-muted">{m.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-row gap-3 mt-10 sm:justify-center">
          <button
            onClick={onBack}
            className="btn-secondary flex-1 sm:flex-none sm:min-w-[160px]"
          >
            ← Назад
          </button>
          <button
            onClick={() => mood && onNext()}
            disabled={!mood}
            className="btn-primary flex-1 sm:flex-none sm:min-w-[180px]"
          >
            Дальше →
          </button>
        </div>
      </div>
    </motion.section>
  );
}
