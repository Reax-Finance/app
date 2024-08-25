import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { address } = req.query as { address: string };

    // Log the address to ensure it is being received correctly

    if (!address) {
      res.status(400).json({ message: "Bad Request: Address is required" });
      return;
    }

    const normalizedAddress = address.toLowerCase();

    const [allowlistedUser, userRecord] = await prisma.$transaction([
      prisma.allowlistedUser.findUnique({
        where: {
          id: normalizedAddress,
        },
        include: {
          twitter: true,
          discord: true,
        },
      }),
      prisma.user.findUnique({
        where: {
          id: normalizedAddress,
        },
        include: {
          userTasks: true,
          accessCodes: {
            include: {
              joinedUser: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      }),
    ]);

    let user: any = {
      ...allowlistedUser,
      user: userRecord,
    };

    if (!allowlistedUser && !userRecord) {
      user = null;
    }

    res.status(200).json({ message: "Success", user });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
