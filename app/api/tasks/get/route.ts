import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  // Return all tasks
  try {
    const tasks = await prisma.task.findMany();
    return NextResponse.json({ status: 200, message: "success", tasks });
  } catch (error: any) {
    return NextResponse.json({
      status: 400,
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
}
