import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { MACCard } from '../../components/MACCard';
import { type Card } from '../../lib/deck';
import { fadeStep } from '../../lib/motionPresets';

type Props = {
  card: Card;
  seeText: string;
  setSeeText: (s: string) => void;
  feelTags: string[];
  openFeelMenu: () => void;
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
};

export function CardStep({
  card,
  seeText,
  setSeeText,
  feelTags,
  openFeelMenu,
  onBack,
  onNext,
  canProceed,
}: Props) {
  return (
    <motion.section
      {...fadeStep}
      className="flex-1 flex flex-col py-2 lg:py-4"
    >
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
              onClick={openFeelMenu}
              className="glass-pill w-full max-w-[360px] rounded-full flex items-center justify-between gap-2 transition-all duration-200"
              style={{
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
              <ChevronDown className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex flex-row gap-3 mt-2">
            <button
              onClick={onBack}
              className="btn-secondary flex-1 sm:flex-none sm:min-w-[140px]"
            >
              ← Назад
            </button>
            <button
              onClick={onNext}
              disabled={!canProceed}
              className="btn-primary flex-1 sm:flex-none sm:min-w-[220px]"
            >
              <span className="sm:hidden">Для тебя →</span>
              <span className="hidden sm:inline">Слова для тебя →</span>
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
