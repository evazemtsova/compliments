import { todayInfo } from '../lib/date';

export function Header() {
  const t = todayInfo();
  return (
    <header className="relative z-10 flex justify-center px-5 sm:px-8 lg:px-12 pt-5 sm:pt-7">
      <div className="type-micro text-muted" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {t.dnum} {t.monthFull} {t.year}
      </div>
    </header>
  );
}
