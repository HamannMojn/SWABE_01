import { json, Request, Response } from 'express';
import { User, UserSchema } from "../models/User";
import mongoose from "mongoose";
import { compare, hash } from 'bcrypt'
import { ROUNDS } from "../utils/auth-crypto";
import { sign } from 'jsonwebtoken';
import { join } from 'path'
import { readFile } from 'fs'

const usersConnection = mongoose.createConnection('mongodb://localhost:27017/users');
const userModel = usersConnection.model('User', UserSchema);

const X5U = 'http://localhost:3000/auth-rsa256.key.pub';

const PATH_PRIVATE_KEY = join(__dirname, '..', '..', 'auth-rsa.key');
const PATH_PUBLIC_KEY = join(__dirname, '..', '..', 'public', 'auth-rsa.pub.key');

const list = async (req: Request, res: Response) => {
    let result = await userModel.find({}).lean().exec();
    res.json(result);
}

const read = async (req: Request, res: Response) => {
    const { uid } = req.params;
    let result = await userModel.findOne({ _id: uid });
    if(!result){
        res.json({
            "message": "User not found"
        });
    }
    res.json(result);
}

export const Users = { list, read }

export const Create = async (req: Request, res: Response) => {
    const { password, name } = req.body;
    const email = req.body.email.toLowerCase();
    if(await userExists(email)){
        res.status(400).json({
            "message": "User already exists"
        });
    } else {
        const hashedPassword = await hash(password, ROUNDS);
        let user = newUser(email, name, hashedPassword)
        await user.save();
        res.json(user)
    }
}

export const Login = async (req: Request, res: Response) => {
    const password = req.body.password;
    const email = <string>req.body.email.toLowerCase();
    let user = <User>await userModel.findOne({ email }) 
    if(!user){
        return res.status(400).send('Email or password not correct');
    }
    let validPass = await compare(password, user.password);
    if(!validPass){
        return res.status(400).send('Email or password not correct');
    }
    readFile(PATH_PRIVATE_KEY, (err, privateKey) => {
        if(err){
            res.sendStatus(500);
        } else {
            const jwt = sign({ email, user }, privateKey, { expiresIn: '1h', header: {alg: 'RS256', x5u: X5U }})
            res.json(jwt);
        }
    })
    
}

const userExists = (email: string) => userModel.findOne({ email }).exec()

const newUser = (email: string, name: any, password: any) => new userModel({
        email: email,
        name: name,
        password: password,
        role: "Guest"
    });

