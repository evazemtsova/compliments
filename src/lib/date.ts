// Day of year (1..366). Used as a stable key for "is this still today?"
// comparisons against localStorage.
export function dayOfYear(now: Date = new Date()): number {
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86_400_000);
}
