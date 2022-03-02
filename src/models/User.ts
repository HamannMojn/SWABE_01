import { Schema } from 'mongoose';

export interface User {
    name: string,
    password: string,
    role?: userRole,
    email: string
}

export enum userRole {
    guest = 'guest',
    clerk = 'clerk',
    manager = 'manager'
}

export const UserSchema = new Schema<User> ({
    name: {type: String, required: true},
    password: {type: String, required: true},
    role: {type: String, enum: userRole, default: userRole.guest},
    email: { type: String, required: true}
})

