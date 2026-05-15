import { motion } from 'motion/react';
import { MicroLabel } from '../../components/ui';
import PhyllotaxisOrb from '../../components/PhyllotaxisOrb';
import { fadeStep } from '../../lib/motionPresets';

type Props = { onStart: () => void };

export function IntroStep({ onStart }: Props) {
  return (
    <motion.section
      {...fadeStep}
      className="flex-1 flex items-center justify-center py-8 lg:py-0"
    >
      <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-14 items-center justify-center">
        <div className="shrink-0">
          <div className="lg:hidden">
            <PhyllotaxisOrb size={240} />
          </div>
          <div className="hidden lg:block">
            <PhyllotaxisOrb size={360} />
          </div>
        </div>

        <div className="max-w-[520px] text-center lg:text-left">
          <MicroLabel className="text-accent mb-5 lg:mb-7">
            Тихий ритуал самоподдержки
          </MicroLabel>
          <h1 className="type-display mb-4">
            Это только твоя <em>минута...</em>
          </h1>
          <p className="type-body max-w-md mx-auto lg:mx-0">
            Четыре тихих шага: настроишься, посмотришь на одну карту, и слова,
            родившиеся из твоего же взгляда, вернутся к тебе
          </p>
          <div className="mt-8">
            <button
              onClick={onStart}
              className="btn-primary w-full sm:w-auto sm:px-12"
            >
              Начать ритуал
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
