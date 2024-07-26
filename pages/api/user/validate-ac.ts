import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { accessCode } = req.query as { accessCode: string };

    const accessCodeRecord = await prisma.accessCode.findUnique({
        where: {
            id: accessCode.toLowerCase()
        }
    });
    // Your validation logic goes here
    if (accessCodeRecord) {
        res.status(200).json({ message: 'Access code is valid' });
    } else {
        res.status(400).json({ message: 'Access code is invalid' });
    }
}