import { SwapType } from "@balancer-labs/sdk";
import { getPools } from "./handler/balancer-pool/fetch-data";
import { routeSeperator } from "./handler/routing/route-seperator";
import {
	MANTLE_TOKEN_ADDRESS,
	ZERO_ADDRESS,
	constantPrice,
} from "./handler/constant";
import { ERROR } from "./utils/error";
import {
	IDijkstraResponse,
	IError,
	IPool,
	IRouteProposer,
	ISwapInput,
	ITokenMap,
} from "./utils/types";
import { promises as fs } from "fs";
import path from "path";
import { handleSynthPool } from "./handler/handle-pools/synth-pool";
import { getPrices } from "./helper/fetch-price/token-prices";
import { Graph } from "./helper/graph/graph";
import { handleBalancerPool } from "./handler/handle-pools/balancer-pool";
import {
	updateLimits,
	updateMaxLimits,
} from "./handler/routing/helper/update-limits";
import { FEData } from "./handler/routing/helper/front-end-data";

export async function routeProposer(args: IRouteProposer): Promise<
	| IError
	| {
			kind: SwapType;
			swaps: ISwapInput[][];
			deadline: number;
			recipient: string;
			fData: any;
	  }
> {
	try {
		let { amount, t1, t2, kind, slipage, recipient, deadline } = args;

		if (isNaN(Number(amount)) || Number(amount) <= 0) {
			return {
				status: false,
				error: ERROR.AMOUNT_NOT_VALID,
				statusCode: 400,
			};
		}

		if (kind != SwapType.SwapExactIn && kind != SwapType.SwapExactOut) {
			return {
				status: false,
				error: ERROR.KIND_NOT_VALID,
				statusCode: 400,
			};
		}

		t1 = t1.toLowerCase();
		t2 = t2.toLowerCase();
		let isEth: boolean = false;
		const tokenIn = t1;
		const tokenOut = t2;
		if (t1 === ZERO_ADDRESS || t2 === ZERO_ADDRESS) {
			isEth = true;
			t1 = t1 === ZERO_ADDRESS ? MANTLE_TOKEN_ADDRESS : t1;
			t2 = t2 === ZERO_ADDRESS ? MANTLE_TOKEN_ADDRESS : t2;
		}

		let usdPrice: number =
			kind == SwapType.SwapExactIn
				? getPrices(t1) ?? Number(constantPrice[t1])
				: getPrices(t2) ?? Number(constantPrice[t2]);
		let allPools: IPool[] = getPools();
		const pools = JSON.parse(
			(
				await fs.readFile(
					path.join(
						__filename +
							"/../../../../../src/router/route-proposer-handler/handler/synth-pool/synth-pool-config.json"
					)
				)
			).toString()
		);

        console.log("usdPrice", usdPrice);

		if (!usdPrice) {
			const tokenAddress = kind === SwapType.SwapExactIn ? t1 : t2;
			let flag = false;
			for (const poolId of Object.keys(pools)) {
				if (pools[poolId]["synths"][tokenAddress]) {
					const tokenPrice = getPrices(tokenAddress);
					if (tokenPrice) {
						usdPrice = tokenPrice;
						flag = true;
						break;
					}
				}
			}
			if (!flag)
				return {
					status: false,
					error: ERROR.TOKEN_NOT_FOUND,
					statusCode: 400,
				};
		}

		if (!allPools)
			return {
				status: false,
				error: ERROR.INTERNAL_SERVER_ERROR,
				statusCode: 500,
			};

		const graph: Graph = new Graph();

		let tokenMap: ITokenMap = {};

		handleBalancerPool(allPools, tokenMap, amount, kind, usdPrice, graph);

		const poolIds = Object.keys(pools);

		handleSynthPool(
			poolIds,
			pools,
			amount,
			usdPrice,
			tokenMap,
			kind,
			graph
		);

		const result: { [key: string]: IDijkstraResponse } | IError =
			graph.dijkstra(t1, t2);

		if (typeof result == "object" && "status" in result) {
			return result as IError;
		}

		if (!result || !result[t2] || result[t2]["slipage"] == Infinity) {
			return {
				status: false,
				error: ERROR.PAIR_NOT_AVAILABLE,
				statusCode: 400,
			};
		}

		const outPut: IDijkstraResponse[] = [];

		let sourceAsset = t2;
		while (true) {
			let currAsset = sourceAsset;
			outPut.push(result[currAsset]);
			if (result[currAsset]["assets"]["assetIn"] != t1) {
				sourceAsset = result[currAsset]["assets"]["assetIn"];
			} else {
				break;
			}
		}

		outPut.reverse();

		let proposeRoute = routeSeperator(outPut, tokenMap, kind, slipage);

		if (typeof proposeRoute == "object" && "status" in proposeRoute) {
			return proposeRoute;
		}

		if (isEth) {
			if (tokenIn === ZERO_ADDRESS) {
				proposeRoute.assets[0][0] = ZERO_ADDRESS;
			}
			if (tokenOut === ZERO_ADDRESS) {
				const lastAssetsIndex = proposeRoute.assets.length - 1;
				const lastAssetsArrayIndex =
					proposeRoute.assets[lastAssetsIndex].length - 1;
				proposeRoute.assets[lastAssetsIndex][lastAssetsArrayIndex] =
					ZERO_ADDRESS;
			}
		}

		//updating proposeRoute.swapInput
		updateLimits(proposeRoute, kind);

		const fData = FEData(
			proposeRoute.swapInput,
			kind,
			slipage,
			proposeRoute.tokenMap
		);
		// to make limits in effective
		updateMaxLimits(proposeRoute, kind);

		// if (kind === SwapType.SwapExactOut) {
		//     // re routing as GivenIn.
		//     let _tokenIn = t1;

		//     if (_tokenIn === ZERO_ADDRESS) _tokenIn = MANTLE_TOKEN_ADDRESS;

		//     const amount = Big(fData.maxIn).div(10 ** proposeRoute.tokenMap[_tokenIn][2]).toString();
		//     t1 = tokenIn; t2 = tokenOut; // restore initial state
		//     const data = await routeProposer(
		//         { amount, t1, t2, kind: SwapType.SwapExactIn, slipage, recipient, deadline }
		//     );

		//     if (typeof data == "object" && "status" in data) {
		//         return data
		//     }
		//     // that fData is preserve state for exactOut
		//     data.fData = fData;
		//     return data

		// }

		const data = {
			kind,
			swaps: proposeRoute.swapInput,
			deadline,
			recipient,
			fData,
		};

		return data;
	} catch (error) {
		console.log(`Error @ routeProposer ${error}`, __dirname);
		return {
			status: false,
			error: ERROR.INTERNAL_SERVER_ERROR,
			statusCode: 500,
		};
	}
}
