import { Schema } from 'mongoose';
import { Reservation, ReservationSchema } from './Reservation';

export interface Room {
    roomNumber: number,
    reservations: [Reservation]
}

export const RoomSchema = new Schema<Room> ({
    roomNumber: {type: Number, required: true },
    reservations: [ReservationSchema]
})