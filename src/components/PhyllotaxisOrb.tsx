import { useEffect, useRef } from 'react';

const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const PETAL_COUNT = 220;

const PALETTE: [number, number, number][] = [
  [244, 200, 204],
  [217, 155, 162],
  [232, 213, 196],
  [212, 165, 116],
  [253, 234, 234],
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function colorAt(ratio: number): [number, number, number] {
  const cIdx = ratio * (PALETTE.length - 1);
  const i1 = Math.floor(cIdx);
  const i2 = Math.min(i1 + 1, PALETTE.length - 1);
  const f = cIdx - i1;
  return [
    lerp(PALETTE[i1][0], PALETTE[i2][0], f),
    lerp(PALETTE[i1][1], PALETTE[i2][1], f),
    lerp(PALETTE[i1][2], PALETTE[i2][2], f),
  ];
}

interface PhyllotaxisOrbProps {
  size?: number;
  className?: string;
}

export default function PhyllotaxisOrb({ size = 368, className }: PhyllotaxisOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = window.devicePixelRatio || 1;
    const t0 = performance.now();

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = size / 2;
    const cy = size / 2;
    const maxRadius = size * 0.435;
    // Petal scaling: keeps petals visually consistent across sizes; identity at 368.
    const petalScale = size / 368;

    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, size, size);

      const bloom = reduceMotion ? 0.5 : (Math.sin(t * 0.3) + 1) / 2;
      const rot = reduceMotion ? 0 : t * 0.15;

      for (let i = 0; i < PETAL_COUNT; i++) {
        const ratio = i / PETAL_COUNT;
        const angle = i * GOLDEN + rot;
        // sqrt(ratio) is critical — without it petals clump in the center
        const r = Math.sqrt(ratio) * maxRadius * (0.3 + bloom * 0.7);
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        const petalSize = (3 + ratio * 13) * petalScale;
        const [cR, cG, cB] = colorAt(ratio);
        const alpha = 0.6 - ratio * 0.2;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI / 2);
        ctx.fillStyle = `rgba(${cR | 0}, ${cG | 0}, ${cB | 0}, ${alpha})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, petalSize * 0.5, petalSize, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    const onVisibility = () => {
      if (document.hidden) {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      } else if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ display: 'block' }}
    />
  );
}
