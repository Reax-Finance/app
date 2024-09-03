import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { USERNAME_XP_REWARD } from "../../../../src/const";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username }: { username: string } = body;

    const session = await getServerSession(authOptions({ req }));
    const address = session?.user?.name;
    if (!session || !session.user || !address) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { message: "Username must be between 3 and 20 characters" },
        { status: 400 }
      );
    }

    // Check if the username is already taken
    const userWithUsername = await prisma.user.findFirst({
      where: {
        username: username,
      },
    });
    if (userWithUsername) {
      return NextResponse.json(
        { message: "Username is already taken" },
        { status: 400 }
      );
    }

    // Check if the user doesn't already have a username
    const user = await prisma.user.findFirst({
      where: {
        id: address.toLowerCase(),
      },
    });
    if (user?.username) {
      return NextResponse.json(
        { message: "User already has a username" },
        { status: 400 }
      );
    }

    // Set the username and update the balance
    await prisma.user.update({
      where: {
        id: address.toLowerCase(),
      },
      data: {
        username: username,
        balance: {
          increment: USERNAME_XP_REWARD,
        },
      },
    });

    return NextResponse.json(
      { message: "Username added successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error adding username:", err);
    return NextResponse.json(
      { message: "Error adding username", error: err },
      { status: 500 }
    );
  }
}
