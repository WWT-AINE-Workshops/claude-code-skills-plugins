import type { Member, Room } from '@roombook/shared';
import { migrate, type Db } from './db';

export const MEMBERS: Member[] = [
  { id: 1, name: 'Ava Patel', email: 'ava.patel@roombook.test', team: 'Platform' },
  { id: 2, name: 'Ben Okafor', email: 'ben.okafor@roombook.test', team: 'Mobile' },
  { id: 3, name: 'Chloe Martin', email: 'chloe.martin@roombook.test', team: 'Design' },
  { id: 4, name: 'Dev Rao', email: 'dev.rao@roombook.test', team: 'Platform' },
];

export const ROOMS: Room[] = [
  { id: 1, name: 'Atlas', floor: 1, capacity: 4 },
  { id: 2, name: 'Beacon', floor: 1, capacity: 8 },
  { id: 3, name: 'Cedar', floor: 2, capacity: 6 },
  { id: 4, name: 'Delta', floor: 2, capacity: 12 },
  { id: 5, name: 'Echo', floor: 3, capacity: 2 },
];

type SeedBooking = [
  roomId: number,
  memberId: number,
  title: string,
  date: string,
  start: string,
  end: string,
];

export const BOOKINGS: SeedBooking[] = [
  [1, 1, 'Platform stand-up', '2026-11-02', '09:00', '10:00'],
  [2, 2, 'Mobile sprint planning', '2026-11-02', '09:00', '10:00'],
  [2, 3, 'Design critique', '2026-11-02', '10:00', '11:00'],
  [4, 4, 'Platform architecture review', '2026-11-02', '13:00', '15:00'],
  [1, 3, 'Design sync', '2026-11-02', '14:00', '14:30'],
  [3, 2, 'Mobile release check-in', '2026-11-03', '09:30', '10:30'],
  [5, 1, 'One-to-one: Ava and Dev', '2026-11-03', '11:00', '11:30'],
  [4, 3, 'Design system workshop', '2026-11-03', '13:00', '16:00'],
  [1, 4, 'Incident review', '2026-11-03', '15:00', '16:00'],
  [2, 1, 'Platform stand-up', '2026-11-04', '08:30', '09:00'],
  [3, 2, 'Mobile backlog grooming', '2026-11-04', '10:00', '11:30'],
  [3, 4, 'On-call handover', '2026-11-04', '11:30', '12:00'],
  [5, 3, 'User interview prep', '2026-11-04', '14:00', '14:45'],
  [4, 2, 'Mobile demo', '2026-11-04', '16:00', '17:30'],
  [1, 1, 'Platform stand-up', '2026-11-05', '09:00', '10:00'],
  [2, 4, 'Capacity planning', '2026-11-05', '10:15', '11:15'],
  [3, 3, 'Design review', '2026-11-05', '13:00', '14:00'],
  [5, 2, 'One-to-one: Ben and Chloe', '2026-11-05', '16:30', '17:00'],
  [4, 1, 'Quarterly planning', '2026-11-06', '09:00', '12:00'],
  [1, 2, 'Mobile retro', '2026-11-06', '14:00', '15:30'],
];

const SEEDED_AT = '2026-10-26T12:00:00.000Z';
const at = (date: string, time: string) => `${date}T${time}:00.000Z`;

export function seed(db: Db): void {
  const insertMember = db.prepare(
    'INSERT INTO members (id, name, email, team) VALUES (@id, @name, @email, @team)',
  );
  const insertRoom = db.prepare(
    'INSERT INTO rooms (id, name, floor, capacity) VALUES (@id, @name, @floor, @capacity)',
  );
  const insertBooking = db.prepare(
    `INSERT INTO bookings (id, room_id, member_id, title, starts_at, ends_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  db.transaction(() => {
    for (const m of MEMBERS) insertMember.run(m);
    for (const r of ROOMS) insertRoom.run(r);
    BOOKINGS.forEach(([roomId, memberId, title, date, start, end], i) =>
      insertBooking.run(i + 1, roomId, memberId, title, at(date, start), at(date, end), SEEDED_AT),
    );
  })();
}

export function resetDatabase(db: Db): void {
  db.pragma('foreign_keys = OFF');
  try {
    db.transaction(() => {
      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
        .pluck()
        .all() as string[];
      for (const name of tables) db.exec(`DROP TABLE IF EXISTS "${name}"`);
    })();
  } finally {
    db.pragma('foreign_keys = ON');
  }
  migrate(db);
  seed(db);
}
