import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import {
  X_ACCOUNT_AGE_MIN,
  X_ACCOUNT_FOLLOWERS_MIN,
} from "../../../../src/const";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function TwitterFallback(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the authorization token from the parameters
  const { state, code } = req.body;

  console.log("Twitter State", state);
  console.log("Twitter Code", code);

  const session = await getServerSession(req, res, authOptions({ req }));

  console.log("Session is", session);

  let address = session?.user?.name?.toLowerCase();

  console.log("Address is", address);
  if (!address) {
    res.status(400).json({ message: "Bad Request" });
    return;
  }

  // Exchange the authorization token for an access token
  try {
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

    // get /2/users/me with query params for all tweet.fields and user.fields
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

    console.log("User Response", userResponse.data);

    // If user has less than 20 followers or account less than 3 months of age, reject the connection
    if (
      userResponse.data.data.public_metrics.followers_count <
      X_ACCOUNT_FOLLOWERS_MIN
    ) {
      return res.status(400).send({
        message: `Your account must have at least 20 followers to connect. Please try again with a different account.`,
      });
    } else if (
      new Date().getTime() -
        new Date(userResponse.data.data.created_at).getTime() <
      X_ACCOUNT_AGE_MIN
    ) {
      return res.status(400).send({
        message: `Your account must be at least 3 months old to connect. Please try again with a different account.`,
      });
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

    // If user has already connected their account, update data and redirect to dashboard (no points)
    if (alUserRecord?.twitter) {
      // Make sure the user is connecting the account they'd already connected
      if (alUserRecord.twitter.id !== twitterAccountData.id) {
        // throw new Error(`Account is not connected to your profile. Please try again with @${userData?.twitter?.username}`);
        res.status(400).send({
          message: `Account already connected to another user. Please try again with @${alUserRecord?.twitter?.username}.`,
        });
      }
      await prisma.twitterAccount.update({
        where: {
          id: userResponse.data.data.id,
          allowlistedUserId: address,
        },
        data: twitterAccountData,
      });
    } else {
      // Store the twitter account in the database
      await prisma.twitterAccount.create({
        data: {
          ...twitterAccountData,
          allowlistedUserId: address,
        },
      });
    }

    // Sucess
    res.status(200).send({
      twitter: {
        id: userResponse.data.data.id,
        name: userResponse.data.data.name,
        username: userResponse.data.data.username,
        verified: userResponse.data.data.verified,
        profileImageUrl: userResponse.data.data.profile_image_url,
        followersCount: userResponse.data.data.public_metrics.followers_count,
        updatedAt: new Date().toISOString(),
      },
    });

    console.log("Twitter Account created", twitterAccountData);
  } catch (error: any) {
    let err =
      error?.response?.data?.error_description ||
      JSON.stringify(error?.response?.data || error);
    console.log("Error", err, error);
    if (err.includes("PrismaClientKnownRequestError"))
      err =
        "Account already connected to another user. Please try again with a different account.";
    res.status(400).send({
      message: err,
    });
  }
}
