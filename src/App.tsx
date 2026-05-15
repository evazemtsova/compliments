import { Fragment, useState } from 'react';
import { RitualFlow, type RitualResult } from './screens/RitualFlow';
import PetalsBackground from './components/PetalsBackground';
import { dayOfYear } from './lib/date';
import { moodById, type Mood, type MoodId } from './lib/moods';
import { readLS, writeLS } from './lib/storage';

const K_NAME = 'compliment:name';
const K_DAY = 'compliment:onboardedDay';
const K_MOOD = 'compliment:todayMoodId';
const K_SEE = 'compliment:todaySee';
const K_FEEL = 'compliment:todayFeel';
const K_OFFER = 'compliment:todayOffering';
const K_CARD = 'compliment:todayCardId';

export default function App() {
  const today = dayOfYear();
  const sameDay = parseInt(readLS(K_DAY) ?? '0', 10) === today;

  const [name, setName] = useState<string>(() => readLS(K_NAME) ?? '');
  const [savedMood] = useState<Mood | null>(() =>
    sameDay ? moodById(readLS(K_MOOD) as MoodId | null) : null
  );
  const [savedSee] = useState<string>(() => (sameDay ? readLS(K_SEE) ?? '' : ''));
  const [savedFeel] = useState<string[]>(() => {
    if (!sameDay) return [];
    const raw = readLS(K_FEEL);
    if (!raw) return [];
    return raw.split(',').map(s => s.trim()).filter(Boolean);
  });
  const [savedOffering] = useState<string | null>(() =>
    sameDay ? readLS(K_OFFER) : null
  );
  const [savedCardId] = useState<string | null>(() =>
    sameDay ? readLS(K_CARD) : null
  );

  // Bumped on "Завершить ритуал" to force RitualFlow to remount with cleared state.
  const [sessionKey, setSessionKey] = useState(0);

  const persist = (r: RitualResult) => {
    writeLS(K_NAME, r.name || null);
    writeLS(K_DAY, String(today));
    writeLS(K_MOOD, r.mood.id);
    writeLS(K_SEE, r.see);
    writeLS(K_FEEL, r.feel.join(', '));
    writeLS(K_OFFER, r.offering);
    writeLS(K_CARD, r.cardId);
  };

  const startNewSession = () => {
    writeLS(K_DAY, null);
    writeLS(K_MOOD, null);
    writeLS(K_SEE, null);
    writeLS(K_FEEL, null);
    writeLS(K_OFFER, null);
    writeLS(K_CARD, null);
    setSessionKey(k => k + 1);
  };

  return (
    <>
      <PetalsBackground />
      <div className="min-h-[100dvh] flex flex-col relative">
        <div className="grain-overlay" />
        <main className="flex-1 flex flex-col relative z-10">
          <Fragment key={sessionKey}>
            <RitualFlow
              initialName={name}
              initialMood={savedMood}
              initialSee={savedSee}
              initialFeel={savedFeel}
              initialOffering={savedOffering}
              initialCardId={savedCardId}
              onComplete={r => {
                setName(r.name);
                persist(r);
              }}
              onNewSession={startNewSession}
            />
          </Fragment>
        </main>
      </div>
    </>
  );
}
