import {
  CLOSE_HOUR,
  MAX_BOOKING_MINUTES,
  OPEN_HOUR,
  SLOT_MINUTES,
  type Booking,
  type FreeSlot,
} from '@roombook/shared';

export type Interval = { start: Date; end: Date };

const MINUTE = 60_000;
const pad = (n: number) => String(n).padStart(2, '0');
const dayOf = (d: Date) => d.toISOString().slice(0, 10);
const minuteOfDay = (d: Date) => d.getUTCHours() * 60 + d.getUTCMinutes();
const onGrid = (d: Date) => d.getTime() % (SLOT_MINUTES * MINUTE) === 0;

export function parseInterval(startsAt: string, endsAt: string): Interval {
  return { start: new Date(startsAt), end: new Date(endsAt) };
}

export function durationMinutes(i: Interval): number {
  return (i.end.getTime() - i.start.getTime()) / MINUTE;
}

export function validateInterval(i: Interval): string | null {
  if (Number.isNaN(i.start.getTime()) || Number.isNaN(i.end.getTime())) {
    return 'startsAt and endsAt must be valid date-times';
  }
  if (i.start >= i.end) return 'startsAt must be before endsAt';
  if (!onGrid(i.start) || !onGrid(i.end)) {
    return `Bookings must start and end on a ${SLOT_MINUTES}-minute boundary`;
  }
  if (dayOf(i.start) !== dayOf(i.end)) return 'A booking must start and end on the same day';
  if (minuteOfDay(i.start) < OPEN_HOUR * 60 || minuteOfDay(i.end) > CLOSE_HOUR * 60) {
    return `Bookings must be between ${pad(OPEN_HOUR)}:00 and ${pad(CLOSE_HOUR)}:00 UTC`;
  }
  if (durationMinutes(i) > MAX_BOOKING_MINUTES) {
    return `A booking can be at most ${MAX_BOOKING_MINUTES} minutes long`;
  }
  return null;
}

export function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}

export function freeSlots(date: string, bookings: Booking[]): FreeSlot[] {
  const open = new Date(`${date}T${pad(OPEN_HOUR)}:00:00.000Z`).getTime();
  const close = new Date(`${date}T${pad(CLOSE_HOUR)}:00:00.000Z`).getTime();
  const busy = bookings
    .map((b) => parseInterval(b.startsAt, b.endsAt))
    .sort((x, y) => x.start.getTime() - y.start.getTime());
  const free: FreeSlot[] = [];
  let cursor = open;
  for (const { start, end } of busy) {
    const from = Math.max(start.getTime(), open);
    if (from > cursor) {
      free.push({
        startsAt: new Date(cursor).toISOString(),
        endsAt: new Date(Math.min(from, close)).toISOString(),
      });
    }
    cursor = Math.max(cursor, Math.min(end.getTime(), close));
    if (cursor >= close) break;
  }
  if (cursor < close) {
    free.push({ startsAt: new Date(cursor).toISOString(), endsAt: new Date(close).toISOString() });
  }
  return free;
}
