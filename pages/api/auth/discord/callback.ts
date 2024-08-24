import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]";
import { JOIN_DISCORD_REWARD } from "../../../../src/const";

export default async function DiscordCallback(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prisma = new PrismaClient();
  const { state, code } = req.body;

  const session = await getServerSession(req, res, authOptions({ req }));
  let address = session?.user?.name?.toLowerCase();
  if (!address) {
    res.status(400).json({ message: "Bad Request" });
    return;
  }

  console.log(
    "Redirect uri",
    `${process.env.NEXT_PUBLIC_VERCEL_URL}/callback/discord`
  );

  try {
    const args = new URLSearchParams({
      code: code as string,
      grant_type: "authorization_code",
      client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID as string,
      client_secret: process.env.DISCORD_CLIENT_SECRET as string,
      redirect_uri: `${process.env.NEXT_PUBLIC_VERCEL_URL}/callback/discord`,
    });
    const response = await axios.post(
      "https://discord.com/api/v10/oauth2/token",
      args.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // get user data
    const userResponse = await axios.get(
      `https://discord.com/api/v10/users/@me`,
      {
        headers: {
          Authorization: `Bearer ${response.data.access_token}`,
        },
      }
    );

    console.log("first");
    // Check if user account already exists
    const userData = await prisma.allowlistedUser.findUnique({
      where: {
        id: address,
      },
      include: {
        discord: true,
      },
    });
    console.log("second");

    const discordAccountData = {
      name: userResponse.data.username,
      discordId: userResponse.data.id,
      username: userResponse.data.username,
      avatar:
        "https://cdn.discordapp.com/avatars/" +
        userResponse.data.id +
        "/" +
        userResponse.data.avatar +
        ".png",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresIn: response.data.expires_in,
    };
    if (userData?.discord) {
      // Make sure the user is re connecting the same account
      if (userData?.discord?.discordId != userResponse.data.id) {
        res.status(400).send({
          message: `Account already connected to another user. Please try again with @${userResponse.data.username}.`,
        });
      }
      // Update the account with new access token
      await prisma.discordConnect.update({
        where: {
          id: userData?.discord?.id,
          allowlistedUserId: address,
        },
        data: discordAccountData,
      });
    } else {
      // Store the discord account in the database
      await prisma.discordConnect.create({
        data: {
          ...discordAccountData,
          allowlistedUserId: address,
        },
      });

      // If user account exists, allocate discord connect points to the user
      const account = await prisma.allowlistedUser.findUnique({
        where: {
          id: address,
        },
      });
      if (account) {
        await prisma.user.update({
          where: {
            id: address,
          },
          data: {
            balance: {
              increment: JOIN_DISCORD_REWARD,
            },
          },
        });
      }
    }
    res.status(200).send({
      discord: {
        id: userResponse.data.id,
        username: userResponse.data.username,
        avatar:
          "https://cdn.discordapp.com/avatars/" +
          userResponse.data.id +
          "/" +
          userResponse.data.avatar +
          ".png",
        name: userResponse.data.username,
        discordId: userResponse.data.id,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    let err = JSON.stringify(error?.response?.data || error);
    console.log("Error", err);
    if (err.includes("PrismaClientKnownRequestError"))
      err =
        "Account already connected to another user. Please try again with a different account.";
    res.status(400).send({ message: err });
  }
}
