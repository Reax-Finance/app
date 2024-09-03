import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../[...nextauth]/route";
import {
  X_ACCOUNT_AGE_MIN,
  X_ACCOUNT_FOLLOWERS_MIN,
} from "../../../../../src/const";

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

    const args = new URLSearchParams({
      code: code as string,
      grant_type: "authorization_code",
      client_id: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID as string,
      redirect_uri: `${process.env.NEXT_PUBLIC_VERCEL_URL}/callback/twitter`,
      code_verifier: "challenge",
    });

    const response = await axios.post(
      "https://api.twitter.com/2/oauth2/token",
      args.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
            ).toString("base64"),
        },
      }
    );

    const userResponse = await axios.get("https://api.twitter.com/2/users/me", {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + response.data.access_token,
      },
      params: {
        "user.fields":
          "created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,withheld",
      },
    });

    if (
      userResponse.data.data.public_metrics.followers_count <
      X_ACCOUNT_FOLLOWERS_MIN
    ) {
      return NextResponse.json(
        {
          message: `Your account must have at least 20 followers to connect. Please try again with a different account.`,
        },
        { status: 400 }
      );
    }

    if (
      new Date().getTime() -
        new Date(userResponse.data.data.created_at).getTime() <
      X_ACCOUNT_AGE_MIN
    ) {
      return NextResponse.json(
        {
          message: `Your account must be at least 3 months old to connect. Please try again with a different account.`,
        },
        { status: 400 }
      );
    }

    const twitterAccountData = {
      id: userResponse.data.data.id,
      name: userResponse.data.data.name,
      username: userResponse.data.data.username,
      followersCount: userResponse.data.data.public_metrics.followers_count,
      profileImageUrl: userResponse.data.data.profile_image_url,
      accessToken: response.data.access_token,
      expiresIn: response.data.expires_in,
      refreshToken: response.data.refresh_token,
    };

    const alUserRecord = await prisma.allowlistedUser.findUnique({
      where: {
        id: address,
      },
      include: {
        twitter: true,
      },
    });

    if (alUserRecord?.twitter) {
      if (alUserRecord.twitter.id !== twitterAccountData.id) {
        return NextResponse.json(
          {
            message: `Account already connected to another user. Please try again with @${alUserRecord?.twitter?.username}.`,
          },
          { status: 400 }
        );
      }
      await prisma.twitterAccount.update({
        where: {
          id: userResponse.data.data.id,
          allowlistedUserId: address,
        },
        data: twitterAccountData,
      });
    } else {
      await prisma.twitterAccount.create({
        data: {
          ...twitterAccountData,
          allowlistedUserId: address,
        },
      });
    }

    return NextResponse.json(
      {
        twitter: {
          id: userResponse.data.data.id,
          name: userResponse.data.data.name,
          username: userResponse.data.data.username,
          verified: userResponse.data.data.verified,
          profileImageUrl: userResponse.data.data.profile_image_url,
          followersCount: userResponse.data.data.public_metrics.followers_count,
          updatedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    let errMessage =
      error?.response?.data?.error_description ||
      JSON.stringify(error?.response?.data || error);
    if (errMessage.includes("PrismaClientKnownRequestError")) {
      errMessage =
        "Account already connected to another user. Please try again with a different account.";
    }

    return NextResponse.json(
      {
        message: errMessage,
      },
      { status: 400 }
    );
  }
}
