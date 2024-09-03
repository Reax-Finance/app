import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { TWITTER_FOLLOW_REWARD } from "../../../../src/const";

const prisma = new PrismaClient();

export default async function PUT(req: NextRequest, res: NextResponse) {
  const session = await getServerSession(req, res, authOptions({ req }));

  const address = session?.user?.name;
  if (!session || !session.user || !address) {
    return NextResponse.json({ status: 401, message: "Unauthorized" });
  }
  const body = await req.json();
  const { taskId } = body;

  const userRecord = await prisma.user.findUniqueOrThrow({
    where: {
      id: address.toLowerCase(),
    },
    include: {
      userTasks: {
        where: {
          taskId,
        },
      },
    },
  });

  if (!userRecord) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  if (userRecord.userTasks.length > 0) {
    return NextResponse.json(
      { message: "Task already completed" },
      { status: 400 }
    );
  }

  prisma
    .$transaction([
      prisma.userTask.create({
        data: {
          taskId,
          userId: address.toLowerCase(),
          completed: true,
          updatedAt: new Date(),
        },
      }),
      prisma.user.update({
        where: {
          id: address.toLowerCase(),
        },
        data: {
          balance: {
            increment: TWITTER_FOLLOW_REWARD,
          },
        },
      }),
    ])
    .then(() => {
      NextResponse.json({ message: "Task Completed" }, { status: 200 });
    })
    .catch((err) => {
      NextResponse.json(
        { message: "Error completing task:", error: err },
        { status: 500 }
      );
    });
}
