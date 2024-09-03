import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../[...nextauth]/route";
import { JOIN_DISCORD_REWARD } from "../../../../../src/const";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { state, code } = await req.json();

    const session = await getServerSession(authOptions({ req }));
    const address = session?.user?.name?.toLowerCase();

    if (!address) {
      return NextResponse.json(
        { message: "Bad Request: Unauthorized" },
        { status: 400 }
      );
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_VERCEL_URL}/callback/discord`;

    const args = new URLSearchParams({
      code: code as string,
      grant_type: "authorization_code",
      client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID as string,
      client_secret: process.env.DISCORD_CLIENT_SECRET as string,
      redirect_uri: redirectUri,
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

    // Fetch user data from Discord
    const userResponse = await axios.get(
      `https://discord.com/api/v10/users/@me`,
      {
        headers: {
          Authorization: `Bearer ${response.data.access_token}`,
        },
      }
    );

    const userData = await prisma.allowlistedUser.findUnique({
      where: {
        id: address,
      },
      include: {
        discord: true,
      },
    });

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
      // If the user is reconnecting with a different Discord account
      if (userData?.discord?.discordId !== userResponse.data.id) {
        return NextResponse.json(
          {
            message: `Account already connected to another user. Please try again with @${userResponse.data.username}.`,
          },
          { status: 400 }
        );
      }

      // Update the existing Discord connection
      await prisma.discordConnect.update({
        where: {
          id: userData.discord.id,
          allowlistedUserId: address,
        },
        data: discordAccountData,
      });
    } else {
      // Create a new Discord connection
      await prisma.discordConnect.create({
        data: {
          ...discordAccountData,
          allowlistedUserId: address,
        },
      });

      // Allocate Discord connect points to the user
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

    return NextResponse.json(
      {
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
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error processing Discord callback:", error);
    let errMessage = JSON.stringify(error?.response?.data || error);

    if (errMessage.includes("PrismaClientKnownRequestError")) {
      errMessage =
        "Account already connected to another user. Please try again with a different account.";
    }

    return NextResponse.json({ message: errMessage }, { status: 400 });
  }
}
