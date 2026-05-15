import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Stage, StepIndicator } from '../components/ui';
import { type Mood } from '../lib/moods';
import { deck, drawCard, type Card } from '../lib/deck';
import { isFeelTag } from '../lib/feelings';
import { IntroStep } from './steps/IntroStep';
import { NameStep } from './steps/NameStep';
import { MoodStep } from './steps/MoodStep';
import { CardStep } from './steps/CardStep';
import { OfferingStep } from './steps/OfferingStep';
import { FeelTagsSheet } from '../components/FeelTagsSheet';

type Step = 0 | 1 | 2 | 3 | 4;

export type RitualResult = {
  name: string;
  mood: Mood;
  see: string;
  feel: string[];
  offering: string;
  cardId: string;
};

type Props = {
  initialName: string;
  initialMood?: Mood | null;
  initialSee?: string;
  initialFeel?: string[];
  initialOffering?: string | null;
  initialCardId?: string | null;
  onComplete: (result: RitualResult) => void;
  onNewSession: () => void;
};

export function RitualFlow({
  initialName,
  initialMood = null,
  initialSee = '',
  initialFeel = [],
  initialOffering = null,
  initialCardId = null,
  onComplete,
  onNewSession,
}: Props) {
  // Card draw happens at mount. Remount is triggered via sessionKey in App.tsx.
  const [card] = useState<Card>(() => {
    if (initialCardId) {
      const found = deck.find(c => c.id === initialCardId);
      if (found) return found;
    }
    return drawCard();
  });
  const hasSaved = !!(initialOffering && initialMood);
  const [step, setStep] = useState<Step>(hasSaved ? 4 : 0);
  const [name, setName] = useState(initialName);
  const [mood, setMood] = useState<Mood | null>(initialMood);
  const [seeText, setSeeText] = useState(initialSee);
  const [feelTags, setFeelTags] = useState<string[]>(() =>
    initialFeel.filter(isFeelTag)
  );
  const [offering, setOffering] = useState<string | null>(initialOffering);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareLabel, setShareLabel] = useState('Поделиться');
  const [feelMenuOpen, setFeelMenuOpen] = useState(false);

  const canProceed = seeText.trim().length >= 3 && feelTags.length >= 1;

  const toggleTag = (tag: string) => {
    setFeelTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const generateOffering = async () => {
    if (!mood) return;
    setLoading(true);
    setError(null);
    setOffering(null);
    setStep(4);
    try {
      const res = await fetch('/api/synthesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          mood: mood.id,
          card: { title: card.title, question: card.question },
          see: seeText.trim(),
          feel: feelTags.join(', '),
        }),
      });
      const data = await res.json();
      const text =
        (data.offering ?? '').trim() ||
        'В тебе есть тихое внимание к собственным образам — этого уже достаточно.';
      setOffering(text);
      onComplete({
        name: name.trim(),
        mood,
        see: seeText.trim(),
        feel: feelTags,
        offering: text,
        cardId: card.id,
      });
    } catch {
      setError('Не получилось дотянуться. Попробуй ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  const share = async () => {
    if (!offering) return;
    const text = `«${offering}»\n\n— Ежедневный комплимент`;
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
      }
      setShareLabel('Скопировано');
      setTimeout(() => setShareLabel('Поделиться'), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <Stage>
      <div className="min-h-[24px] flex items-center justify-center">
        {step > 0 && (
          <StepIndicator current={step as 1 | 2 | 3 | 4} total={4} />
        )}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <IntroStep key="s0" onStart={() => setStep(1)} />
        )}
        {step === 1 && (
          <NameStep
            key="s1"
            name={name}
            setName={setName}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <MoodStep
            key="s2"
            mood={mood}
            setMood={setMood}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <CardStep
            key="s3"
            card={card}
            seeText={seeText}
            setSeeText={setSeeText}
            feelTags={feelTags}
            openFeelMenu={() => setFeelMenuOpen(true)}
            onBack={() => setStep(2)}
            onNext={generateOffering}
            canProceed={canProceed}
          />
        )}
        {step === 4 && (
          <OfferingStep
            key="s4"
            card={card}
            name={name}
            offering={offering}
            loading={loading}
            error={error}
            shareLabel={shareLabel}
            onRetry={generateOffering}
            onShare={share}
            onFinish={onNewSession}
          />
        )}
      </AnimatePresence>

      <FeelTagsSheet
        open={feelMenuOpen}
        selected={feelTags}
        onToggle={toggleTag}
        onClose={() => setFeelMenuOpen(false)}
      />
    </Stage>
  );
}
