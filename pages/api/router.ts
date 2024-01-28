import type { NextApiRequest, NextApiResponse } from "next";
import { ERROR } from "../../src/router/route-proposer-handler/utils/error";
import { routeProposer } from "../../src/router/route-proposer-handler/route-proposer";
import { fetchSynthPoolData } from "../../src/router/route-proposer-handler/handler/synth-pool/get-synth-details";
import { fetchPoolData } from "../../src/router/route-proposer-handler/handler/balancer-pool/fetch-data";
import { startUpdatePrice } from "../../src/router/route-proposer-handler/helper/fetch-price/token-prices";

let isRunning = false;
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		console.log("req.query", req.query);

		const {
			tokenIn,
			tokenOut,
			amount,
			kind,
			slipage,
			recipient,
			deadline,
		} = req.query as any;

		const input = [
			tokenIn,
			tokenOut,
			amount,
			kind,
			slipage,
			recipient,
			deadline,
		];

		for (let e of input) {
			if (e === undefined || !e) {
				return res
					.status(400)
					.send({
						status: false,
						error: ERROR.PROPERTY_MISSING_IN_REQ_QUERY,
					});
			}
		}

		if (!isRunning) {
			await start();
		}

		const data = await routeProposer({
			amount,
			t1: tokenIn,
			t2: tokenOut,
			kind: Number(kind),
			slipage: Number(slipage),
			recipient,
			deadline: Number(deadline),
		});

		if (
			(typeof data == "object" && "status" in data) ||
			data === undefined
		) {
			if (data == undefined) {
				return res
					.status(500)
					.send({
						status: false,
						error: ERROR.INTERNAL_SERVER_ERROR,
					});
			}
			return res
				.status(data.statusCode)
				.send({ status: false, error: data.error });
		}

		return res.status(200).send({ status: true, data: data });
	} catch (error) {
		console.log("Error @ getPath", error);
		return res
			.status(500)
			.send({ status: false, error: ERROR.INTERNAL_SERVER_ERROR });
	}
}

async function start() {
	await fetchSynthPoolData();
	await fetchPoolData();
	await startUpdatePrice();
	isRunning = true;
}
