import { describe, expect, it } from 'vitest';
import { makeTestApp } from './helpers';

const cancel = (url: string, headers: Record<string, string> = { 'x-member-id': '1' }) => {
  const ctx = makeTestApp();
  return { ...ctx, res: ctx.app.inject({ method: 'DELETE', url, headers }) };
};

describe('DELETE /api/bookings/:id', () => {
  it('cancels a booking and removes it from the list', async () => {
    const { app, res } = cancel('/api/bookings/1');
    const done = await res;
    expect(done.statusCode).toBe(204);
    expect(done.body).toBe('');
    const list = await app.inject({ method: 'GET', url: '/api/bookings' });
    const ids = list.json().map((b: { id: number }) => b.id);
    expect(ids).toHaveLength(19);
    expect(ids).not.toContain(1);
  });

  it('refuses a member who did not make the booking, and keeps it', async () => {
    const { app, res } = cancel('/api/bookings/1', { 'x-member-id': '2' });
    const done = await res;
    expect(done.statusCode).toBe(403);
    expect(done.json()).toEqual({ error: 'Only the member who made a booking can cancel it' });
    const list = await app.inject({ method: 'GET', url: '/api/bookings' });
    expect(list.json().map((b: { id: number }) => b.id)).toContain(1);
  });

  it('frees the slot in the room once cancelled', async () => {
    const { app, res } = cancel('/api/bookings/1');
    await res;
    const day = await app.inject({
      method: 'GET',
      url: '/api/rooms/1/availability?date=2026-11-02',
    });
    expect(day.json().bookings.map((b: { id: number }) => b.id)).toEqual([5]);
  });

  it('returns 404 for an unknown booking', async () => {
    const res = await cancel('/api/bookings/999').res;
    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({ error: 'Booking 999 not found' });
  });

  it('returns 400 for an invalid id', async () => {
    const res = await cancel('/api/bookings/abc').res;
    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({ error: 'invalid id' });
  });

  it('returns 401 without the X-Member-Id header and keeps the booking', async () => {
    const { app, res } = cancel('/api/bookings/1', {});
    const done = await res;
    expect(done.statusCode).toBe(401);
    expect(done.json()).toEqual({ error: 'X-Member-Id header required' });
    const list = await app.inject({ method: 'GET', url: '/api/bookings' });
    expect(list.json()).toHaveLength(20);
  });

  it('returns 401 for an unknown member', async () => {
    const res = await cancel('/api/bookings/1', { 'x-member-id': '99' }).res;
    expect(res.statusCode).toBe(401);
    expect(res.json()).toEqual({ error: 'Unknown member' });
  });
});
