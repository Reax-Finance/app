
import { BigNumber as bnum } from '../../utils/bigNumber';







export function weightedPoolTokenInForTokenOut(
    amount: string,
    poolPairData: any
): bnum {
    const Bi = parseFloat(poolPairData.balanceIn);
    const Bo = parseFloat(poolPairData.balanceOut);
    const wi = parseFloat(poolPairData.weightIn);
    const wo = parseFloat(poolPairData.weightOut);
    const Ai = Number(amount) / (10 ** poolPairData.decimalsIn);
    const f = parseFloat(poolPairData.swapFee);
    return bnum(Bo * (1 - (Bi / (Bi + Ai * (1 - f))) ** (wi / wo)));

}


export function weightedPoolTokenInForExactTokenOut(
    amount: string,
    poolPairData: any
): bnum {
    const Bi = parseFloat(poolPairData.balanceIn);
    const Bo = parseFloat(poolPairData.balanceOut);
    const wi = parseFloat(poolPairData.weightIn);
    const wo = parseFloat(poolPairData.weightOut);
    const Ao = Number(amount) / (10 ** poolPairData.decimalsOut);
    const f = parseFloat(poolPairData.swapFee);
    return bnum((Bi * (-1 + (Bo / (-Ao + Bo)) ** (wo / wi))) / (1 - f));
}