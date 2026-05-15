import { useEffect, useRef } from 'react';

type Petal = {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  angle: number;
  spin: number;
  opacity: number;
  color: [number, number, number];
};

const PINK: [number, number, number] = [244, 212, 216];
const BEIGE: [number, number, number] = [232, 213, 196];

// Bias x toward edges: maps a uniform [0,1) sample to a U-curve favoring the
// outer thirds of the screen. Keeps the center clear so type stays unburdened.
function edgeBiasedX(width: number) {
  const r = Math.random();
  const sign = r < 0.5 ? -1 : 1;
  // raise to a power < 1 to push the value away from 0.5 toward the edges
  const dist = Math.pow(Math.abs(r - 0.5) * 2, 0.55);
  return width * 0.5 + sign * dist * width * 0.5;
}

function petalCount() {
  return window.innerWidth >= 1024 ? 18 : 22;
}

export default function PetalsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = window.devicePixelRatio || 1;

    let petals: Petal[] = [];
    let rafId: number | null = null;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const initPetals = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      petals = Array.from({ length: petalCount() }, () => ({
        x: edgeBiasedX(w),
        y: Math.random() * h,
        size: 9 + Math.random() * 14,
        vx: (Math.random() - 0.5) * 0.3,
        vy: 0.25 + Math.random() * 0.5,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.018,
        opacity: 0.2 + Math.random() * 0.3,
        color: Math.random() > 0.5 ? PINK : BEIGE,
      }));
    };

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const g = ctx.createRadialGradient(w / 2, h * 0.4, 0, w / 2, h * 0.4, w * 0.7);
      g.addColorStop(0, 'rgba(244, 212, 216, 0.25)');
      g.addColorStop(1, 'rgba(244, 212, 216, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      for (const p of petals) {
        if (!reduceMotion) {
          p.y += p.vy;
          p.x += p.vx + Math.sin(p.y * 0.008) * 0.45;
          p.angle += p.spin;

          if (p.y > h + 20) {
            p.y = -20;
            p.x = Math.random() * w;
          }
          if (p.x > w + 20) p.x = -20;
          if (p.x < -20) p.x = w + 20;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${p.opacity})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      rafId = requestAnimationFrame(draw);
    };

    const start = () => {
      if (rafId === null) rafId = requestAnimationFrame(draw);
    };
    const stop = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const onResize = () => {
      resize();
      initPetals();
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    resize();
    initPetals();
    start();

    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
}
