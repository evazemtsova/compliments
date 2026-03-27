import { Share2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { compliments } from './lib/compliments';

export default function App() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { dayOfYear, formattedDate, compliment } = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    const dateStr = now.toLocaleDateString('ru-RU', options).toUpperCase().replace(' Г.', '');
    
    const text = compliments[(day - 1) % compliments.length];

    return {
      dayOfYear: day,
      formattedDate: dateStr,
      compliment: text,
    };
  }, []);

  const handleShare = async () => {
    const textToShare = `"${compliment}"\n— Дневное Сияние, День ${dayOfYear}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Дневное Сияние',
          text: textToShare,
        });
      } catch (err) {
        // User canceled or share failed, fallback to clipboard
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
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 md:p-12 lg:p-16 relative overflow-hidden bg-[var(--color-surface)] text-[var(--color-text-primary)] selection:bg-[var(--color-accent)] selection:text-white">
      {/* Grain Texture Overlay */}
      <div className="grain-overlay"></div>

      {/* Header - Swiss Style with Structural Line */}
      <header className="flex justify-between items-start w-full z-10">
        <div className="flex items-start h-24">
          <div className="w-[1px] h-full bg-[var(--color-line)] mr-5 md:mr-8"></div>
          <div className="micro-label text-[var(--color-accent)] pt-1">ДНЕВНОЕ СИЯНИЕ</div>
        </div>
        <div className="micro-label text-[var(--color-text-muted)] pt-1 tracking-[0.2em]">{formattedDate}</div>
      </header>

      {/* Main Content - Centered, Elegant Typography */}
      <main className="flex-1 flex items-center justify-center w-full py-16 md:py-24 z-10">
        <motion.h1 
          initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="editorial-headline text-center text-4xl md:text-6xl lg:text-[5.5rem] max-w-5xl mx-auto px-4"
        >
          {compliment}
        </motion.h1>
      </main>

      {/* Footer - Minimalist */}
      <footer className="flex justify-between items-end w-full z-10">
        <div className="flex items-center gap-6 pb-2">
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
        </div>
        
        {/* Right Structural Line for Balance */}
        <div className="w-[1px] h-24 bg-[var(--color-line)]"></div>
      </footer>

      {/* Elegant Toast Notification */}
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

