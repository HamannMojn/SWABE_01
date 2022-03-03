import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { Room } from './Room';
import { User } from './User';

export interface Reservation {
    from: Date,
    to: Date,
    room: Room,
    user: User
}

export const ReservationSchema = new Schema<Reservation> ({
    from: {type: Date, required: true},
    to: {type: Date, required: true},
    room: {type: mongoose.Schema.Types.ObjectId, ref: "Room"},
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"}
})