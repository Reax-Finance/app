import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { USERNAME_XP_REWARD } from "../../../src/const";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    username
  }: { username: string; address: string; balance: number } = req.body;
  const session = await getServerSession(req, res, authOptions({ req }));

  const address = session?.user?.name;
  if(!session || !session.user || !address){
    return res.status(401).json({ message: "Unauthorized" });
  }

  if(username.length < 3 || username.length > 20){
    return res.status(400).json({ message: "Username must be between 3 and 20 characters" });
  }

  // check if username is already taken
  const userWithUsername = await prisma.user.findFirst({
    where: {
      username: username,
    },
  });
  if (userWithUsername) {
    return res.status(400).json({ message: "Username is already taken" });
  }
  // check if user doesn't already have a username
  const user = await prisma.user.findFirst({
    where: {
      id: address.toLowerCase(),
    },
  });
  if (user?.username) {
    return res.status(400).json({ message: "User already has a username" });
  }

  // Set username
  await prisma.user
    .update({
      where: {
        id: address.toLowerCase(),
      },
      data: {
        username: username,
        balance: {
          increment: USERNAME_XP_REWARD
        }
      },
      
    })
    .then(() => {
      res.status(200).json({ message: "Username added successfully" });
    })
    .catch((err) => {
      res.status(500).json({ message: "Error adding username", error: err });
    });
}
