import { json, Request, Response } from 'express';
import { User, userRole, UserSchema } from "../models/User";
import mongoose from "mongoose";
import { compare, hash } from 'bcrypt'
import { ROUNDS } from "../utils/auth-crypto";
import { sign } from 'jsonwebtoken';
import { join } from 'path'
import { readFile } from 'fs'
import { textSpanContainsPosition } from 'typescript';

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
    let role;
    switch (req.body.role) {
        case userRole.clerk:
            role = userRole.clerk;
            break;
        case userRole.manager:
            role = userRole.manager;
            break;
        default:
            role = userRole.guest
            break;
    }
    
    if(await userExists(email)){
        res.status(400).json({
            "message": "User already exists"
        });
    } else {
        const hashedPassword = await hash(password, ROUNDS);
        let user = newUser(email, name, hashedPassword, role)
        await user.save();
        res.status(200).json(user)
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

const newUser = (email: string, name: string, password: string, role: userRole) => new userModel({
        email: email,
        name: name,
        password: password,
        role: role
    });

