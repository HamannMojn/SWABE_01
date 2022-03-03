import * as jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from 'express';
import { join } from 'path'
import { readFile } from 'fs'
import { userRole, User } from "../models/User";


const PATH_PUBLIC_KEY = join(__dirname, '..', '..', 'public', 'auth-rsa.pub.key');
export const auth = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization');
    if(!token) return res.status(401).send('Access Denied');

    readFile(PATH_PUBLIC_KEY, (err, publicKey) => {
        if(err){
            return res.sendStatus(500);
        } else {
            const jwtpayload = <User>jwt.verify(token, publicKey);
            if(!jwtpayload) return res.status(401).send('Access Denied');
            next()         
        }
    })
}

export const authRole = (roles: Array<userRole>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const token = req.header('Authorization');
        if(!token) return res.status(401).send('Access Denied no token');

        readFile(PATH_PUBLIC_KEY, (err, publicKey) => {
            if(err){
                res.sendStatus(500);
            } else {
                const jwtpayload = <User>jwt.verify(token, publicKey);
                if(!jwtpayload) return res.status(401).send('Access Denied jwt');
                console.log(jwtpayload.role)

                roles.forEach((role) => {
                    if(jwtpayload.role == role.toString()){
                        next()
                    }
                })
                return res.status(401).send('Access Denied role');
            }
        })
    }
}