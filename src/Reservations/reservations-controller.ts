import { Request, Response } from 'express';
import mongoose from "mongoose";
import { ReservationSchema } from '../models/Reservation';
import { readFile } from 'fs'
import { join } from 'path'
import * as jwt from "jsonwebtoken";
import { User, userRole, UserSchema } from '../models/User';
import { Room, RoomSchema } from '../models/Room';

const PATH_PUBLIC_KEY = join(__dirname, '..', '..', 'public', 'auth-rsa.pub.key');
const usersConnection = mongoose.createConnection('mongodb://localhost:27017/users');
const reservationModel = usersConnection.model("Reservation", ReservationSchema);
const roomModel = usersConnection.model('Room', RoomSchema);
const userModel = usersConnection.model('User', UserSchema)

const list = async (req: Request, res: Response) => {
    const {fromDate, toDate } = req.body;
    let result = reservationModel.find({
        from: {$gt: fromDate},
        to: {$lt: toDate}
    })
    res.json(result);
}

const read = async (req: Request, res: Response) => {
    const { uid } = req.params;
    let user = getUserFromToken(req.header('Authorization')!);
    let result = reservationModel.findOne({_id: uid});
    result.populate('user');

    if(user.role == userRole.guest || user.role != result.user.role){
        return res.status(401).json({
            "message": "Guest can only view their own reservations"
        });
    }
    res.json(result);
}

export const Reservations = {list, read}

export const Create = async (req: Request, res: Response) => {
    //get request body
    const {roomNumber, userid} = req.body;
    const from = <Date>req.body.from;
    const to = <Date>req.body.to;
    console.log("1");
    //get id from room
    let room = await roomModel.findOne({roomNumber: roomNumber});
    console.log("2")
    //create reservation with userid and roomid
    const reservation = newReservation(from, to, room._id, userid)
    console.log("3")
    //save
    let roomAvailable = <Room>await roomModel
    .findOne({roomNumber: roomNumber})
        .populate('reservations')
            .find({
                from: {$gte: from},
                to: {$lte: to}
            });

    
    if(roomAvailable.reservations.length < 1){
        await reservation.save();
        await room.updateOne({$push: {reservations: reservation._id}});
        await room.save();
        res.status(200).json(reservation);
    }else{
        res.status(400).json({
            "message": "failed"
        })
    }
    
    
}

export const Delete = async (req: Request, res: Response) => {
    const {uid} = req.params;
    let reservation = await reservationModel.findOne({_id: uid}).exec();

    if(!reservation){
        return res.status(400).json({
            "message": "No reservation to delete"
        })
    } else {
        await reservation.delete();
        res.status(200).json({
            "message": `Reservation with Id: ${uid} deleted`
        })
    }
}

export const Patch = async (req: Request, res: Response) => {
    const {uid} = req.params;
    let reservation = await reservationModel.findOne({_id: uid}).exec();

    const {fromDate, toDate, roomNumber, userEmail} = req.body;
    if(fromDate){
        reservation.from = fromDate;
    }
    if(toDate){
        reservation.to = toDate;
    }
    if(roomNumber){
        let room = await roomModel.findOne({roomNumber: roomNumber}).exec();
        reservation.room = room._id;
    }
    if(userEmail){
        let user = await userModel.findOne({email: userEmail}).exec();
        reservation.user = user._id;
    }
    reservation.save();
    res.status(200).json({
        "message": "Reservation updated"
    });

}

const getUserFromToken = (token: string):any => {
    let user;
    readFile(PATH_PUBLIC_KEY, (err, publicKey) => {
        const jwtpayload = <any>jwt.verify(token, publicKey);
            user = jwtpayload.user;
            console.log("jwt", user);
            return user
    })
    
}
const roomAvailable = async (roomNumber: string, to: Date, from: Date) => {
    return await roomModel
        .findOne({roomNumber: roomNumber})
            .populate('reservations')
                .find({
                    from: {$gte: from},
                    to: {$lte: to}
                });
}


const newReservation = (from: Date, to: Date, room: mongoose.Schema.Types.ObjectId, user: mongoose.Schema.Types.ObjectId) => new reservationModel({
    from: from,
    to: to,
    room: room,
    user: user
});