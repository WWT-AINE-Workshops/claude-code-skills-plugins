import type { FastifyInstance } from 'fastify';
import type { AppDeps } from '../app';
import { HttpError, notFound, toId } from '../errors';
import { actingMember } from '../members';
import { deleteBooking, getBooking } from '../repo';

export function cancellationRoutes(app: FastifyInstance, deps: AppDeps): void {
  const { db } = deps;

  app.delete<{ Params: { id: string } }>('/api/bookings/:id', async (request, reply) => {
    const member = actingMember(request, db);
    const id = toId(request.params.id);
    const booking = getBooking(db, id);
    if (!booking) throw notFound(`Booking ${id}`);
    if (booking.memberId !== member.id) {
      throw new HttpError(403, 'Only the member who made a booking can cancel it');
    }
    deleteBooking(db, booking.id);
    return reply.code(204).send();
  });
}
