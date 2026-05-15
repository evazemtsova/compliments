import type { Card } from '../lib/deck';

type Size = 'sm' | 'md' | 'lg';

const widths: Record<Size, string> = {
  sm: '160px',
  md: '220px',
  lg: 'clamp(240px, 26vw, 340px)',
};

const ASPECT = 180 / 248;

export function MACCard({
  card,
  size = 'md',
  showCaption = true,
}: {
  card: Card;
  size?: Size;
  showCaption?: boolean;
}) {
  const w = widths[size];

  return (
    <figure
      className="relative shrink-0 transition-all duration-500 ease-out"
      style={{ width: w }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          width: '100%',
          aspectRatio: `${ASPECT}`,
          borderRadius: 10,
          background: 'var(--color-card)',
          border: '1px solid var(--color-line)',
          boxShadow:
            '0 28px 56px -22px rgba(20,15,8,0.32), 0 10px 20px -10px rgba(20,15,8,0.22)',
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
          <div className="type-caption">«{card.title}»</div>
        </figcaption>
      )}
    </figure>
  );
}
