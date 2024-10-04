import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");
    console.log("address on get user route  is ", address);
    if (!address) {
      return NextResponse.json(
        { success: false, message: "Bad Request: Address is required" },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();

    console.log("Going to fetch user data for address: ", normalizedAddress);

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

    console.log("Allowlisted user result:", allowlistedUser);
    console.log("User record result:", userRecord);

    let user: any = {
      ...allowlistedUser,
      user: userRecord,
    };

    console.log("user from get-user is ", user);

    if (!allowlistedUser && !userRecord) {
      user = null;
    }

    return NextResponse.json(
      { success: true, message: "Success", user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error: ", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
