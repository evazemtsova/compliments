import { Check } from 'lucide-react';
import { MicroLabel } from './ui';
import { FEEL_TAGS } from '../lib/feelings';

type Props = {
  open: boolean;
  selected: string[];
  onToggle: (tag: string) => void;
  onClose: () => void;
};

export function FeelTagsSheet({ open, selected, onToggle, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(26, 22, 18, 0.32)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      />
      <div
        onClick={e => e.stopPropagation()}
        className="glass-sheet relative w-full sm:max-w-md sm:mx-4 rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
        style={{ maxHeight: '80vh' }}
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: 'var(--color-line)',
            }}
          />
        </div>

        <div className="px-5 pt-3 sm:pt-6 pb-3">
          <MicroLabel className="text-muted">Что в тебе отзывается?</MicroLabel>
        </div>

        <div className="px-2 overflow-y-auto" style={{ minHeight: 0, flex: 1 }}>
          {FEEL_TAGS.map(tag => {
            const active = selected.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onToggle(tag)}
                className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl transition-colors"
                style={{
                  background: active ? 'rgba(163, 138, 88, 0.10)' : 'transparent',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  textAlign: 'left',
                }}
              >
                <span>{tag}</span>
                {active && (
                  <Check
                    className="w-4 h-4 shrink-0"
                    strokeWidth={2.2}
                    style={{ color: 'var(--color-accent)' }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div
          className="px-5 py-4 border-t"
          style={{ borderColor: 'var(--color-line)' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn-primary w-full"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
}
