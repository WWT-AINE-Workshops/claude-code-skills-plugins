import { describe, expect, it } from 'vitest';
import {
  durationMinutes,
  freeSlots,
  overlaps,
  parseInterval,
  validateInterval,
} from '../src/booking-rules';

const at = (start: string, end: string, date = '2026-11-02') =>
  parseInterval(`${date}T${start}:00.000Z`, `${date}T${end}:00.000Z`);

describe('overlaps', () => {
  it.each([
    ['the same slot', ['09:00', '10:00'], ['09:00', '10:00'], true],
    ['one inside the other', ['09:00', '11:00'], ['09:30', '10:00'], true],
    ['a partial overlap at the start', ['09:30', '10:30'], ['09:00', '10:00'], true],
    ['a partial overlap at the end', ['09:00', '10:00'], ['09:45', '10:15'], true],
    ['back to back, second after first', ['09:00', '10:00'], ['10:00', '11:00'], false],
    ['back to back, second before first', ['10:00', '11:00'], ['09:00', '10:00'], false],
    ['a gap between them', ['09:00', '10:00'], ['10:15', '11:00'], false],
  ])('%s', (_name, [aStart, aEnd], [bStart, bEnd], expected) => {
    expect(overlaps(at(aStart, aEnd), at(bStart, bEnd))).toBe(expected);
    expect(overlaps(at(bStart, bEnd), at(aStart, aEnd))).toBe(expected);
  });
});

describe('validateInterval', () => {
  it.each([
    ['a one-hour slot', '09:00', '10:00'],
    ['four hours from opening time', '08:00', '12:00'],
    ['the last slot of the day', '17:45', '18:00'],
  ])('accepts %s', (_name, start, end) => {
    expect(validateInterval(at(start, end))).toBeNull();
  });

  it.each([
    ['start equal to end', '09:00', '09:00', 'startsAt must be before endsAt'],
    ['start after end', '10:00', '09:00', 'startsAt must be before endsAt'],
    [
      'a start off the grid',
      '09:10',
      '10:00',
      'Bookings must start and end on a 15-minute boundary',
    ],
    ['one slot before opening', '07:45', '09:00', 'Bookings must be between 08:00 and 18:00 UTC'],
    ['one slot past closing', '17:00', '18:15', 'Bookings must be between 08:00 and 18:00 UTC'],
    ['one slot over four hours', '09:00', '13:15', 'A booking can be at most 240 minutes long'],
  ])('rejects %s', (_name, start, end, message) => {
    expect(validateInterval(at(start, end))).toBe(message);
  });

  it('rejects a booking that runs past midnight', () => {
    const i = parseInterval('2026-11-02T17:00:00.000Z', '2026-11-03T09:00:00.000Z');
    expect(validateInterval(i)).toBe('A booking must start and end on the same day');
  });

  it('rejects a date-time that does not parse', () => {
    expect(validateInterval(parseInterval('soon', 'later'))).toBe(
      'startsAt and endsAt must be valid date-times',
    );
  });
});

describe('durationMinutes', () => {
  it.each([
    ['09:00', '09:15', 15],
    ['09:00', '13:00', 240],
  ])('%s to %s is %i minutes', (start, end, minutes) => {
    expect(durationMinutes(at(start, end))).toBe(minutes);
  });
});

describe('freeSlots', () => {
  const booking = (start: string, end: string) => ({
    id: 0,
    roomId: 1,
    memberId: 1,
    title: 'x',
    startsAt: `2026-11-02T${start}:00.000Z`,
    endsAt: `2026-11-02T${end}:00.000Z`,
    createdAt: '2026-10-26T12:00:00.000Z',
  });
  const slot = (start: string, end: string) => ({
    startsAt: `2026-11-02T${start}:00.000Z`,
    endsAt: `2026-11-02T${end}:00.000Z`,
  });

  it('is the whole day when there are no bookings', () => {
    expect(freeSlots('2026-11-02', [])).toEqual([slot('08:00', '18:00')]);
  });

  it('leaves no gap between back-to-back bookings', () => {
    expect(freeSlots('2026-11-02', [booking('09:00', '10:00'), booking('10:00', '11:00')])).toEqual(
      [slot('08:00', '09:00'), slot('11:00', '18:00')],
    );
  });

  it('is empty when the day is fully booked', () => {
    expect(
      freeSlots('2026-11-02', [
        booking('08:00', '12:00'),
        booking('12:00', '16:00'),
        booking('16:00', '18:00'),
      ]),
    ).toEqual([]);
  });
});
