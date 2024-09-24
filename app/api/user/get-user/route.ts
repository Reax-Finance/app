import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");
    if (!address) {
      return NextResponse.json(
        { message: "Bad Request: Address is required" },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();

    const [allowlistedUser, userRecord] = await prisma.$transaction([
      prisma.allowlistedUser.findUnique({
        where: {
          id: normalizedAddress,
        },
        include: {
          twitter: true,
          discord: true,
        },
      }),
      prisma.user.findUnique({
        where: {
          id: normalizedAddress,
        },
        include: {
          accessCodes: {
            include: {
              joinedUser: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      }),
    ]);

    let user: any = {
      ...allowlistedUser,
      user: userRecord,
    };

    console.log("user is ", user);

    if (!allowlistedUser && !userRecord) {
      user = null;
    }

    return NextResponse.json({ message: "Success", user }, { status: 200 });
  } catch (error) {
    console.error("Error: ", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
