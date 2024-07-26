import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { username } = req.query as { username: string };

  const isValidUsername = await prisma.user.findUnique({
    where: {
      username: username.toLowerCase(),
    },
  });
  if (isValidUsername) {
    res.status(200).json({ message: "Username is valid" });
  } else {
    res.status(400).json({ message: "Username is invalid" });
  }
}
