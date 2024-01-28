import { SwapType } from "@balancer-labs/sdk";
import Big from "big.js";
import { bnum } from "../../../utils/bigNumber";
import { IPool, IPoolPairData, PoolType, IToken, ITokenMap } from "../../../utils/types";
import { Graph } from "../../../helper/graph/graph";
import { weightedPoolTokenInForExactTokenOut, weightedPoolTokenInForTokenOut } from "../../../helper/math/wieghted-pool";







export function handleWeightedPool(currPool: IPool, amount: string, usdPrice: number, kind: SwapType, tokenMap: ITokenMap, tokenIn: IToken, tokenOut: IToken, graph: Graph) {
    try {

        const poolId = currPool.id;

        if (kind === SwapType.SwapExactIn) {

            const tokenInAmount = Big(amount).times(usdPrice)
                .times(10 ** tokenMap[tokenIn.address][2])
                .div(tokenMap[tokenIn.address][1])
                .toFixed(0);
            let parameters: [string, IPoolPairData] = [(tokenInAmount),
            {
                balanceIn: bnum(tokenIn.balance),
                balanceOut: bnum(tokenOut.balance),
                decimalsIn: bnum(tokenIn.decimals),
                decimalsOut: bnum(tokenOut.decimals),
                weightIn: bnum(tokenIn.weight!),
                weightOut: bnum(tokenOut.weight!),
                swapFee: bnum(currPool.swapFee)
            }]
            const tokenOutAmount = weightedPoolTokenInForTokenOut(...parameters);

            if (isNaN(Number(tokenOutAmount)) || Number(tokenOutAmount) < 0) {
                return
            }

            const actualAmountUSD = Big(tokenOutAmount.toString()).times(tokenMap[tokenOut.address][1]).toFixed(18);

            const expectedAmountUSD = Big(tokenInAmount)
                .div((10 ** tokenMap[tokenIn.address][2]))
                .times(tokenMap[tokenIn.address][1]).toFixed(18);

            let slipageUSD = Big(expectedAmountUSD).minus(actualAmountUSD).toNumber();

            // console.log("Slipage-weighted", slipageUSD)
            slipageUSD = slipageUSD > 0 ? slipageUSD : 0;

            const amountInTokenDecimal = Big(tokenInAmount).toFixed(0);

            const amountOutTokenDecimal = Big(tokenOutAmount.toString()).times(10 ** tokenMap[tokenOut.address][2]).toFixed(0);

            if (!slipageUSD) slipageUSD = 0;

            graph.addEdge(tokenIn.address, tokenOut.address, slipageUSD, poolId, amountInTokenDecimal, amountOutTokenDecimal, PoolType.Weighted, parameters, currPool.swapFee);
        }

        else if (kind === SwapType.SwapExactOut) {
            const tokenOutAmount = Big(amount).times(usdPrice)
                .times(10 ** tokenMap[tokenOut.address][2])
                .div(tokenMap[tokenOut.address][1])
                .toFixed(0);

            const parameters: [string, IPoolPairData] = [
                (tokenOutAmount),
                {
                    balanceIn: bnum(tokenIn.balance),
                    balanceOut: bnum(tokenOut.balance),
                    decimalsIn: bnum(tokenIn.decimals),
                    decimalsOut: bnum(tokenOut.decimals),
                    weightIn: bnum(tokenIn.weight!),
                    weightOut: bnum(tokenOut.weight!),
                    swapFee: bnum(currPool.swapFee)
                }
            ]
            const tokenInAmount = weightedPoolTokenInForExactTokenOut(...parameters);
            if (isNaN(Number(tokenInAmount)) || Number(tokenInAmount) < 0) {
                return
            }

            const actualAmountUSD = Big(tokenInAmount.toString()).times(tokenMap[tokenIn.address][1]).toFixed(18);

            const expectedAmountUSD = Big(tokenOutAmount)
                .div((10 ** tokenMap[tokenOut.address][2]))
                .times(tokenMap[tokenOut.address][1]).toFixed(18);

            let slipageUSD = Big(actualAmountUSD).minus(expectedAmountUSD).toNumber();

            // console.log("Slipage-weighted", slipageUSD)

            slipageUSD = slipageUSD > 0 ? slipageUSD : 0;

            const amountInTokenDecimal = Big(tokenInAmount.toString()).times(10 ** tokenMap[tokenIn.address][2]).toFixed(0);

            const amountOutTokenDecimal = Big(tokenOutAmount).toFixed(0);

            if (!slipageUSD) slipageUSD = 0;

            graph.addEdge(tokenIn.address, tokenOut.address, slipageUSD, poolId, amountInTokenDecimal, amountOutTokenDecimal, PoolType.Weighted, parameters, currPool.swapFee);
        }
    }
    catch (error) {
        console.log("Error @ handleWeightedPool", error)
    }
}