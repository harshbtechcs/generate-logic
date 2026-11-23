/** Date helpers in India time (UTC+05:30, no daylight saving). */
const IST_OFFSET_MS = 330 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** India date of an instant, as YYYY-MM-DD. */
export function istDayKey(date: Date = new Date()) {
  return new Date(date.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** The day before a YYYY-MM-DD key. */
export function previousDayKey(key: string) {
  return new Date(Date.parse(`${key}T00:00:00Z`) - DAY_MS).toISOString().slice(0, 10);
}

/** The instant India's next midnight happens (when the next daily challenge opens). */
export function nextIstMidnight(now: Date = new Date()) {
  const startToday = Date.parse(`${istDayKey(now)}T00:00:00Z`) - IST_OFFSET_MS;
  return new Date(startToday + DAY_MS);
}

/** Monday 00:00 India time of the current week, as a UTC instant. */
export function istWeekStart(now: Date = new Date()) {
  const key = istDayKey(now);
  const midnight = Date.parse(`${key}T00:00:00Z`); // India midnight, expressed as if UTC
  const dow = new Date(midnight).getUTCDay(); // 0 = Sunday
  const daysSinceMonday = (dow + 6) % 7;
  return new Date(midnight - daysSinceMonday * DAY_MS - IST_OFFSET_MS);
}

/** Length of the run of consecutive days ending today (or yesterday, if today isn't done yet). */
export function streakFromDays(days: Iterable<string>, today: string = istDayKey()) {
  const set = new Set(days);
  let day = set.has(today) ? today : previousDayKey(today);
  let streak = 0;
  while (set.has(day)) {
    streak++;
    day = previousDayKey(day);
  }
  return streak;
}
