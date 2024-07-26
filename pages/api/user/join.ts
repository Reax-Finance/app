import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { address, accessCode }: {address: string, accessCode: string} = req.body;
    console.log(address, accessCode);
    if(!accessCode){
        // Check if the address is allowlisted
        const allowlist = await prisma.allowlistedUser.findUniqueOrThrow({
            where: {
                id: address.toLowerCase()
            }
        })
    } else {
        // Validate the access code
        const accessCodeRecord = await prisma.accessCode.findUniqueOrThrow({
            where: {
                id: accessCode
            }
        })
    }
    
    // Create a whitelisted user
    await prisma.user.create({
        data: {
            id: address.toLowerCase(),
        }
    })

    // Create 5 referral codes
    await prisma.$transaction([0,0,0,0,0].map(() => {
        return prisma.accessCode.create({
            data: {
                id: Math.random().toString(36).substring(7),
                userId: address.toLowerCase()
            }
        })
    }))
    .then(() => {
        res.status(200).json({ message: "User joined successfully" });
    })
    .catch(async (err) => {
        await prisma.user.delete({
            where: {
                id: address.toLowerCase()
            }
        })
        res.status(500).json({ message: "Error creating referral codes", error: err });
    })
}