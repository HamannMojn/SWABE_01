import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { Reservation, ReservationSchema } from './Reservation';

export interface Room {
    roomNumber: number,
    reservations: [Reservation]
}

export const RoomSchema = new Schema<Room> ({
    roomNumber: {type: Number, required: true },
    reservations: [{type: mongoose.Schema.Types.ObjectId, ref: "Reservation"}]
})