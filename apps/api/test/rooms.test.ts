import { describe, expect, it } from 'vitest';
import { makeTestApp } from './helpers';

const get = (url: string) => makeTestApp().app.inject({ method: 'GET', url });

describe('GET /api/rooms', () => {
  it('lists every room by floor, then name', async () => {
    const res = await get('/api/rooms');
    expect(res.statusCode).toBe(200);
    const rooms = res.json();
    expect(rooms.map((r: { name: string }) => r.name)).toEqual([
      'Atlas',
      'Beacon',
      'Cedar',
      'Delta',
      'Echo',
    ]);
    expect(rooms[0]).toEqual({ id: 1, name: 'Atlas', floor: 1, capacity: 4 });
  });

  it('searches room names with q, ignoring case', async () => {
    const res = await get('/api/rooms?q=ced');
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([{ id: 3, name: 'Cedar', floor: 2, capacity: 6 }]);
  });

  it('matches part of a name', async () => {
    const res = await get('/api/rooms?q=a');
    expect(res.json().map((r: { name: string }) => r.name)).toEqual([
      'Atlas',
      'Beacon',
      'Cedar',
      'Delta',
    ]);
  });

  it('treats quotes and percent signs as text', async () => {
    const q = encodeURIComponent("x%' OR '1'='1");
    const res = await get(`/api/rooms?q=${q}`);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });

  it.each([
    ['an empty q', 'q='],
    ['a q over 50 characters', `q=${'a'.repeat(51)}`],
  ])('rejects %s with 400', async (_name, query) => {
    const res = await get(`/api/rooms?${query}`);
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toEqual(expect.any(String));
  });
});

describe('GET /api/rooms/:id', () => {
  it('returns one room', async () => {
    const res = await get('/api/rooms/4');
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ id: 4, name: 'Delta', floor: 2, capacity: 12 });
  });

  it('returns 404 for a room that does not exist', async () => {
    const res = await get('/api/rooms/999');
    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({ error: 'Room 999 not found' });
  });

  it.each(['abc', '0', '1.5'])('rejects the id %s with 400', async (id) => {
    const res = await get(`/api/rooms/${id}`);
    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({ error: 'invalid id' });
  });
});
