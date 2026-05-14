import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { OnboardingFlow } from './screens/OnboardingFlow';
import { MetacardSession } from './screens/MetacardSession';
import { todayInfo } from './lib/date';
import { moodById, type Mood, type MoodId } from './lib/moods';

type Screen = 'onboarding' | 'metacard';

const KEY_NAME = 'compliment:name';
const KEY_DAY = 'compliment:onboardedDay';
const KEY_COMPL = 'compliment:todayCompliment';
const KEY_MOOD = 'compliment:todayMoodId';

function readLS(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeLS(key: string, val: string | null) {
  try {
    if (val === null) localStorage.removeItem(key);
    else localStorage.setItem(key, val);
  } catch {
    /* ignore */
  }
}

export default function App() {
  const today = todayInfo();
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [name, setName] = useState<string>(() => readLS(KEY_NAME) ?? '');
  const [aiCompliment, setAiCompliment] = useState<string | null>(() => {
    const day = parseInt(readLS(KEY_DAY) ?? '0', 10);
    return day === today.day ? readLS(KEY_COMPL) : null;
  });
  const [mood, setMood] = useState<Mood | null>(() => {
    const day = parseInt(readLS(KEY_DAY) ?? '0', 10);
    return day === today.day ? moodById(readLS(KEY_MOOD) as MoodId | null) : null;
  });
  // Bumped on "Новая сессия" to force OnboardingFlow to remount with cleared state.
  const [sessionKey, setSessionKey] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    writeLS(KEY_NAME, name || null);
  }, [name]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const persistRitual = (n: string, m: Mood, c: string) => {
    writeLS(KEY_NAME, n || null);
    writeLS(KEY_DAY, String(today.day));
    writeLS(KEY_COMPL, c);
    writeLS(KEY_MOOD, m.id);
  };

  const clearRitual = () => {
    writeLS(KEY_DAY, null);
    writeLS(KEY_COMPL, null);
    writeLS(KEY_MOOD, null);
    setAiCompliment(null);
    setMood(null);
  };

  const handleShare = async (text: string) => {
    const payload = `«${text}»\n— Персональный комплимент`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Ежедневный комплимент', text: payload });
        return;
      } catch {
        /* fall through to clipboard */
      }
    }
    try {
      await navigator.clipboard.writeText(payload);
      showToast('Текст скопирован');
    } catch {
      showToast('Не получилось скопировать');
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {screen === 'onboarding' && (
          <motion.div
            key={`onboarding-${sessionKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <OnboardingFlow
              initialName={name}
              initialMood={mood}
              initialCompliment={aiCompliment}
              onComplimentReady={({ name: n, mood: m, compliment }) => {
                setName(n);
                setMood(m);
                setAiCompliment(compliment);
                persistRitual(n, m, compliment);
              }}
              onMetacard={({ name: n, mood: m, compliment }) => {
                setName(n);
                setMood(m);
                setAiCompliment(compliment);
                persistRitual(n, m, compliment);
                setScreen('metacard');
              }}
              onShare={handleShare}
            />
          </motion.div>
        )}

        {screen === 'metacard' && (
          <motion.div
            key="metacard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <MetacardSession
              name={name}
              mood={mood}
              onBack={() => setScreen('onboarding')}
              onNewSession={() => {
                clearRitual();
                setSessionKey(k => k + 1);
                setScreen('onboarding');
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-2.5 rounded-full micro shadow-2xl"
            style={{
              background: 'var(--color-text-primary)',
              color: 'var(--color-surface)',
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
