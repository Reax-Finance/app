import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { address } = req.query;
        console.log("Address: ", address);
        
        // const nextAuth = await auth(req, res);
        // console.log("NextAuth: ", nextAuth);
        if(!address) {
            res.status(400).json({ message: 'Bad Request' });
            return;
        }
        const user = await prisma.allowlistedUser.findUnique({
            where: {
                id: (address as string).toLowerCase()
            },
            include: {
                user: true,
                
            }
        })
        console.log("User: ", user);
        res.status(200).json({ message: 'Success', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}