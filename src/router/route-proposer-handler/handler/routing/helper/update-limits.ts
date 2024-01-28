import { SwapType } from "@balancer-labs/sdk";
import { ISwapInput, ITokenMap } from "../../../utils/types";
import { MAX_LIMIT } from "../../constant";
import { ethers } from "ethers";










/**
 * @dev this function is used to update proposeRoute Limits actually
 * @param proposeRoute 
 * @param kind 
 */
export function updateLimits(proposeRoute: {
    swapInput: ISwapInput[][];
    assets: string[][];
    tokenMap: ITokenMap;
    isEth: boolean;
}, kind: SwapType) {

    proposeRoute.swapInput.forEach((swapEle: any, index: number) => {
        if ('assets' in proposeRoute) {
            swapEle.swap.pop();

            swapEle.assets = proposeRoute.assets[index];
        }
        const newLimits = Array(swapEle.assets.length).fill("0");
        swapEle.swap.forEach((swap: any, index: number) => {

            if (kind === SwapType.SwapExactIn) {

                if (index === 0) {
                    newLimits[swap.assetInIndex] = swapEle.limits[0];
                }
                else {
                    newLimits[swap.assetInIndex] = "0";
                }
                if (index === swapEle.swap.length - 1) {
                    newLimits[swap.assetOutIndex] = swapEle.limits[1];
                }
            }
            else if (kind === SwapType.SwapExactOut) {

                if (index === 0) {
                    newLimits[swap.assetOutIndex] = swapEle.limits[1];
                }
                else {
                    newLimits[swap.assetInIndex] = "0";
                }
                if (index === swapEle.swap.length - 1) {
                    newLimits[swap.assetInIndex] = swapEle.limits[0];
                }
            }

        });

        swapEle.limits = newLimits;

    });

}


/**
 * @dev this function is used to update proposeRoute 
 * @param proposeRoute 
 * @param kind 
 */
export function updateMaxLimits(proposeRoute: {
    swapInput: ISwapInput[][];
    assets: string[][];
    tokenMap: ITokenMap;
    isEth: boolean;
}, kind: SwapType) {

    proposeRoute.swapInput.forEach((swapEle: any, index: number) => {
        // if ('assets' in proposeRoute) {
        //     swapEle.swap.pop();

        //     swapEle.assets = proposeRoute.assets[index];
        // }
        const newLimits = Array(swapEle.assets.length).fill("0");
        swapEle.swap.forEach((swap: any, index: number) => {

            if (kind === SwapType.SwapExactIn) {

                if (index === 0) {
                    newLimits[swap.assetInIndex] = MAX_LIMIT;
                }
                else {
                    newLimits[swap.assetInIndex] = "0";
                }
                if (index === swapEle.swap.length - 1) {
                    newLimits[swap.assetOutIndex] = "-0";
                }
            }
            else if (kind === SwapType.SwapExactOut) {

                if (index === 0) {
                    newLimits[swap.assetOutIndex] = "-0";
                }
                else {
                    newLimits[swap.assetInIndex] = "0";
                }
                if (index === swapEle.swap.length - 1) {
                    newLimits[swap.assetInIndex] = MAX_LIMIT;
                }
            }

        });

        swapEle.limits = newLimits;

    });

}
