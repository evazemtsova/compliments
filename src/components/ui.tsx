import type { ReactNode } from 'react';
import { motion } from 'motion/react';

export function Stage({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 flex flex-col w-full px-5 sm:px-8 lg:px-12 py-4 sm:py-8 relative">
      <div className="w-full max-w-[1200px] mx-auto flex-1 flex flex-col relative z-10">
        {children}
      </div>
    </div>
  );
}

export function MicroLabel({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`type-micro ${className}`}>{children}</div>;
}

export function StepIndicator({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      {Array.from({ length: total }).map((_, i) => {
        const idx = i + 1;
        const isCurrent = idx === current;
        const isPast = idx < current;
        const fill = isPast || isCurrent ? 'var(--color-accent)' : 'var(--color-line)';
        return (
          <motion.svg
            key={i}
            viewBox="0 0 12 18"
            width={14}
            height={20}
            initial={false}
            animate={{
              scale: isCurrent ? 1 : isPast ? 0.68 : 0.52,
              opacity: isCurrent ? 1 : isPast ? 0.55 : 0.35,
              rotate: isCurrent ? 0 : isPast ? -18 : 8,
            }}
            transition={{
              type: 'spring',
              damping: 14,
              stiffness: 170,
              mass: 0.6,
            }}
            style={{ overflow: 'visible', transformOrigin: '50% 90%' }}
            aria-hidden
          >
            <path
              d="M6 1 C 10.5 5 10.5 12 6 17 C 1.5 12 1.5 5 6 1 Z"
              fill={fill}
            />
          </motion.svg>
        );
      })}
    </div>
  );
}

export function LoadingDots() {
  return (
    <div className="flex gap-1.5 items-center">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]"
          style={{
            animation: `pulseDot 1.2s ${i * 0.2}s infinite ease-in-out`,
          }}
        />
      ))}
    </div>
  );
}

