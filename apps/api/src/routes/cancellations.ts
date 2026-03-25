import type { FastifyInstance } from 'fastify';
import type { AppDeps } from '../app';
import { notFound, toId } from '../errors';
import { actingMember } from '../members';
import { deleteBooking, getBooking } from '../repo';

export function cancellationRoutes(app: FastifyInstance, deps: AppDeps): void {
  const { db } = deps;

  app.delete<{ Params: { id: string } }>('/api/bookings/:id', async (request, reply) => {
    actingMember(request, db);
    const id = toId(request.params.id);
    const booking = getBooking(db, id);
    if (!booking) throw notFound(`Booking ${id}`);
    deleteBooking(db, booking.id);
    return reply.code(204).send();
  });
}
