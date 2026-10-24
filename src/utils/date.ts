const DAY_MS = 24 * 60 * 60 * 1000;

/** Local calendar day key, e.g. "2026-10-24". */
export function todayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 1-based day of the year in local time (DST-safe). */
export function dayOfYear(date: Date = new Date()): number {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const current = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((current - start) / DAY_MS);
}

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** "Saturday · October 24" — formatted without relying on Intl support. */
export function formatHeaderDate(date: Date = new Date()): string {
  return `${WEEKDAYS[date.getDay()]} · ${
    MONTHS[date.getMonth()]
  } ${date.getDate()}`;
}

/** "Oct 24, 2026" */
export function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return `${MONTHS[date.getMonth()].slice(
    0,
    3,
  )} ${date.getDate()}, ${date.getFullYear()}`;
}

/** Next occurrence of hour:minute in local time (today if still ahead, else tomorrow). */
export function nextOccurrence(
  hour: number,
  minute: number,
  now: Date = new Date(),
): Date {
  const next = new Date(now);
  next.setHours(hour, minute, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}
