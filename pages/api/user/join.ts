import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { address } = req.body;

    // Check if the address is allowlisted
    const allowlist = await prisma.allowlistedUser.findUniqueOrThrow({
        where: {
            id: address.toLowerCase()
        }
    })

    // Create a whitelisted user
    await prisma.user.create({
        data: {
            id: allowlist.id,
        }
    })

    // Create 5 referral codes
    prisma.$transaction([,,,,].map(() => {
        return prisma.accessCode.create({
            data: {
                id: Math.random().toString(36).substring(7),
                userId: allowlist.id
            }
        })
    }))
    .then(() => {
        res.status(200).json({ message: "User joined successfully" });
    })
    .catch(async () => {
        await prisma.user.delete({
            where: {
                id: allowlist.id
            }
        })
        res.status(500).json({ message: "Error creating referral codes" });
    })
}