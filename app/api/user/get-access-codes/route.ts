import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const address = searchParams.get("address");
    console.log("Address: ", address);

    // const nextAuth = await auth(req, res);
    // console.log("NextAuth: ", nextAuth);
    if (!address) {
      return NextResponse.json({ message: "Bad Request" }, { status: 400 });
    }

    const accessCodes = await prisma.accessCode.findMany({
      where: {
        userId: (address as string).toLowerCase(),
      },
    });

    console.log("Codes: ", ...accessCodes);
    return NextResponse.json(
      { message: "Success", accessCodes },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
