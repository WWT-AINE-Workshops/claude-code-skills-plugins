import { describe, expect, it } from 'vitest';
import { migrate, openDb } from '../src/db';
import { resetDatabase, seed } from '../src/seed';

const count = (db: ReturnType<typeof openDb>, table: string) =>
  db.prepare(`SELECT COUNT(*) FROM ${table}`).pluck().get();

describe('openDb / seed', () => {
  it('applies the migrations and is idempotent', () => {
    const db = openDb(':memory:');
    expect(db.prepare('SELECT name FROM schema_migrations').pluck().all()).toEqual([
      '001_init.sql',
    ]);
    expect(migrate(db)).toEqual([]);
  });

  it('seeds 4 members, 5 rooms and 20 bookings', () => {
    const db = openDb(':memory:');
    seed(db);
    expect(count(db, 'members')).toBe(4);
    expect(count(db, 'rooms')).toBe(5);
    expect(count(db, 'bookings')).toBe(20);
  });

  it('seeds booking 1 as the Platform stand-up in room 1', () => {
    const db = openDb(':memory:');
    seed(db);
    expect(db.prepare('SELECT * FROM bookings WHERE id = 1').get()).toEqual({
      id: 1,
      room_id: 1,
      member_id: 1,
      title: 'Platform stand-up',
      starts_at: '2026-11-02T09:00:00.000Z',
      ends_at: '2026-11-02T10:00:00.000Z',
      created_at: '2026-10-26T12:00:00.000Z',
    });
  });

  it('enforces unique emails and room names', () => {
    const db = openDb(':memory:');
    seed(db);
    expect(() =>
      db
        .prepare(
          "INSERT INTO members (name, email, team) VALUES ('Ava Two', 'ava.patel@roombook.test', 'Mobile')",
        )
        .run(),
    ).toThrow(/UNIQUE/);
    expect(() =>
      db.prepare("INSERT INTO rooms (name, floor, capacity) VALUES ('Atlas', 4, 3)").run(),
    ).toThrow(/UNIQUE/);
  });

  it('rejects a room without capacity', () => {
    const db = openDb(':memory:');
    expect(() =>
      db.prepare("INSERT INTO rooms (name, floor, capacity) VALUES ('Void', 1, 0)").run(),
    ).toThrow(/CHECK/);
  });

  it('enforces the booking foreign keys', () => {
    const db = openDb(':memory:');
    seed(db);
    const insert = db.prepare(
      `INSERT INTO bookings (room_id, member_id, title, starts_at, ends_at, created_at)
       VALUES (?, ?, 'x', '2026-11-09T09:00:00.000Z', '2026-11-09T10:00:00.000Z', 'now')`,
    );
    expect(() => insert.run(99, 1)).toThrow(/FOREIGN KEY/);
    expect(() => insert.run(1, 99)).toThrow(/FOREIGN KEY/);
  });
});

describe('resetDatabase', () => {
  it('restores the seed data after changes', () => {
    const db = openDb(':memory:');
    seed(db);
    db.prepare('DELETE FROM bookings').run();
    db.prepare('DELETE FROM rooms WHERE id = 5').run();
    resetDatabase(db);
    expect(count(db, 'bookings')).toBe(20);
    expect(count(db, 'rooms')).toBe(5);
  });
});
