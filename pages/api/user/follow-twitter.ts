import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { TWITTER_FOLLOW_REWARD } from "../../../src/const";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions({ req }));

  const address = session?.user?.name;
  if (!session || !session.user || !address) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await prisma.user.findFirst({
    where: {
      id: address.toLowerCase(),
    },
  });

  await prisma.user
    .update({
      where: {
        id: address.toLowerCase(),
      },
      data: {
        balance: {
          increment: TWITTER_FOLLOW_REWARD,
        },
      },
    })
    .then(() => {
      res.status(200).json({ message: "Followed" });
    })
    .catch((err) => {
      res.status(500).json({ message: "Error Following", error: err });
    });
}
