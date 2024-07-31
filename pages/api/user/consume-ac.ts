import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { accessCode } = req.query as { accessCode: string };
  const session = await getServerSession(req, res, authOptions({ req }));
  let address = session?.user?.name?.toLowerCase();
  if (!address) {
    res.status(400).json({ message: "Bad Request" });
    return;
  }

  const accessCodeRecord = await prisma.accessCode.findUnique({
    where: {
      id: accessCode.toLowerCase(),
    },
  });

  if (!accessCodeRecord) {
    res.status(400).json({ message: "Invalid access code" });
    return;
  }

  if (accessCodeRecord?.joinedUserId) {
    res.status(400).json({ message: "Access code already used" });
    return;
  }

  // Check if the user is already in the allowlistedUser table
  const existingUser = await prisma.allowlistedUser.findUnique({
    where: {
      id: address,
    },
  });

  if (!existingUser) {
    // Consuming the access code
    await prisma.allowlistedUser.create({
      data: {
        id: address,
      },
    });
  }

  await prisma.accessCode.update({
    where: {
      id: accessCode.toLowerCase(),
    },
    data: {
      joinedUserId: address,
    },
  });

  console.log("updated accessCode");

  res.status(200).json({ message: "Success" });
}
