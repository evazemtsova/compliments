import { motion } from 'motion/react';
import { LoadingDots, MicroLabel } from '../../components/ui';
import { MACCard } from '../../components/MACCard';
import PhyllotaxisOrb from '../../components/PhyllotaxisOrb';
import { type Card } from '../../lib/deck';
import { fadeStep } from '../../lib/motionPresets';

type Props = {
  card: Card;
  name: string;
  offering: string | null;
  loading: boolean;
  error: string | null;
  shareLabel: string;
  onRetry: () => void;
  onShare: () => void;
  onFinish: () => void;
};

export function OfferingStep({
  card,
  name,
  offering,
  loading,
  error,
  shareLabel,
  onRetry,
  onShare,
  onFinish,
}: Props) {
  return (
    <motion.section
      {...fadeStep}
      className="flex-1 flex items-center justify-center py-4 lg:py-6"
    >
      <div className="w-full max-w-[820px] mx-auto text-center">
        {loading ? (
          <div className="flex flex-col items-center gap-5">
            <PhyllotaxisOrb size={180} />
            <LoadingDots />
            <MicroLabel className="text-muted">собираем слова…</MicroLabel>
          </div>
        ) : error ? (
          <div className="w-full">
            <p className="type-body mb-5">{error}</p>
            <button onClick={onRetry} className="btn-primary">
              Попробовать снова
            </button>
          </div>
        ) : (
          <div className="fade-up flex flex-col items-center">
            <div className="mb-5 lg:mb-7">
              <MACCard card={card} size="sm" showCaption={false} />
            </div>

            {name && (
              <div className="type-display mb-5 lg:mb-6">
                <em>{name},</em>
              </div>
            )}

            <p
              className="type-display"
              style={{ fontSize: 'clamp(22px, 3.6vw, 40px)' }}
            >
              <span className="text-accent italic">«</span>
              {offering}
              <span className="text-accent italic">»</span>
            </p>

            <div className="mt-8 lg:mt-10 flex items-center justify-center gap-7">
              <button onClick={onShare} className="action-link">
                {shareLabel}
              </button>
              <button onClick={onFinish} className="btn-ghost">
                Завершить ритуал
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}
