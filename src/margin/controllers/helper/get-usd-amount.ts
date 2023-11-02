import log from "../../config/logger";
import * as sentry from '@sentry/node';
import { getTokenData } from "./get-tokens-data";
import Big from "big.js";
export function toUSDAmount(tokenAddress: string, amount: string): string | null {
  try {
    const tokenData = getTokenData(tokenAddress);
    if (!tokenData) {
      log.warn(`TOKEN_DATA_NOT_FOUND: ${tokenAddress}`)
      return null;
    }
    const amountUSD = Big(amount).div(10 ** tokenData[2]).times(tokenData[0]).toString();
    return amountUSD
  }
  catch (error) {
    log.error(`${error} - ${__filename}`);
    sentry.captureException(error);
    return null;
  }
}