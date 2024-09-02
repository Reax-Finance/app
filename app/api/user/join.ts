import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { JOINEE_XP_REWARD, REFERRER_XP_REWARD } from "../../../src/const";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/route";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions({ req }));
  let address = session?.user?.name?.toLowerCase();
  if (!address) {
    res.status(400).json({ message: "Bad Request" });
    return;
  }

  let initialXp = 0;
  let referrer = null;

  // Check if the address is allowlisted and has a twitter account
  const allowlistedUser = await prisma.allowlistedUser.findUnique({
    where: {
      id: address,
    },
    include: {
      twitter: true,
      joinedBy: true,
      user: true,
    },
  });
  if (!allowlistedUser) {
    res.status(400).json({ message: "User not allowlisted" });
    return;
  }
  if (allowlistedUser.user) {
    res.status(400).json({ message: "User already joined" });
    return;
  }
  if (!allowlistedUser.twitter) {
    res.status(400).json({ message: "Twitter account not verified" });
    return;
  }
  // If the user has a referrer, increment the initial XP
  if (allowlistedUser.joinedBy) {
    initialXp += JOINEE_XP_REWARD;
    referrer = allowlistedUser.joinedBy.userId;
  }

  // Create a whitelisted user
  await prisma.user.create({
    data: {
      id: address,
      balance: initialXp,
    },
  });

  // Create 5 referral codes
  await prisma
    .$transaction(
      [0, 0, 0, 0, 0].map(() => {
        return prisma.accessCode.create({
          data: {
            id: Math.random().toString(36).slice(-6),
            userId: address,
          },
        });
      })
    )
    .then(() => {
      if (referrer) {
        // Increment the referrer's balance
        prisma.user.update({
          where: {
            id: referrer,
          },
          data: {
            balance: {
              increment: REFERRER_XP_REWARD,
            },
          },
        });
      }
      res.status(200).json({ message: "User joined successfully" });
    })
    .catch(async (err) => {
      await prisma.user.delete({
        where: {
          id: address,
        },
      });
      res
        .status(500)
        .json({ message: "Error creating referral codes", error: err });
    });
}
