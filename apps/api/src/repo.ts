import type { Booking, Member, Room } from '@roombook/shared';
import { overlaps, parseInterval, type Interval } from './booking-rules';
import type { Db } from './db';

interface BookingRow {
  id: number;
  room_id: number;
  member_id: number;
  title: string;
  starts_at: string;
  ends_at: string;
  created_at: string;
}

const toBooking = (r: BookingRow): Booking => ({
  id: r.id,
  roomId: r.room_id,
  memberId: r.member_id,
  title: r.title,
  startsAt: r.starts_at,
  endsAt: r.ends_at,
  createdAt: r.created_at,
});

export function listRooms(db: Db, q?: string): Room[] {
  if (q === undefined) {
    return db.prepare('SELECT * FROM rooms ORDER BY floor, name').all() as Room[];
  }
  return db
    .prepare('SELECT * FROM rooms WHERE name LIKE ? ORDER BY floor, name')
    .all(`%${q}%`) as Room[];
}

export function getRoom(db: Db, id: number): Room | undefined {
  return db.prepare('SELECT * FROM rooms WHERE id = ?').get(id) as Room | undefined;
}

export function getMember(db: Db, id: number): Member | undefined {
  return db.prepare('SELECT * FROM members WHERE id = ?').get(id) as Member | undefined;
}

export function listBookings(db: Db, opts: { roomId?: number; date?: string } = {}): Booking[] {
  const where: string[] = [];
  const args: (number | string)[] = [];
  if (opts.roomId !== undefined) {
    where.push('room_id = ?');
    args.push(opts.roomId);
  }
  if (opts.date !== undefined) {
    where.push('substr(starts_at, 1, 10) = ?');
    args.push(opts.date);
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const rows = db
    .prepare(`SELECT * FROM bookings ${clause} ORDER BY starts_at, id`)
    .all(...args) as BookingRow[];
  return rows.map(toBooking);
}

export function getBooking(db: Db, id: number): Booking | undefined {
  const row = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as BookingRow | undefined;
  return row && toBooking(row);
}

export function findConflicts(db: Db, roomId: number, interval: Interval): Booking[] {
  return listBookings(db, { roomId, date: interval.start.toISOString().slice(0, 10) }).filter((b) =>
    overlaps(interval, parseInterval(b.startsAt, b.endsAt)),
  );
}

export function createBooking(
  db: Db,
  input: { roomId: number; memberId: number; title: string; interval: Interval; createdAt: Date },
): Booking {
  const { lastInsertRowid } = db
    .prepare(
      `INSERT INTO bookings (room_id, member_id, title, starts_at, ends_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.roomId,
      input.memberId,
      input.title,
      input.interval.start.toISOString(),
      input.interval.end.toISOString(),
      input.createdAt.toISOString(),
    );
  return getBooking(db, Number(lastInsertRowid)) as Booking;
}

export function deleteBooking(db: Db, id: number): void {
  db.prepare('DELETE FROM bookings WHERE id = ?').run(id);
}
