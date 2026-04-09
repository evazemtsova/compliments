import { Share2, Sparkles, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { compliments } from './lib/compliments';

type Mood = 'tired' | 'good' | null;

export default function App() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [aiCompliment, setAiCompliment] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [mood, setMood] = useState<Mood>(null);
  const [lastParams, setLastParams] = useState<{ name: string; mood: Mood } | null>(null);

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

  const displayedCompliment = aiCompliment ?? compliment;

  const generateAiCompliment = async (params?: { name: string; mood: Mood }) => {
    const p = params ?? lastParams ?? { name: '', mood: null };
    setLastParams(p);
    setLoading(true);
    setAiCompliment(null);
    try {
      const res = await fetch('/api/compliment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: p.name.trim(), mood: p.mood }),
      });
      const data = await res.json();
      setAiCompliment(data.compliment);
      setShowInput(false);
      setMood(null);
    } catch {
      setToastMessage('Что-то пошло не так');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSelect = (selectedMood: Mood) => {
    setMood(selectedMood);
    generateAiCompliment({ name, mood: selectedMood });
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

      {/* Mobile: полноэкранный оверлей для ввода имени и настроения */}
      <AnimatePresence>
        {showInput && (
          <motion.div
            className="sm:hidden fixed inset-0 z-20 flex flex-col justify-start pt-20 px-8 bg-[var(--color-surface)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="micro-label text-[var(--color-accent)] mb-10">персональный комплимент</div>
            <input
              autoFocus
              placeholder="Твоё имя..."
              value={name}
              onChange={e => setName(e.target.value)}
              className="editorial-headline text-3xl bg-transparent border-b border-[var(--color-line)] outline-none w-full pb-3 placeholder:text-[var(--color-text-muted)]"
            />
            <div className="flex flex-col mt-8">
              <div className="micro-label text-[var(--color-text-muted)] mb-4">как ты сейчас?</div>
              <button
                onClick={() => handleMoodSelect('tired')}
                className="micro-label text-left text-[var(--color-text-primary)] hover:text-[var(--color-accent)] active:text-[var(--color-accent)] transition-colors py-4 border-b border-[var(--color-line)] flex justify-between items-center"
              >
                немного устала
                <span className="text-[var(--color-text-muted)]">→</span>
              </button>
              <button
                onClick={() => handleMoodSelect('good')}
                className="micro-label text-left text-[var(--color-text-primary)] hover:text-[var(--color-accent)] active:text-[var(--color-accent)] transition-colors py-4 border-b border-[var(--color-line)] flex justify-between items-center"
              >
                всё хорошо
                <span className="text-[var(--color-text-muted)]">→</span>
              </button>
            </div>
            <button
              onClick={() => { setShowInput(false); setMood(null); }}
              className="micro-label text-[var(--color-text-muted)] hover:opacity-70 transition-opacity mt-8 self-start"
            >
              отмена
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-2 items-center"
            >
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          ) : (
            <motion.h1
              key={displayedCompliment}
              initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="editorial-headline text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[5.5rem] max-w-5xl mx-auto px-2 sm:px-4 text-balance"
            >
              {displayedCompliment}
            </motion.h1>
          )}
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

          {/* Mobile: всегда иконки, оверлей открывается отдельно */}
          <div className="sm:hidden flex items-center gap-2">
            <AnimatePresence>
              {aiCompliment && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => generateAiCompliment()}
                  disabled={loading}
                  className="hover:text-[var(--color-accent)] transition-colors text-[var(--color-text-muted)] p-2 rounded-full hover:bg-black/5"
                  aria-label="Ещё комплимент"
                >
                  <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
                </motion.button>
              )}
            </AnimatePresence>
            <button
              onClick={() => setShowInput(true)}
              className="hover:text-[var(--color-accent)] transition-colors text-[var(--color-text-muted)] p-2 rounded-full hover:bg-black/5"
              aria-label="Персональный комплимент"
            >
              <Sparkles className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Desktop: переключение между инпутом и иконками */}
          <div className="hidden sm:block">
            <AnimatePresence mode="wait">
              {showInput ? (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-3"
                >
                  <input
                    autoFocus
                    placeholder="Твоё имя..."
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="bg-transparent border-b border-[var(--color-line)] text-sm outline-none w-28 pb-0.5 placeholder:text-[var(--color-text-muted)] font-sans"
                  />
                  <span className="micro-label text-[var(--color-text-muted)]">—</span>
                  <button
                    onClick={() => handleMoodSelect('tired')}
                    className="micro-label text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors whitespace-nowrap"
                  >
                    немного устала
                  </button>
                  <span className="micro-label text-[var(--color-line)]">/</span>
                  <button
                    onClick={() => handleMoodSelect('good')}
                    className="micro-label text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors whitespace-nowrap"
                  >
                    всё хорошо
                  </button>
                  <button
                    onClick={() => { setShowInput(false); setMood(null); }}
                    className="micro-label text-[var(--color-text-muted)] hover:opacity-70 transition-opacity ml-1"
                  >
                    ✕
                  </button>
                </motion.div>
              ) : (
                <motion.div key="icons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                  <AnimatePresence>
                    {aiCompliment && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => generateAiCompliment()}
                        disabled={loading}
                        className="hover:text-[var(--color-accent)] transition-colors text-[var(--color-text-muted)] p-2 rounded-full hover:bg-black/5"
                        aria-label="Ещё комплимент"
                        title="Ещё один"
                      >
                        <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                  <button
                    onClick={() => setShowInput(true)}
                    className="hover:text-[var(--color-accent)] transition-colors text-[var(--color-text-muted)] p-2 rounded-full hover:bg-black/5"
                    aria-label="Персональный комплимент"
                    title="Персональный комплимент"
                  >
                    <Sparkles className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
