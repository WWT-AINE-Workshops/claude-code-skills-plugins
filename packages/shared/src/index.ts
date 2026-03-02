export interface Member {
  id: number;
  name: string;
  email: string;
  team: string;
}

export interface Room {
  id: number;
  name: string;
  floor: number;
  capacity: number;
}

export interface Booking {
  id: number;
  roomId: number;
  memberId: number;
  title: string;
  startsAt: string;
  endsAt: string;
  createdAt: string;
}

export interface FreeSlot {
  startsAt: string;
  endsAt: string;
}

export interface Availability {
  roomId: number;
  date: string;
  bookings: Booking[];
  free: FreeSlot[];
}

export const OPEN_HOUR = 8;
export const CLOSE_HOUR = 18;
export const SLOT_MINUTES = 15;
export const MAX_BOOKING_MINUTES = 240;
