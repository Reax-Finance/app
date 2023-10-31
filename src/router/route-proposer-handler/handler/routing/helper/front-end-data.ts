import { SwapType } from "@balancer-labs/sdk";
import { ITokenMap } from "../../../utils/types";
import Big from "big.js";
import { MANTLE_TOKEN_ADDRESS, ZERO_ADDRESS } from "../../constant";
import { ERROR } from "../../../utils/error";





export function FEData(swapInput: any, kind: SwapType, _slipage: number, tokenMap: ITokenMap) {
    try{
        const swapInputLength = swapInput.length;
        const lastLimitLength = swapInput[swapInputLength - 1]["limits"].length;
        const lastSwapLength = swapInput[swapInputLength - 1]["swap"].length;
        const assetOutIndex = swapInput[swapInputLength - 1]["swap"][lastSwapLength - 1]["assetOutIndex"];
        const amountIn = swapInput[0]["limits"][0];
        const amountOut = swapInput[swapInputLength - 1]["limits"][lastLimitLength - 1].slice(1);
    
        let tokenOut = swapInput[swapInputLength - 1]["assets"][assetOutIndex];
        if (tokenOut === ZERO_ADDRESS) tokenOut = MANTLE_TOKEN_ADDRESS;
        const amountOutUSD = Big(amountOut).times(tokenMap[tokenOut][1]).div(10 ** tokenMap[tokenOut][2]).toFixed(18);
    
        if (kind === SwapType.SwapExactIn) {
            const assetInIndex = swapInput[0]["swap"][0]["assetInIndex"];
            let tokenIn = swapInput[0]["assets"][assetInIndex];
            if (tokenIn === ZERO_ADDRESS) tokenIn = MANTLE_TOKEN_ADDRESS;
            const estimatedOut = Big(amountOut).times(Big(1).plus(Big(_slipage).div(100))).toFixed(0);
    
            const amountInUSD = Big(amountIn).times(tokenMap[tokenIn][1]).div(10 ** tokenMap[tokenIn][2]).toFixed(18);
    
            const slipage = Big(amountInUSD).minus(amountOutUSD).toString();
            const priceImpact = Big(slipage).div(amountInUSD).times(100);
            return {
                estimatedOut,
                minOut: amountOut,
                priceImpact
            }
        }
        else {
            const firstSwapLength = swapInput[0]["swap"].length;
            const assetInIndex = swapInput[0]["swap"][firstSwapLength - 1]["assetInIndex"];
            let tokenIn = swapInput[0]["assets"][assetInIndex];
            if (tokenIn === ZERO_ADDRESS) tokenIn = MANTLE_TOKEN_ADDRESS;
            const estimatedIn = Big(amountIn).times(Big(1).minus(Big(_slipage).div(100))).toFixed(0);
    
            const amountInUSD = Big(amountIn).times(tokenMap[tokenIn][1]).div(10 ** tokenMap[tokenIn][2]).toFixed(18);
    
            const slipage = Big(amountInUSD).minus(amountOutUSD).toString();
            const priceImpact = Big(slipage).div(amountInUSD).times(100);
            return {
                maxIn: amountIn,
                estimatedIn,
                priceImpact
            }
        }
    
    }
    catch(error){
        console.log(`Error @ FEData: ${error}`, __dirname);
        return { status: false, error: ERROR.INTERNAL_SERVER_ERROR, statusCode: 500 }
    }
   
}

