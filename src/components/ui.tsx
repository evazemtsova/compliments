import type { ReactNode } from 'react';

export function Stage({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center px-5 sm:px-8 py-6 sm:py-10 relative">
      <div className="grain-overlay" />
      <div className="w-full max-w-[680px] flex-1 flex flex-col relative z-10">
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
  return <div className={`micro ${className}`}>{children}</div>;
}

export function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="h-[5px] rounded-full transition-all duration-300"
          style={{
            width: i === current ? 18 : 5,
            background: i <= current ? 'var(--color-accent)' : 'var(--color-line)',
          }}
        />
      ))}
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

export function ProgressThread({ progress }: { progress: number }) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <div className="relative h-[18px] w-full">
      <div
        className="absolute top-[9px] left-0 right-0 h-px"
        style={{ background: 'var(--color-line)' }}
      />
      <div
        className="absolute top-[9px] left-0 h-px transition-all duration-500"
        style={{ width: `${pct}%`, background: 'var(--color-accent)' }}
      />
      <div
        className="absolute top-[4px] rounded-full"
        style={{
          left: `calc(${pct}% - 5px)`,
          width: 11,
          height: 11,
          background: 'var(--color-accent)',
          boxShadow:
            '0 0 0 4px var(--color-surface), 0 0 0 5px color-mix(in oklch, var(--color-accent) 30%, transparent)',
        }}
      />
    </div>
  );
}
