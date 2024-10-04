import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { JOINEE_XP_REWARD, REFERRER_XP_REWARD } from "../../../../src/const";
import { isLoggedIn } from "../../../connect/actions/auth";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { payload } = await isLoggedIn();

  const address = payload?.parsedJWT.sub;
  if (!address) {
    return NextResponse.json({ message: "Bad Request" }, { status: 400 });
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
    return NextResponse.json(
      { message: "User not allowlisted" },
      { status: 400 }
    );
  }
  if (allowlistedUser.user) {
    return NextResponse.json(
      { message: "User already joined" },
      { status: 400 }
    );
  }
  if (!allowlistedUser.twitter) {
    return NextResponse.json(
      { message: "Twitter account not verified" },
      { status: 400 }
    );
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
      NextResponse.json(
        { message: "User joined successfully" },
        { status: 200 }
      );
    })
    .catch(async (err) => {
      await prisma.user.delete({
        where: {
          id: address,
        },
      });

      NextResponse.json(
        {
          message: "Error creating referral codes",
          error: err,
        },
        { status: 500 }
      );
    });
}
