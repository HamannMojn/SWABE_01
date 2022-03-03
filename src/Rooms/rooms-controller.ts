import { Request, Response } from 'express';
import mongoose from "mongoose";
import { RoomSchema } from "../models/Room";
import { User, userRole } from '../models/User';

const usersConnection = mongoose.createConnection('mongodb://localhost:27017/users');
const roomModel = usersConnection.model('Room', RoomSchema);

const list = async (req: Request, res: Response) => {
    let result = await roomModel.find({}).lean().exec();
    res.json(result);
}
const read = async (req: Request, res: Response) => {
    const { uid } = req.params;
    let result = await roomModel.findOne({ roomNumber: uid });
    if(!result) return res.json({
        "message": "Room not found"
    });
    res.json(result);
}

export const Rooms = { list, read}

export const Create = async (req: Request, res: Response) => {
    const {uid} = req.body;
        if(await roomNumberExists(uid)){
            res.status(400).json({
                "message": "Room already exists"
            });
        } else {
            let room = newRoom(uid)
            await room.save();
            res.status(200).json(uid)
        }
}

const roomNumberExists = (roomNumber: string) => roomModel.findOne({ roomNumber }).exec();

const newRoom = (roomNumber: number) => new roomModel({
    roomNumber: roomNumber
});