import type { Card } from '../lib/deck';

type Size = 'sm' | 'md' | 'lg';

const dims: Record<Size, { w: number; h: number }> = {
  sm: { w: 180, h: 248 },
  md: { w: 240, h: 332 },
  lg: { w: 300, h: 414 },
};

export function MACCard({
  card,
  size = 'md',
  showCaption = true,
}: {
  card: Card;
  size?: Size;
  showCaption?: boolean;
}) {
  const { w, h } = dims[size];

  return (
    <figure
      className="relative shrink-0 transition-all duration-500 ease-out"
      style={{ width: w }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          width: w,
          height: h,
          borderRadius: 10,
          background: 'var(--color-card)',
          border: '1px solid var(--color-line)',
          boxShadow:
            '0 24px 48px -20px rgba(20,15,8,0.3), 0 8px 18px -8px rgba(20,15,8,0.2)',
        }}
      >
        <img
          src={card.url}
          alt={card.title}
          loading="lazy"
          className="block w-full h-full object-cover"
          draggable={false}
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none mix-blend-multiply"
          style={{
            opacity: 0.18,
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
          }}
        />
      </div>

      {showCaption && (
        <figcaption className="text-center mt-3 px-1">
          <div className="t-caption">«{card.title}»</div>
          <div className="t-hint mt-0.5" style={{ fontSize: 10.5, letterSpacing: '0.04em' }}>
            {card.artist} · {card.year}
          </div>
        </figcaption>
      )}
    </figure>
  );
}
