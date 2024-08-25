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
	const session = await getServerSession(req, res, authOptions({ req }));

	const address = session?.user?.name;
	if (!session || !session.user || !address) {
		return res.status(401).json({ message: "Unauthorized" });
	}

    const { taskId } = req.body;

	const userRecord = await prisma.user.findUniqueOrThrow({
		where: {
			id: address.toLowerCase(),
		},
        include: {
            userTasks: {
                where: {
                    taskId,
                },
            }
        }
	});

    if (!userRecord) {
        return res.status(404).json({ message: "User not found" });
    }

    if (userRecord.userTasks.length > 0) {
        return res.status(400).json({ message: "Task already completed" });
    }

	prisma.$transaction([
			prisma.userTask.create({
                data: {
                    taskId,
                    userId: address.toLowerCase(),
                    completed: true
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
			res.status(200).json({ message: "Task Completed" });
		})
		.catch((err) => {
			res.status(500).json({ message: "Error completing task:", error: err });
		});
}
