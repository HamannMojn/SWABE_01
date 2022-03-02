import { Schema } from 'mongoose';

export interface User {
    name: string,
    password: string,
    role: Role,
    email: string
}

export interface Password {
    hash: string;
    salt: string;
    setPassword(hash: string, salt: string): void;
    isPasswordValid(Password: string): boolean;
}

export enum Role {
    Guest = "Guest",
    Clerk = "Clerk",
    Manager = "Manager"
}

export const UserSchema = new Schema<User> ({
    name: {type: String, required: true},
    password: {type: String, required: true},
    role: ["Guest", "Clerk", "Manager"],
    email: { type: String, required: true}
})

