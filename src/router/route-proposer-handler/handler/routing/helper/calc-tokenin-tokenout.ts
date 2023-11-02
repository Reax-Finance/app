import { SwapType } from "@balancer-labs/sdk";
import Big from "big.js";
import { BigNumberish, fp } from "../../../helper/math/numbers";

import { IError, ISwapInput, ITokenMap, PoolType } from "../../../utils/types";
import { ERROR } from "../../../utils/error";
import { MAX_LIMIT } from "../../constant";
import { stablePoolcalcInGivenOut, stablePoolcalcOutGivenIn } from "../../../helper/math/stable-pool";
import { weightedPoolTokenInForExactTokenOut, weightedPoolTokenInForTokenOut } from "../../../helper/math/wieghted-pool";




/**
 * @dev It is calculating actual amountIn/amountOut as per routing
 * @param output 
 * @param kind 
 * @param tokenMap 
 * @param slipage slipage in percentage, 1 means 1 % slipage
 * @returns 
 */
export function calcTokenInTokenOut(output: any, kind: SwapType, tokenMap: ITokenMap, slipage: number):
    (ISwapInput[][] | IError) {
    try {

        const updatedOutput: any = [];
        if (kind === SwapType.SwapExactOut) {
            output.reverse();
        }

        output.forEach((pools: any, index: number) => {

            if (pools[0].poolType !== PoolType.Synthex) {

                if (updatedOutput.length > 0) {
                    const l = updatedOutput.length - 1;
                    const lastArr = updatedOutput[l].swap;

                    if (kind === SwapType.SwapExactIn) {
                        pools[0].amountIn = lastArr[lastArr.length - 1]["amountOut"];
                    }
                    else if (kind === SwapType.SwapExactOut) {
                        pools.reverse();
                        pools[0].amountOut = lastArr[lastArr.length - 1]["amountIn"];
                    }
                }

                if (kind === SwapType.SwapExactIn) {

                    let amountIn: string = pools[0].amountIn;
                    let amountOut: string = pools[0].amountIn;

                    for (let i in pools) {

                        if (pools[i].poolType === PoolType.Stable) {
                            //amountIn
                            const amount = fp(Big(amountOut).minus(Big(amountOut).times(pools[i].swapFee)).div(10 ** tokenMap[pools[i]['assets']['assetIn']][2]).toFixed(18));

                            pools[i].parameters[4] = amount;
                            const _stablePoolcalcOutGivenIn = stablePoolcalcOutGivenIn(...pools[i].parameters as [BigNumberish[], BigNumberish, number, number, BigNumberish])?.toString()
                            if (!_stablePoolcalcOutGivenIn) {
                                console.log(`Error @ calcTokenInTokenOut -1`)
                                continue;
                            }
                            amountOut = Big(_stablePoolcalcOutGivenIn)
                                .times(10 ** tokenMap[pools[i]['assets']['assetOut']][2]).div(1e18).toFixed(0);

                            pools[i]["amount"] = "0";

                            const deleteKeysOfPool = ["swapFee", "amountIn", "amountOut", "parameters", "assets", "poolType"];

                            deleteKeysOfPool.forEach((key: string) => {
                                delete pools[i][key];
                            })
                        }
                        else if (pools[i].poolType === PoolType.Weighted) {

                            const amount = amountOut;

                            pools[i].parameters[0] = amount;

                            amountOut = Big(weightedPoolTokenInForTokenOut(...pools[i].parameters as [string, any]).toString()).times(10 ** pools[i].parameters[1]["decimalsOut"]).toFixed(0)

                            pools[i]["amount"] = "0";

                            const deleteKeysOfPool = ["swapFee", "amountIn", "amountOut", "parameters", "assets", "poolType"];

                            deleteKeysOfPool.forEach((key: string) => {
                                delete pools[i][key];
                            })
                        }

                        if (Number(i) === pools.length - 1) {
                            pools[0]["amount"] = amountIn;
                        }
                    }
                    // adding slipage either on first swap or last swap 
                    if (index === 0) {
                        amountOut = Big(amountOut).times(Big(1).minus(Big(slipage).div(100))).toFixed(0);
                        const limits = [amountIn, `-${amountOut}`];
                        updatedOutput.push({ swap: pools, isBalancerPool: true, limits: limits });
                    }
                    else {
                        const limits = [MAX_LIMIT, `-${amountOut}`];
                        updatedOutput.push({ swap: pools, isBalancerPool: true, limits: limits });
                    }

                    pools.push({ amountIn, amountOut });
                }

                else if (kind === SwapType.SwapExactOut) {

                    let amountIn: string = pools[0].amountOut;
                    let amountOut: string = pools[0].amountOut;

                    for (let i in pools) {

                        if (pools[i].poolType === PoolType.Stable) {

                            //amountOut
                            const amount = fp(Big(amountIn).plus(Big(amountIn).times(pools[i].swapFee)).div(10 ** tokenMap[pools[i]['assets']['assetOut']][2]).toFixed(18));

                            pools[i].parameters[4] = amount;
                            const _stablePoolcalcInGivenOut = stablePoolcalcInGivenOut(...pools[i].parameters as [BigNumberish[], BigNumberish, number, number, BigNumberish])?.toString();
                            if (!_stablePoolcalcInGivenOut) {
                                console.log(`Error @ calcTokenInTokenOut -2`)
                                continue;
                            }
                            amountIn = Big(_stablePoolcalcInGivenOut)
                                .times(10 ** tokenMap[pools[i]['assets']['assetIn']][2]).div(1e18).toFixed(0);

                            pools[i]["amount"] = "0";

                            const deleteKeysOfPool = ["swapFee", "amountIn", "amountOut", "parameters", "assets", "poolType"];

                            deleteKeysOfPool.forEach((key: string) => {
                                delete pools[i][key];
                            })
                        }
                        else if (pools[i].poolType === PoolType.Weighted) {

                            const amount = amountIn;

                            pools[i].parameters[0] = amount

                            amountIn = Big(weightedPoolTokenInForExactTokenOut(...pools[i].parameters as [string, any]).toString()).times(10 ** pools[i].parameters[1]["decimalsIn"]).toFixed(0)

                            pools[i]["amount"] = "0";

                            const deleteKeysOfPool = ["swapFee", "amountIn", "amountOut", "parameters", "assets", "poolType"];

                            deleteKeysOfPool.forEach((key: string) => {
                                delete pools[i][key];
                            })
                        }

                        if (Number(i) === pools.length - 1) {
                            pools[0]["amount"] = amountOut;
                        }
                    }

                    if (index === output.length - 1) {
                        amountIn = Big(amountIn).times(Big(1).plus(Big(slipage).div(100))).toFixed(0);
                    }

                    pools.push({ amountIn, amountOut });
                    const limits = [amountIn, `-${amountOut}`];
                    updatedOutput.push({ swap: pools, isBalancerPool: true, limits: limits });
                }
            }
            else if (pools[0].poolType === PoolType.Synthex) {

                if (updatedOutput.length > 0) {

                    const l = updatedOutput.length - 1;

                    const lastArr = updatedOutput[l].swap;

                    if (kind === SwapType.SwapExactIn) {
                        pools[0].amountIn = lastArr[lastArr.length - 1]["amountOut"];
                    }
                    else if (kind === SwapType.SwapExactOut) {
                        pools[0].amountOut = lastArr[lastArr.length - 1]["amountIn"];
                    }
                }

                if (kind === SwapType.SwapExactIn) {

                    let amountIn: string = pools[0].amountIn;
                    let amountOut: string = pools[0].amountIn;

                    for (let i in pools) {
                        const amountUSD = Big(amountOut).times(tokenMap[pools[i]['assets']['assetIn']][1]).div(10 ** tokenMap[pools[i]['assets']['assetIn']][2]).toFixed(18);

                        const slipageUSD = Big(amountUSD).times(pools[i].parameters.burnFee).plus(Big(amountUSD).times((pools[i].parameters.mintFee))).toFixed(18);

                        amountOut = Big(Big(amountUSD).minus(slipageUSD)).div(tokenMap[pools[i]['assets']['assetOut']][1]).times(1e18).toFixed(0);

                        pools[i]["amount"] = amountIn;

                        const deleteKeysOfPool = ["slipage", "amountIn", "amountOut", "parameters", "assets", "poolType"];

                        deleteKeysOfPool.forEach((key: string) => {
                            delete pools[i][key];
                        })
                    }

                    if (index === 0) {
                        amountOut = Big(amountOut).times(Big(1).minus(Big(slipage).div(100))).toFixed(0);
                        const limits = [amountIn, `-${amountOut}`];
                        updatedOutput.push({ swap: pools, isBalancerPool: false, limits: limits });
                    }
                    else {
                        const limits = [MAX_LIMIT, `-${amountOut}`];
                        updatedOutput.push({ swap: pools, isBalancerPool: false, limits: limits });

                    }
                    pools.push({ amountIn, amountOut });
                }
                else if (kind === SwapType.SwapExactOut) {
                    let amountIn: string = pools[0].amountOut;
                    let amountOut: string = pools[0].amountOut;

                    for (let i in pools) {

                        const amountUSD = Big(amountIn).times(tokenMap[pools[i]['assets']['assetOut']][1]).div(10 ** tokenMap[pools[i]['assets']['assetOut']][2]).toFixed(18);

                        const slipageUSD = Big(amountUSD).times(pools[i].parameters.burnFee).plus(Big(amountUSD).times((pools[i].parameters.mintFee))).toFixed(18);

                        amountIn = Big(Big(amountUSD).plus(slipageUSD)).div(tokenMap[pools[i]['assets']['assetIn']][1]).times(1e18).toFixed(0);

                        pools[i]["amount"] = amountOut;

                        const deleteKeysOfPool = ["slipage", "amountIn", "amountOut", "parameters", "assets", "poolType"];

                        deleteKeysOfPool.forEach((key: string) => {
                            delete pools[i][key];
                        })
                    }

                    if (index === output.length - 1) {
                        amountIn = Big(amountIn).times(Big(1).plus(Big(slipage).div(100))).toFixed(0);
                    }
                    pools.push({ amountIn, amountOut });
                    const limits = [amountIn, `-${amountOut}`];
                    updatedOutput.push({ swap: pools, isBalancerPool: false, limits: limits });
                }
            }
        })


        if (kind === SwapType.SwapExactOut) {
            updatedOutput.reverse()
        }
        return updatedOutput;

    }
    catch (error) {
        console.log("Error @ calcTokenInTokenOut", error);
        return { status: false, error: ERROR.INTERNAL_SERVER_ERROR, statusCode: 500 }
    }
}

