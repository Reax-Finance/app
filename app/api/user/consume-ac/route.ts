import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
const prisma = new PrismaClient();

export default async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const accessCode = searchParams.get("accessCode")!;
  const session = await getServerSession(authOptions({ req }));
  let address = session?.user?.name?.toLowerCase();
  if (!address) {
    return NextResponse.json({ message: "Bad Request" });
  }

  const accessCodeRecord = await prisma.accessCode.findUnique({
    where: {
      id: accessCode.toLowerCase(),
    },
  });

  if (!accessCodeRecord) {
    return NextResponse.json({ status: 400, message: "Invalid access code" });
  }

  if (accessCodeRecord?.joinedUserId) {
    return NextResponse.json({
      status: 400,
      message: "Access code already used",
    });
  }

  // Check if the user is already in the allowlistedUser table
  const existingUser = await prisma.allowlistedUser.findUnique({
    where: {
      id: address,
    },
  });

  if (!existingUser) {
    // Consuming the access code
    await prisma.allowlistedUser.create({
      data: {
        id: address,
      },
    });
  }

  await prisma.accessCode.update({
    where: {
      id: accessCode.toLowerCase(),
    },
    data: {
      joinedUserId: address,
    },
  });

  console.log("updated accessCode");

  return NextResponse.json({ status: 200, message: "Success" });
}
