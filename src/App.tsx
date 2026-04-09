import { Share2, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { compliments } from './lib/compliments';

export default function App() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [aiCompliment, setAiCompliment] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [showInput, setShowInput] = useState(false);

  const { dayOfYear, formattedDate, compliment } = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    const dateStr = now.toLocaleDateString('ru-RU', options).toUpperCase().replace(' Г.', '');
    const text = compliments[(day - 1) % compliments.length];
    return { dayOfYear: day, formattedDate: dateStr, compliment: text };
  }, []);

  // Показываем AI-комплимент если он есть, иначе дневной
  const displayedCompliment = aiCompliment ?? compliment;

  const generateAiCompliment = async () => {
    setLoading(true);
    setAiCompliment(null);
    try {
      const res = await fetch('/api/compliment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      setAiCompliment(data.compliment);
      setShowInput(false);
    } catch {
      setToastMessage('Что-то пошло не так');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const textToShare = `"${displayedCompliment}"\n— Ежедневный комплимент, День ${dayOfYear}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Ежедневный комплимент', text: textToShare });
      } catch {
        copyToClipboard(textToShare);
      }
    } else {
      copyToClipboard(textToShare);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToastMessage('Текст скопирован');
      setTimeout(() => setToastMessage(null), 3000);
    } catch {
      console.error('Failed to copy');
    }
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col justify-between p-5 sm:p-8 md:p-12 lg:p-16 relative overflow-hidden bg-[var(--color-surface)] text-[var(--color-text-primary)] selection:bg-[var(--color-accent)] selection:text-white">
      <div className="grain-overlay"></div>

      {/* Header */}
      <header className="flex justify-between items-start w-full z-10 shrink-0">
        <div className="flex items-start h-12 sm:h-16 md:h-24">
          <div className="w-[1px] h-full bg-[var(--color-line)] mr-4 md:mr-8"></div>
          <div className="micro-label text-[var(--color-accent)] pt-1">
            {aiCompliment ? 'Персональный комплимент' : 'Ежедневный комплимент'}
          </div>
        </div>
        <div className="micro-label text-[var(--color-text-muted)] pt-1 tracking-[0.2em]">{formattedDate}</div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center w-full py-6 sm:py-8 min-h-0 z-10">
        <AnimatePresence mode="wait">
          <motion.h1
            key={displayedCompliment}
            initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="editorial-headline text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[5.5rem] max-w-5xl mx-auto px-2 sm:px-4 text-balance"
          >
            {loading ? '...' : displayedCompliment}
          </motion.h1>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="flex justify-between items-end w-full z-10 shrink-0">
        <div className="flex items-center gap-4 sm:gap-6 pb-2">
          <button
            onClick={handleShare}
            className="hover:text-[var(--color-accent)] transition-colors text-[var(--color-text-muted)] p-2 -ml-2 rounded-full hover:bg-black/5"
            aria-label="Поделиться"
          >
            <Share2 className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <div className="micro-label text-[var(--color-text-muted)]">
            ДЕНЬ {dayOfYear} ИЗ 365
          </div>

          {/* AI кнопка */}
          <AnimatePresence>
            {showInput ? (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                <input
                  autoFocus
                  placeholder="Твоё имя..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && generateAiCompliment()}
                  className="bg-transparent border-b border-[var(--color-line)] text-sm outline-none w-28 pb-0.5 placeholder:text-[var(--color-text-muted)] font-sans"
                />
                <button
                  onClick={generateAiCompliment}
                  disabled={loading}
                  className="micro-label text-[var(--color-accent)] hover:opacity-70 transition-opacity"
                >
                  {loading ? '...' : '→'}
                </button>
                <button
                  onClick={() => setShowInput(false)}
                  className="micro-label text-[var(--color-text-muted)] hover:opacity-70 transition-opacity"
                >
                  ✕
                </button>
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowInput(true)}
                className="hover:text-[var(--color-accent)] transition-colors text-[var(--color-text-muted)] p-2 rounded-full hover:bg-black/5"
                aria-label="Персональный комплимент"
                title="Получить персональный комплимент"
              >
                <Sparkles className="w-5 h-5" strokeWidth={1.5} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="w-[1px] h-12 sm:h-16 md:h-24 bg-[var(--color-line)]"></div>
      </footer>

      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-text-primary)] text-[var(--color-surface)] px-6 py-3 rounded-full micro-label shadow-2xl"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
