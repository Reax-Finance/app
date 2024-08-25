import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { TWITTER_FOLLOW_REWARD } from "../../../src/const";

const prisma = new PrismaClient();

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
    // Return all tasks
    const tasks = await prisma.task.findMany();

    res.status(200).json({ message: "Success", tasks });
}