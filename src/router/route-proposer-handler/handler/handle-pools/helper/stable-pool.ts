import { SwapType } from "@balancer-labs/sdk";
import Big from "big.js";
import { IPool, PoolType, IToken, ITokenMap } from "../../../utils/types";
import { BigNumber } from 'ethers';
import { BigNumberish, fp } from "../../../helper/math/numbers";
import { stablePoolcalcInGivenOut, stablePoolcalcOutGivenIn } from "../../../helper/math/stable-pool";
import { Graph } from "../../../helper/graph/graph";






export function handleStablePool(currPool: IPool, currPooltokens: IToken[], kind: SwapType, amount: string, usdPrice: number, tokenMap: ITokenMap, tokenIn: IToken, tokenOut: IToken, graph: Graph) {
    try {

        const poolId = currPool.id;
        let tokens: string[] = [];
        let allBalances: BigNumber[] = [];

        for (const currToken of currPooltokens) {
            tokens.push(currToken.address);
            allBalances.push(fp(currToken.balance));
        }

        if (kind === SwapType.SwapExactIn) {

            let amountIn = Big(amount).times(usdPrice)
                .div(tokenMap[tokenIn.address][1])
                .toFixed(18);

            let amountInAfterFee: BigNumber = fp(Big(amountIn).minus(Big(amountIn).times(currPool.swapFee)).toFixed(18))
            let parameters: [BigNumberish[], BigNumberish, number, number, BigNumberish] = [allBalances, (currPool.amp!), tokens.indexOf(tokenIn.address), tokens.indexOf(tokenOut.address), amountInAfterFee]

            const _stablePoolcalcOutGivenIn = stablePoolcalcOutGivenIn(...parameters)?.toString();

            if (!_stablePoolcalcOutGivenIn) {
                return
            }

            let tokenOutAmount: string = Big(_stablePoolcalcOutGivenIn).div(1e18).toFixed(18);

            let expectedAmountUSD: string = Big(amountIn).times(tokenMap[tokenIn.address][1]).toFixed(18);

            let actualAmountUSD: string = Big(tokenOutAmount.toString()).times(tokenMap[tokenOut.address][1]).toFixed(18);

            let slipageUSD: number = Big(expectedAmountUSD).minus(actualAmountUSD).toNumber();

            const amountInTokenDecimal: string = Big(amountIn).times(10 ** tokenMap[tokenIn.address][2]).toFixed(0);

            const amountOutTokenDecimal: string = Big(tokenOutAmount).times(10 ** tokenMap[tokenOut.address][2]).toFixed(0);

            // console.log("Slipage-stable", slipageUSD)
            slipageUSD = slipageUSD > 0 ? slipageUSD : 0;

            graph.addEdge(tokenIn.address, tokenOut.address, slipageUSD, poolId, amountInTokenDecimal, amountOutTokenDecimal, PoolType.Stable, parameters, currPool.swapFee);

        }

        if (kind === SwapType.SwapExactOut) {

            const amountOut: string = Big(amount).times(usdPrice)
                .div(tokenMap[tokenOut.address][1])
                .toFixed(18);

            let parameters: [BigNumberish[], BigNumberish, number, number, BigNumberish] = [allBalances, (currPool.amp!), tokens.indexOf(tokenIn.address), tokens.indexOf(tokenOut.address), fp(amountOut)]

            const _stablePoolcalcInGivenOut = stablePoolcalcInGivenOut(...parameters)?.toString();
            if (!_stablePoolcalcInGivenOut) {
                return
            }
            let amountIn: string = Big(_stablePoolcalcInGivenOut).div(1e18).toFixed(18);

            const expectedAmountUSD: string = Big(amountOut).times(tokenMap[tokenOut.address][1]).toFixed(18);

            const amountInAfterFee: string = Big(amountIn).plus(Big(amountIn).times(currPool.swapFee)).toFixed(18);

            const actualAmountUSD: string = Big(amountInAfterFee).times(tokenMap[tokenIn.address][1]).toFixed(18);

            let slipageUSD: number = Big(actualAmountUSD).minus(expectedAmountUSD).toNumber();

            const amountInTokenDecimal: string = Big(amountInAfterFee).times(10 ** tokenMap[tokenIn.address][2]).toFixed(0);

            const amountOutTokenDecimal: string = Big(amountOut).times(10 ** tokenMap[tokenOut.address][2]).toFixed(0);

            // console.log("Slipage-stable", slipageUSD);
            slipageUSD = slipageUSD > 0 ? slipageUSD : 0;
            graph.addEdge(tokenIn.address, tokenOut.address, slipageUSD, poolId, amountInTokenDecimal, amountOutTokenDecimal, PoolType.Stable, parameters, currPool.swapFee);

        }


    }
    catch (error) {
        console.log("Error @ handleStablePool", error)
    }
}