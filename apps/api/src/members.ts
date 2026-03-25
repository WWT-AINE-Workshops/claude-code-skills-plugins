import type { Member } from '@roombook/shared';
import type { FastifyRequest } from 'fastify';
import type { Db } from './db';
import { HttpError } from './errors';
import { getMember } from './repo';

export function actingMember(request: FastifyRequest, db: Db): Member {
  const raw = request.headers['x-member-id'];
  if (raw === undefined || raw === '') throw new HttpError(401, 'X-Member-Id header required');
  const id = typeof raw === 'string' && /^[1-9]\d*$/.test(raw) ? Number(raw) : NaN;
  const member = Number.isSafeInteger(id) ? getMember(db, id) : undefined;
  if (!member) throw new HttpError(401, 'Unknown member');
  return member;
}
