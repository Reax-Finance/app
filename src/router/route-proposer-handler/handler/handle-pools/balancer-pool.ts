import { SwapType } from "@balancer-labs/sdk";
import { getPrices } from "../../helper/fetch-price/token-prices";
import { IToken, ITokenMap } from "../../utils/types";
import { constantPrice } from "../constant";
import { handleStablePool } from "./helper/stable-pool";
import { handleWeightedPool } from "./helper/weighted-pool";
import { Graph } from "../../helper/graph/graph";








export function handleBalancerPool(allPools: any, tokenMap: ITokenMap, amount: string, kind: SwapType, usdPrice: number, graph: Graph): void {

    for (const currPool of allPools) {

        const currPooltokens: IToken[] = [];

        for (const token of currPool.tokens) {

            if (token.address === currPool.address) {
                continue;
            }
            const tokenPrice = getPrices(token.address) ?? (isNaN(Number(constantPrice[token.address])) ? null : Number(constantPrice[token.address])) ?? token.token.latestUSDPrice;
            if (!tokenPrice) {
                continue;
            }
            currPooltokens.push(token);
            tokenMap[token.address] = [token.symbol, tokenPrice.toString(), token.decimals];
        }

        for (const tokenIn of currPooltokens) {

            if (currPooltokens.length < 2 || !tokenMap[tokenIn.address]) {
                continue;
            }

            for (const tokenOut of currPooltokens) {

                if (tokenIn.address === tokenOut.address) {
                    continue;
                }

                if (currPool.poolType === "Weighted") {
                    handleWeightedPool(currPool, amount, usdPrice, kind, tokenMap, tokenIn, tokenOut, graph);
                }

                else if (currPool.poolType === "ComposableStable") {
                    handleStablePool(currPool, currPooltokens, kind, amount, usdPrice, tokenMap, tokenIn, tokenOut, graph);
                }
            }
        }
    }

}