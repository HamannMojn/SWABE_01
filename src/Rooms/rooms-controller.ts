import { Request, Response } from 'express';
import mongoose from "mongoose";
import { Room, RoomSchema } from "../models/Room";

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

export const Patch = async (req: Request, res: Response) => {
    const {uid} = req.params;
    const {reservation, roomNumber} = req.body;
    console.log(req.body)
    let room = await roomModel.findOne({roomNumber: uid}).exec();
    console.log(room) 
    if(room){
        if(reservation != null){
            room.reservations.push(reservation);
        } 
        if(roomNumber != null){
            if(await roomNumberExists(roomNumber)){
                return res.json({
                    "message": "room with this roomnumber already exists"
                })
            }
            room.roomNumber = roomNumber;
        } 
        room.save();
        res.status(200).json({
            "message": `Room number of ${uid} changed to ${roomNumber}`
        });
    } else {
        return res.json({
            "message": "No changes"
        })
    }
}

export const Create = async (req: Request, res: Response) => {
    const {uid} = req.params;
        if(await roomNumberExists(uid)){
            res.status(400).json({
                "message": "Room already exists"
            });
        } else {
            let room = newRoom(uid)
            await room.save();
            res.status(200).json({
                "message": `Room with room number ${uid} created`
            })
        }
}

export const Delete = async (req: Request, res: Response) => {
    const {uid} = req.params;
    let room = await roomModel.findOne({roomNumber: uid}).exec();

    if(!room || room == null){
        return res.status(400).json({
            "message": "No room to delete"
        });
    } else {
        await room.delete()
        res.status(200).json({
            "message": `Room with room number ${room.roomNumber} deleted`
        })
    }
}

const roomNumberExists = (roomNumber: string) => roomModel.findOne({ roomNumber }).exec();

const newRoom = (roomNumber: string) => new roomModel({
    roomNumber: roomNumber
});