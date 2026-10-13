export function localDate(now: Date): string {
  if (!Number.isFinite(now.getTime())) throw new RangeError('Please pass a valid date.');
  const year = now.getFullYear().toString().padStart(4, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function validateDate(dayDate: string) {
  const date = new Date(`${dayDate}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dayDate) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== dayDate) {
    throw new RangeError(`Invalid local day: ${dayDate}`);
  }
}

// Work with calendar dates, not 24-hour periods: daylight-saving days can differ.
export function addDays(dayDate: string, amount: number): string {
  validateDate(dayDate);
  if (!Number.isInteger(amount)) throw new RangeError('Day steps must be whole numbers.');
  const date = new Date(`${dayDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function atLocalNoon(dayDate: string): Date {
  validateDate(dayDate);
  const [year, month, day] = dayDate.split('-').map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(12, 0, 0, 0);
  return date;
}
