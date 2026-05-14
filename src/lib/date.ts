const MONTH_RU_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const MONTH_RU_FULL  = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const DOW_RU_FULL    = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];

export type DayInfo = {
  day: number;       // 1..366
  dnum: number;      // 1..31
  monthShort: string;
  monthFull: string;
  year: number;
  dow: string;
};

export function todayInfo(now: Date = new Date()): DayInfo {
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const day = Math.floor(diff / 86_400_000);
  return {
    day,
    dnum: now.getDate(),
    monthShort: MONTH_RU_SHORT[now.getMonth()],
    monthFull: MONTH_RU_FULL[now.getMonth()],
    year: now.getFullYear(),
    dow: DOW_RU_FULL[now.getDay()],
  };
}
