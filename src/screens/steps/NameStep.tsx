import { motion } from 'motion/react';
import { fadeStep } from '../../lib/motionPresets';

type Props = {
  name: string;
  setName: (n: string) => void;
  onNext: () => void;
};

export function NameStep({ name, setName, onNext }: Props) {
  const submit = () => {
    setName(name.trim());
    onNext();
  };

  return (
    <motion.section
      {...fadeStep}
      className="flex-1 flex items-center justify-center py-8 lg:py-0"
    >
      <div className="w-full max-w-[560px] mx-auto text-center">
        <h2 className="type-display mb-4">
          Как тебя <em>зовут?</em>
        </h2>
        <p className="type-body mb-8 max-w-md mx-auto">
          Имя нужно, чтобы слова звучали лично. Можно пропустить.
        </p>

        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="например, Ева"
          maxLength={40}
          className="field-input max-w-md mx-auto block"
        />

        <div className="flex flex-row gap-3 mt-12 sm:justify-center">
          <button
            onClick={() => {
              setName('');
              onNext();
            }}
            className="btn-secondary flex-1 sm:flex-none sm:min-w-[160px]"
          >
            Пропустить
          </button>
          <button
            onClick={submit}
            className="btn-primary flex-1 sm:flex-none sm:min-w-[180px]"
          >
            Дальше →
          </button>
        </div>
      </div>
    </motion.section>
  );
}
