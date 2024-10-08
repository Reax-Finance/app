import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { isLoggedIn } from "../../../connect/actions/auth";
const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  console.log("Received Get request");

  const { searchParams } = new URL(req.url);
  const accessCode = searchParams.get("access-code") as string;
  console.log("Parsed accessCode:", accessCode);

  const { payload } = await isLoggedIn();
  const addr = payload?.parsedJWT.sub as string;
  const address = addr.toLowerCase();
  console.log("Logged-in user address:", address);

  if (!address) {
    console.log("No address found in payload, returning Bad Request");
    return NextResponse.json({ message: "Bad Request" });
  }

  const accessCodeRecord = await prisma.accessCode.findUnique({
    where: {
      id: accessCode.toLowerCase(),
    },
  });
  console.log("Access code record from database:", accessCodeRecord);

  // Step 5: Check if access code is valid
  if (!accessCodeRecord) {
    console.log("Invalid access code:", accessCode);
    return NextResponse.json({ status: 400, message: "Invalid access code" });
  }

  // Step 6: Check if the access code has already been used
  if (accessCodeRecord?.joinedUserId) {
    console.log(
      "Access code already used by user:",
      accessCodeRecord.joinedUserId
    );
    return NextResponse.json({
      status: 400,
      message: "Access code already used",
    });
  }

  // Step 7: Check if the user is already in the allowlistedUser table
  const existingUser = await prisma.allowlistedUser.findUnique({
    where: {
      id: address,
    },
  });
  console.log("Existing user record from allowlistedUser table:", existingUser);

  // Step 8: If the user is not found in the allowlistedUser table, add them
  if (!existingUser) {
    console.log(
      "User not found in allowlistedUser table, creating new record for user:",
      address
    );
    await prisma.allowlistedUser.create({
      data: {
        id: address,
      },
    });
  }

  // Step 9: Update the access code record to indicate that the user has joined
  await prisma.accessCode.update({
    where: {
      id: accessCode.toLowerCase(),
    },
    data: {
      joinedUserId: address,
    },
  });
  console.log("Access code updated with joined user:", address);

  // Step 10: Return success response
  console.log("Returning success response for user:", address);
  return NextResponse.json({ status: 200, message: "Success" });
}
