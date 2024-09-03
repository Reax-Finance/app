import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export default async function GET(res: NextResponse) {
  // Return all tasks
  const tasks = await prisma.task.findMany();

  NextResponse.json({ status: 200, message: "Success", tasks });
}
