import { SwapType } from "@balancer-labs/sdk";
import Big from "big.js";
import Web3 from 'web3';
import { PoolType } from "../../utils/types";
import { constantPrice } from "../constant";
import { getPrices } from "../../helper/fetch-price/token-prices";
import { Graph } from "../../helper/graph/graph";





export function handleSynthPool(poolIds: string[], pools: any, amount: string, usdPrice: number, tokenMap: any, kind: SwapType, graph: Graph): void {
    try {
        const synthDecimals = 18;
        const basePoints = 10000;
        for (let poolId of poolIds) {

            const synthTokens = Object.keys(pools[poolId]["synths"]);

            for (const tokenIn of synthTokens) {

                for (const tokenOut of synthTokens) {

                    if (tokenIn === tokenOut) {
                        continue;
                    }

                    const burnFee = Big(pools[poolId]["synths"][tokenIn]["burnFee"]).div(basePoints).toNumber();
                    const mintFee = Big(pools[poolId]["synths"][tokenOut]["mintFee"]).div(basePoints).toNumber();

                    const tokenInPriceUSD = getPrices(tokenIn) ?? Number(constantPrice[tokenIn]);
                    const tokenOutPriceUSD = getPrices(tokenOut) ?? Number(constantPrice[tokenOut]);

                    if (!tokenInPriceUSD || !tokenOutPriceUSD) {
                        continue;
                    }

                    if (!tokenMap[tokenIn]) {
                        tokenMap[tokenIn] = [pools[poolId]["synths"][tokenIn]["symbol"], tokenInPriceUSD, synthDecimals];
                    }
                    if (!tokenMap[tokenOut]) {
                        tokenMap[tokenOut] = [pools[poolId]["synths"][tokenOut]["symbol"], tokenOutPriceUSD, synthDecimals];
                    }

                    let slipageUSD = Big(amount).times(usdPrice).times(burnFee)
                        .plus(Big(amount).times(usdPrice).times(mintFee)).toNumber();

                    let amountIn = Big(amount).times(usdPrice)
                        .times(10 ** tokenMap[tokenIn][2]).div(tokenInPriceUSD).toFixed(0);

                    let amountOut = Big(Big(amount).times(usdPrice).minus(slipageUSD))
                        .times(10 ** tokenMap[tokenOut][2]).div(tokenOutPriceUSD).toFixed(0);

                    graph.addVertex(tokenIn);

                    if (kind === SwapType.SwapExactOut) {

                        amountIn = Big(Big(amount).times(usdPrice).plus(slipageUSD))
                            .times(10 ** tokenMap[tokenIn][2]).div(tokenInPriceUSD).toFixed(0);

                        amountOut = Big(amount).times(usdPrice)
                            .times(10 ** tokenMap[tokenOut][2]).div(tokenOutPriceUSD).toFixed(0);

                    }
                    // console.log("TOKENOUT //////", +amountOut/(10 ** tokenMap[tokenOut][2]),tokenIn, tokenOut, poolId);
                    const parameters = { burnFee, mintFee }

                    const web3 = new Web3();
                    // converting address to bytes32
                    const currPoolId = web3.utils.padLeft(poolId, 64).toLowerCase();
                    // console.log(+amountIn / 1e18, +amountOut / 1e18, slipageUSD, tokenIn, tokenOut, currPoolId);
                    // console.log("                       ");
                    graph.addEdge(tokenIn, tokenOut, slipageUSD, currPoolId, amountIn, amountOut, PoolType.Synthex, parameters, "0")
                }
            }
        }
        
    }
    catch (error) {
        console.log("Error @ handleSynthexPool", error);
    }
}

