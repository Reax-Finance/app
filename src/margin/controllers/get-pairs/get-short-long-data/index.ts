import * as sentry from '@sentry/node';
import { errorResponse, errorStackTrace } from '../../../utils/util';
import { ERROR } from '../../../utils/errors';
import { IMarket } from '../../../utils/types';
import Big from 'big.js';
import { PERP_POSITION_FACTORY } from '../../../utils/constant';

/**
 * @dev It is used to get data related to short and long tokens e.g maxLeverage, liquidity, token symbol etc
 * @param shortToken IMarket
 * @param longToken IMarket
 * @param lendingPool 
 * @returns 
 */
export function getShortLongTokenData(shortToken: IMarket, longToken: IMarket, lendingPool: string) {
  try {

    const shortLiquidity = Big(shortToken.totalDepositBalanceUSD).minus(shortToken.totalBorrowBalanceUSD).toString();
    const longLiquidity = Big(longToken.totalDepositBalanceUSD).minus(longToken.totalBorrowBalanceUSD).toString();
    const shortMaxLeverage = Big(1).div(Big(1).minus(Big(shortToken.maximumLTV).div(100))).toFixed(2);
    const longMaxLeverage = Big(1).div(Big(1).minus(Big(longToken.maximumLTV).div(100))).toFixed(2);

    const long = {
      maxLeverage: longMaxLeverage,
      liquidity: shortLiquidity
    }
    const short = {
      maxLeverage: shortMaxLeverage,
      liquidity: longLiquidity
    }
    const token0 = {
      id: longToken.inputToken.id,
      symbol: longToken.inputToken.symbol,
      name: longToken.inputToken.name,
      decimals: longToken.inputToken.decimals
    }
    const token1 = {
      id: shortToken.inputToken.id,
      symbol: shortToken.inputToken.symbol,
      name: shortToken.inputToken.name,
      decimals: shortToken.inputToken.decimals
    }
    const perpFactory = PERP_POSITION_FACTORY[lendingPool];

    if (!perpFactory) {
      return errorResponse(ERROR.PERP_POSITION_FACTORY_NOT_FOUND, 500)
    }
    return { long, short, token0, token1, perpFactory };
  }
  catch (error) {
    sentry.captureException(error);
    errorStackTrace(error);
    return errorResponse(ERROR.INTERNAL_SERVER_ERROR, 500);
  }
}