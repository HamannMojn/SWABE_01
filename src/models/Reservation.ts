import { Schema } from 'mongoose';
import { Room, RoomSchema } from './Room';
import { User, UserSchema } from './User';

export interface Reservation {
    from: Date,
    to: Date,
    room: Room,
    user: User
}

export const ReservationSchema = new Schema<Reservation> ({
    from: {type: Date, required: true},
    to: {type: Date, required: true},
    
})