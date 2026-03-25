import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { AppDeps } from '../app';
import { notFound, toId } from '../errors';
import { getRoom, listRooms } from '../repo';

const ListQuery = z.object({ q: z.string().min(1).max(50).optional() });

export function roomRoutes(app: FastifyInstance, deps: AppDeps): void {
  const { db } = deps;

  app.get('/api/rooms', async (request) => listRooms(db, ListQuery.parse(request.query).q));

  app.get<{ Params: { id: string } }>('/api/rooms/:id', async (request) => {
    const id = toId(request.params.id);
    const room = getRoom(db, id);
    if (!room) throw notFound(`Room ${id}`);
    return room;
  });
}
