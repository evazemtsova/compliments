import type { ReactNode } from 'react';

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
  const pct = (current / total) * 100;
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <div className="flex items-center gap-4 mb-12">
      <span
        className="type-micro text-accent"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {pad(current)}
      </span>
      <div className="relative h-px flex-1 max-w-[200px]">
        <div
          className="absolute inset-0"
          style={{ background: 'var(--color-line)' }}
        />
        <div
          className="absolute inset-y-0 left-0 transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, background: 'var(--color-accent)' }}
        />
      </div>
      <span
        className="type-micro text-muted"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {pad(total)}
      </span>
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

export function MoodOrb({ hue, size = 28 }: { hue: number; size?: number }) {
  return (
    <span
      className="rounded-full inline-block shrink-0"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 35% 30%, oklch(0.88 0.08 ${hue}), oklch(0.55 0.10 ${(hue + 30) % 360}))`,
      }}
    />
  );
}
