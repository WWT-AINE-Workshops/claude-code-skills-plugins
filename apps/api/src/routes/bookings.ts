import type { Availability } from '@roombook/shared';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { AppDeps } from '../app';
import { freeSlots, parseInterval, validateInterval } from '../booking-rules';
import { HttpError, notFound, toId } from '../errors';
import { actingMember } from '../members';
import { createBooking, findConflicts, getRoom, listBookings } from '../repo';

const DateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD')
  .refine((d) => !Number.isNaN(Date.parse(d)) && new Date(d).toISOString().startsWith(d), {
    message: 'is not a real date',
  });

const ListQuery = z.object({
  roomId: z
    .string()
    .regex(/^[1-9]\d*$/, 'must be a positive integer')
    .transform(Number)
    .optional(),
  date: DateString.optional(),
});

const AvailabilityQuery = z.object({ date: DateString });

const CreateBody = z.object({
  roomId: z.number().int().positive(),
  title: z.string().min(1).max(120),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
});

export function bookingRoutes(app: FastifyInstance, deps: AppDeps): void {
  const { db } = deps;
  const now = deps.now ?? (() => new Date());

  app.get('/api/bookings', async (request) => listBookings(db, ListQuery.parse(request.query)));

  app.get<{ Params: { id: string } }>('/api/rooms/:id/availability', async (request) => {
    const roomId = toId(request.params.id);
    const { date } = AvailabilityQuery.parse(request.query);
    if (!getRoom(db, roomId)) throw notFound(`Room ${roomId}`);
    const bookings = listBookings(db, { roomId, date });
    const availability: Availability = { roomId, date, bookings, free: freeSlots(date, bookings) };
    return availability;
  });

  app.post('/api/bookings', async (request, reply) => {
    const member = actingMember(request, db);
    const body = CreateBody.parse(request.body);
    if (!getRoom(db, body.roomId)) throw notFound(`Room ${body.roomId}`);
    const interval = parseInterval(body.startsAt, body.endsAt);
    const problem = validateInterval(interval);
    if (problem) throw new HttpError(400, problem);
    if (findConflicts(db, body.roomId, interval).length > 0) {
      throw new HttpError(409, `Room ${body.roomId} is already booked at that time`);
    }
    const booking = createBooking(db, {
      roomId: body.roomId,
      memberId: member.id,
      title: body.title,
      interval,
      createdAt: now(),
    });
    return reply.code(201).send(booking);
  });
}
