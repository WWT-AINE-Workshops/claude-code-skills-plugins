import { describe, expect, it } from 'vitest';
import { makeTestApp } from './helpers';

const NOW = new Date('2026-10-30T09:00:00.000Z');

const get = (url: string) => makeTestApp().app.inject({ method: 'GET', url });

const post = (
  payload: Record<string, unknown>,
  headers: Record<string, string> = { 'x-member-id': '2' },
) => {
  const ctx = makeTestApp({ now: () => NOW });
  return {
    ...ctx,
    res: ctx.app.inject({ method: 'POST', url: '/api/bookings', headers, payload }),
  };
};

const slot = (date: string, start: string, end: string, roomId = 1) => ({
  roomId,
  title: 'Mobile one-to-one',
  startsAt: `${date}T${start}:00.000Z`,
  endsAt: `${date}T${end}:00.000Z`,
});

describe('GET /api/bookings', () => {
  it('lists every booking by start time', async () => {
    const res = await get('/api/bookings');
    expect(res.statusCode).toBe(200);
    const bookings = res.json();
    expect(bookings).toHaveLength(20);
    expect(bookings[0]).toEqual({
      id: 1,
      roomId: 1,
      memberId: 1,
      title: 'Platform stand-up',
      startsAt: '2026-11-02T09:00:00.000Z',
      endsAt: '2026-11-02T10:00:00.000Z',
      createdAt: '2026-10-26T12:00:00.000Z',
    });
    const starts = bookings.map((b: { startsAt: string }) => b.startsAt);
    expect(starts).toEqual([...starts].sort());
  });

  it('filters by room and date', async () => {
    const res = await get('/api/bookings?roomId=1&date=2026-11-02');
    expect(res.statusCode).toBe(200);
    expect(res.json().map((b: { id: number }) => b.id)).toEqual([1, 5]);
  });

  it('filters by room alone', async () => {
    const res = await get('/api/bookings?roomId=5');
    expect(res.json().map((b: { id: number }) => b.id)).toEqual([7, 13, 18]);
  });

  it('filters by date alone', async () => {
    const res = await get('/api/bookings?date=2026-11-06');
    expect(res.json().map((b: { id: number }) => b.id)).toEqual([19, 20]);
  });

  it.each([
    ['a malformed date', 'date=2026-11-2'],
    ['an impossible date', 'date=2026-02-30'],
    ['a non-numeric room id', 'roomId=abc'],
    ['a zero room id', 'roomId=0'],
  ])('rejects %s with 400', async (_name, query) => {
    const res = await get(`/api/bookings?${query}`);
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toEqual(expect.any(String));
  });
});

describe('GET /api/rooms/:id/availability', () => {
  it("returns the room's bookings and free slots for the day", async () => {
    const res = await get('/api/rooms/1/availability?date=2026-11-02');
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.roomId).toBe(1);
    expect(body.date).toBe('2026-11-02');
    expect(body.bookings.map((b: { id: number }) => b.id)).toEqual([1, 5]);
    expect(body.free).toEqual([
      { startsAt: '2026-11-02T08:00:00.000Z', endsAt: '2026-11-02T09:00:00.000Z' },
      { startsAt: '2026-11-02T10:00:00.000Z', endsAt: '2026-11-02T14:00:00.000Z' },
      { startsAt: '2026-11-02T14:30:00.000Z', endsAt: '2026-11-02T18:00:00.000Z' },
    ]);
  });

  it('merges bookings that follow each other into one busy stretch', async () => {
    const res = await get('/api/rooms/2/availability?date=2026-11-02');
    expect(res.json().free).toEqual([
      { startsAt: '2026-11-02T08:00:00.000Z', endsAt: '2026-11-02T09:00:00.000Z' },
      { startsAt: '2026-11-02T11:00:00.000Z', endsAt: '2026-11-02T18:00:00.000Z' },
    ]);
  });

  it('shows the whole day free when the room has no bookings', async () => {
    const res = await get('/api/rooms/5/availability?date=2026-11-02');
    expect(res.json()).toEqual({
      roomId: 5,
      date: '2026-11-02',
      bookings: [],
      free: [{ startsAt: '2026-11-02T08:00:00.000Z', endsAt: '2026-11-02T18:00:00.000Z' }],
    });
  });

  it('requires a date', async () => {
    const res = await get('/api/rooms/1/availability');
    expect(res.statusCode).toBe(400);
  });

  it('returns 404 for a room that does not exist', async () => {
    const res = await get('/api/rooms/999/availability?date=2026-11-02');
    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({ error: 'Room 999 not found' });
  });

  it('rejects an invalid room id with 400', async () => {
    const res = await get('/api/rooms/abc/availability?date=2026-11-02');
    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({ error: 'invalid id' });
  });
});

describe('POST /api/bookings', () => {
  it('creates a booking for the acting member', async () => {
    const { app, res } = post(slot('2026-11-02', '11:00', '12:00'));
    const created = await res;
    expect(created.statusCode).toBe(201);
    expect(created.json()).toEqual({
      id: 21,
      roomId: 1,
      memberId: 2,
      title: 'Mobile one-to-one',
      startsAt: '2026-11-02T11:00:00.000Z',
      endsAt: '2026-11-02T12:00:00.000Z',
      createdAt: NOW.toISOString(),
    });
    const list = await app.inject({ method: 'GET', url: '/api/bookings?roomId=1&date=2026-11-02' });
    expect(list.json().map((b: { id: number }) => b.id)).toEqual([1, 21, 5]);
  });

  it('accepts a booking of exactly the maximum length', async () => {
    const res = await post(slot('2026-11-02', '08:00', '12:00', 5)).res;
    expect(res.statusCode).toBe(201);
  });

  it('accepts a booking that ends at closing time', async () => {
    const res = await post(slot('2026-11-02', '17:00', '18:00', 5)).res;
    expect(res.statusCode).toBe(201);
  });

  it.each([
    ['inside', '09:15', '09:45'],
    ['across the start', '08:30', '09:30'],
    ['across the end', '09:45', '10:15'],
    ['around', '08:30', '10:30'],
  ])('refuses a booking %s an existing one with 409', async (_name, start, end) => {
    const res = await post(slot('2026-11-02', start, end)).res;
    expect(res.statusCode).toBe(409);
    expect(res.json()).toEqual({ error: 'Room 1 is already booked at that time' });
  });

  it('allows the same time in a different room', async () => {
    const res = await post(slot('2026-11-02', '09:00', '10:00', 3)).res;
    expect(res.statusCode).toBe(201);
  });

  it.each([
    ['end before start', '11:00', '10:00', 'startsAt must be before endsAt'],
    ['a zero-length booking', '11:00', '11:00', 'startsAt must be before endsAt'],
    ['an off-grid start', '11:10', '12:00', 'Bookings must start and end on a 15-minute boundary'],
    ['an off-grid end', '11:00', '11:50', 'Bookings must start and end on a 15-minute boundary'],
    ['a start before opening', '07:00', '08:00', 'Bookings must be between 08:00 and 18:00 UTC'],
    ['an end after closing', '17:00', '18:15', 'Bookings must be between 08:00 and 18:00 UTC'],
    ['a booking over 240 minutes', '11:00', '15:15', 'A booking can be at most 240 minutes long'],
  ])('rejects %s with 400', async (_name, start, end, error) => {
    const res = await post(slot('2026-11-02', start, end, 5)).res;
    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({ error });
  });

  it('rejects a booking that spans two days with 400', async () => {
    const res = await post({
      roomId: 5,
      title: 'Overnight',
      startsAt: '2026-11-02T17:00:00.000Z',
      endsAt: '2026-11-03T09:00:00.000Z',
    }).res;
    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({ error: 'A booking must start and end on the same day' });
  });

  it.each([
    ['a missing title', { title: undefined }],
    ['an empty title', { title: '' }],
    ['a title over 120 characters', { title: 'x'.repeat(121) }],
    ['a startsAt that is not a date-time', { startsAt: 'tomorrow' }],
    ['a string room id', { roomId: '1' }],
  ])('rejects %s with 400', async (_name, change) => {
    const res = await post({ ...slot('2026-11-02', '11:00', '12:00'), ...change }).res;
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toEqual(expect.any(String));
  });

  it('returns 404 for a room that does not exist', async () => {
    const res = await post(slot('2026-11-02', '11:00', '12:00', 999)).res;
    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({ error: 'Room 999 not found' });
  });

  it('requires the X-Member-Id header', async () => {
    const res = await post(slot('2026-11-02', '11:00', '12:00'), {}).res;
    expect(res.statusCode).toBe(401);
    expect(res.json()).toEqual({ error: 'X-Member-Id header required' });
  });

  it.each(['99', 'abc', '0', '1.5'])('rejects the member id %s with 401', async (id) => {
    const res = await post(slot('2026-11-02', '11:00', '12:00'), { 'x-member-id': id }).res;
    expect(res.statusCode).toBe(401);
    expect(res.json()).toEqual({ error: 'Unknown member' });
  });

  it('checks the member before the body', async () => {
    const res = await post({}, {}).res;
    expect(res.statusCode).toBe(401);
  });
});
