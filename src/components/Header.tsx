import { todayInfo } from '../lib/date';

export function Header() {
  const t = todayInfo();
  return (
    <header className="relative z-10 flex items-center justify-between px-5 sm:px-8 lg:px-12 pt-5 sm:pt-7">
      <div className="micro text-muted">Ежедневный комплимент</div>
      <div className="micro text-muted hidden sm:block" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {t.dnum} {t.monthFull} {t.year}
      </div>
    </header>
  );
}
