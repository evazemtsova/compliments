import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { OnboardingFlow } from './screens/OnboardingFlow';
import { MetacardSession } from './screens/MetacardSession';
import PetalsBackground from './components/PetalsBackground';
import { todayInfo } from './lib/date';
import { moodById, type Mood, type MoodId } from './lib/moods';
import { readLS, writeLS } from './lib/storage';
import { fadeScreen } from './lib/motionPresets';

type Screen = 'onboarding' | 'metacard';

const KEY_NAME = 'compliment:name';
const KEY_DAY = 'compliment:onboardedDay';
const KEY_COMPL = 'compliment:todayCompliment';
const KEY_MOOD = 'compliment:todayMoodId';

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

  useEffect(() => {
    writeLS(KEY_NAME, name || null);
  }, [name]);

  const persistRitual = (n: string, m: Mood, c: string) => {
    writeLS(KEY_NAME, n || null);
    writeLS(KEY_DAY, String(today.day));
    writeLS(KEY_COMPL, c);
    writeLS(KEY_MOOD, m.id);
  };

  const startNewSession = () => {
    writeLS(KEY_DAY, null);
    writeLS(KEY_COMPL, null);
    writeLS(KEY_MOOD, null);
    setAiCompliment(null);
    setMood(null);
    setSessionKey(k => k + 1);
    setScreen('onboarding');
  };

  return (
    <>
      <PetalsBackground />
      <AnimatePresence mode="wait">
        {screen === 'onboarding' && (
          <motion.div key={`onboarding-${sessionKey}`} {...fadeScreen}>
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
              onNewSession={startNewSession}
            />
          </motion.div>
        )}

        {screen === 'metacard' && (
          <motion.div key="metacard" {...fadeScreen}>
            <MetacardSession
              name={name}
              onBack={() => setScreen('onboarding')}
              onNewSession={startNewSession}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
