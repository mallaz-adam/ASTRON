import { describe, expect, it } from 'vitest';
import { addDays, atLocalNoon, localDate } from './dates';

describe('Local dates', () => {
  it('changes between 23:59 and 00:01 at local midnight', () => {
    expect(localDate(new Date(2026, 9, 13, 23, 59))).toBe('2026-10-13');
    expect(localDate(new Date(2026, 9, 14, 0, 1))).toBe('2026-10-14');
  });
  it('pads single-digit months and days', () => expect(localDate(new Date(2026, 0, 2, 12))).toBe('2026-01-02'));
  it.each([
    ['2026-12-31', 1, '2027-01-01'], ['2027-01-01', -1, '2026-12-31'],
    ['2024-02-28', 1, '2024-02-29'], ['2024-02-29', 1, '2024-03-01'],
    ['2026-02-28', 1, '2026-03-01'], ['2026-03-08', 1, '2026-03-09'],
    ['2026-11-01', 1, '2026-11-02'],
  ])('moves calendar day %s by %s', (date, amount, expected) => expect(addDays(date, amount)).toBe(expected));
  it('builds a pretend date at local noon', () => {
    const noon = atLocalNoon('2026-10-13');
    expect(localDate(noon)).toBe('2026-10-13');
    expect(noon.getHours()).toBe(12);
  });
  it('rejects an invalid clock value', () => expect(() => localDate(new Date('wrong'))).toThrow(RangeError));
  it.each(['2026-02-30', '2026-13-01', 'not-a-date', '2026-1-02'])('rejects invalid day %s', date => expect(() => addDays(date, 1)).toThrow(RangeError));
});
