import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    username,
    address,
    balance,
  }: { username: string; address: string; balance: number } = req.body;
  console.log("Username :", username);

  await prisma.user
    .update({
      where: {
        id: address.toLowerCase(),
      },
      data: {
        username: username,
        balance: balance + 100,
      },
    })
    .then(() => {
      res.status(200).json({ message: "Username added successfully" });
    })
    .catch((err) => {
      res.status(500).json({ message: "Error adding username", error: err });
    });
}
