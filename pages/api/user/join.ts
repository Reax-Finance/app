import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { JOINEE_XP_REWARD, REFERRER_XP_REWARD } from "../../../src/const";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let { address, accessCode }: { address: string; accessCode: string } =
    req.body;
  address = address.toLowerCase();
  accessCode = accessCode.toLowerCase();

  let initialXp = 0;
  let referrer = null;

  if (accessCode.length < 2) {
    // Check if the address is allowlisted
    const allowlist = await prisma.allowlistedUser.findUniqueOrThrow({
      where: {
        id: address,
      },
    });
    if (!allowlist) {
      res.status(400).json({ message: "User not allowlisted" });
      return;
    }
  } else {
    // Validate the access code
    const accessCodeRecord = await prisma.accessCode.findUniqueOrThrow({
      where: {
        id: accessCode,
      },
      include: {
        joinedUser: true,
        user: true,
      },
    });

    initialXp += JOINEE_XP_REWARD;
    referrer = accessCodeRecord.user.id;
  }

  // Create a whitelisted user
  await prisma.user.create({
    data: {
      id: address,
      balance: initialXp,
      allowlistedUser: accessCode ? undefined : ({ id: address } as any),
    },
  });

  // Create 5 referral codes
  await prisma
    .$transaction(
      [0, 0, 0, 0, 0].map(() => {
        return prisma.accessCode.create({
          data: {
            id: Math.random().toString(36).substring(7),
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
