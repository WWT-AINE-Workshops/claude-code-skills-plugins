import { describe, expect, it } from 'vitest';
import { CLOSE_HOUR, MAX_BOOKING_MINUTES, OPEN_HOUR, SLOT_MINUTES } from '../src';

describe('shared constants', () => {
  it('opens from 08:00 to 18:00', () => {
    expect([OPEN_HOUR, CLOSE_HOUR]).toEqual([8, 18]);
  });

  it('uses 15-minute slots that divide an hour', () => {
    expect(SLOT_MINUTES).toBe(15);
    expect(60 % SLOT_MINUTES).toBe(0);
  });

  it('caps a booking at four hours, on the slot grid and inside opening hours', () => {
    expect(MAX_BOOKING_MINUTES).toBe(240);
    expect(MAX_BOOKING_MINUTES % SLOT_MINUTES).toBe(0);
    expect(MAX_BOOKING_MINUTES).toBeLessThanOrEqual((CLOSE_HOUR - OPEN_HOUR) * 60);
  });
});
