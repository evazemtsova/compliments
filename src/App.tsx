import { Fragment, useEffect, useState } from 'react';
import { RitualFlow, type RitualResult } from './screens/RitualFlow';
import PetalsBackground from './components/PetalsBackground';
import { Header } from './components/Header';
import { todayInfo } from './lib/date';
import { moodById, type Mood, type MoodId } from './lib/moods';
import { readLS, writeLS } from './lib/storage';

const K_NAME = 'compliment:name';
const K_DAY = 'compliment:onboardedDay';
const K_MOOD = 'compliment:todayMoodId';
const K_SEE = 'compliment:todaySee';
const K_FEEL = 'compliment:todayFeel';
const K_OFFER = 'compliment:todayOffering';

export default function App() {
  const today = todayInfo();
  const sameDay = parseInt(readLS(K_DAY) ?? '0', 10) === today.day;

  const [name, setName] = useState<string>(() => readLS(K_NAME) ?? '');
  const [savedMood] = useState<Mood | null>(() =>
    sameDay ? moodById(readLS(K_MOOD) as MoodId | null) : null
  );
  const [savedSee] = useState<string>(() => (sameDay ? readLS(K_SEE) ?? '' : ''));
  const [savedFeel] = useState<string>(() => (sameDay ? readLS(K_FEEL) ?? '' : ''));
  const [savedOffering] = useState<string | null>(() =>
    sameDay ? readLS(K_OFFER) : null
  );

  // Bumped on "Завершить ритуал" to force RitualFlow to remount with cleared state.
  const [sessionKey, setSessionKey] = useState(0);

  useEffect(() => {
    writeLS(K_NAME, name || null);
  }, [name]);

  const persist = (r: RitualResult) => {
    writeLS(K_NAME, r.name || null);
    writeLS(K_DAY, String(today.day));
    writeLS(K_MOOD, r.mood.id);
    writeLS(K_SEE, r.see);
    writeLS(K_FEEL, r.feel);
    writeLS(K_OFFER, r.offering);
  };

  const startNewSession = () => {
    writeLS(K_DAY, null);
    writeLS(K_MOOD, null);
    writeLS(K_SEE, null);
    writeLS(K_FEEL, null);
    writeLS(K_OFFER, null);
    setSessionKey(k => k + 1);
  };

  return (
    <>
      <PetalsBackground />
      <div className="min-h-[100dvh] flex flex-col relative">
        <div className="grain-overlay" />
        <Header />
        <main className="flex-1 flex flex-col relative z-10">
          <Fragment key={sessionKey}>
            <RitualFlow
              initialName={name}
              initialMood={savedMood}
              initialSee={savedSee}
              initialFeel={savedFeel}
              initialOffering={savedOffering}
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
