import * as sentry from "@sentry/node";
import log from "../../config/logger";
import { getPoolData, startPoolData } from "../helper/get-pool-details";
import { getPositionBalance } from "./get-account-position";
import Big from "big.js";
import { getMintBurnData } from "./get-mint-burn-data";
import { ERROR } from "../utils/errors";
import { errorResponse } from "../utils/utils";

export async function getSynthsPL(accountId: string, poolId: string) {
  try {

    const positionBalance = await getPositionBalance(accountId, poolId);

    if (typeof (positionBalance) == 'object' && 'error' in positionBalance) {
      return positionBalance;
    }

    const poolData = getPoolData(poolId);
    if (!poolData) {
      return { status: false, error: ERROR.POOL_DATA_NOT_FOUND, statusCode: 400 };
    }

    let totalDebtUSD = poolData[1];   //pool.totalDebtUSD;    
    let totalSupply = poolData[0];  //pool.totalSupply;
    let debtPerc = Big(positionBalance).div(totalSupply).toString();
    let userDebtUSD = Big(debtPerc).mul(totalDebtUSD).toString();

    if (userDebtUSD <= "0") {
      return "0";
    }
    const mintBurn = await getMintBurnData(accountId, poolId);

    if (typeof (mintBurn) == 'object' && 'error' in mintBurn) {
      return mintBurn;
    }

    const { mint, burn } = mintBurn;
    const pl = Big(mint).minus(burn).minus(userDebtUSD).toFixed(4);
    return pl;
  }
  catch (error) {
    sentry.captureException(error);
    log.error(`${error} - ${__filename}`);
    return errorResponse(ERROR.INTERNAL_SERVER_ERROR, 500);
  }
}