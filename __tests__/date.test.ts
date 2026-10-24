import {
  dayOfYear,
  formatHeaderDate,
  formatShortDate,
  nextOccurrence,
  todayKey,
} from '../src/utils/date';

describe('date utils', () => {
  it('builds a local day key', () => {
    expect(todayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('computes the day of the year', () => {
    expect(dayOfYear(new Date(2026, 0, 1))).toBe(1);
    expect(dayOfYear(new Date(2026, 11, 31))).toBe(365);
    expect(dayOfYear(new Date(2028, 11, 31))).toBe(366);
  });

  it('formats dates for display', () => {
    expect(formatHeaderDate(new Date(2026, 9, 24))).toBe(
      'Saturday · October 24',
    );
    expect(formatShortDate(new Date(2026, 9, 24, 12).toISOString())).toBe(
      'Oct 24, 2026',
    );
    expect(formatShortDate('not a date')).toBe('');
  });

  it('schedules the next reminder today or tomorrow', () => {
    const early = new Date(2026, 9, 24, 6, 0);
    const late = new Date(2026, 9, 24, 9, 0);
    expect(nextOccurrence(7, 0, early).getDate()).toBe(24);
    expect(nextOccurrence(7, 0, late).getDate()).toBe(25);
    expect(nextOccurrence(7, 0, late).getHours()).toBe(7);
  });
});
