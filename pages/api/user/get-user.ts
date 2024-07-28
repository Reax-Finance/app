import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		const { address } = req.query;
		console.log("Address: ", address);

		// const nextAuth = await auth(req, res);
		// console.log("NextAuth: ", nextAuth);
		if (!address) {
			res.status(400).json({ message: "Bad Request" });
			return;
		}
		const [allowlistedUser, userRecord] = await prisma.$transaction([
			prisma.allowlistedUser.findUnique({
				where: {
					id: (address as string).toLowerCase(),
				},
			}),
			prisma.user.findUnique({
				where: {
					id: (address as string).toLowerCase(),
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
        }
        if(!allowlistedUser && !userRecord) {
            user = null
        };
		res.status(200).json({ message: "Success", user });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal Server Error" });
	}
}
