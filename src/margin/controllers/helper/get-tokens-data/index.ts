import axios from 'axios';
import * as sentry from '@sentry/node';
import { ITokenData } from '../../../utils/types';
import { CONSTANT_PRICES, PRICES_URL } from '../../../utils/constant';
import { errorStackTrace } from '../../../utils/util';
let prices: Record<string, [string, string, number]> = {}
/**
 * @dev It is used to update the data of token e.g price etc
 * @param chainId 
 * @returns 
 */
export async function updateTokenData(chainId: string): Promise<boolean> {
  try {
    let getPrices: ITokenData = {};

    const pricesUrl = PRICES_URL[chainId];
    try {
      getPrices = (await axios.get(pricesUrl))?.data?.data;
    } catch (error) {
      errorStackTrace(error);
      return false;
    }

    if (!Object.keys(getPrices).length) {
      return true;
    }
    prices = getPrices;
    return true
  } catch (error) {
    sentry.captureException(error);
    errorStackTrace(error);
    return false;
  }
}

export function getTokenData(tokenAddress: string): [string, string, number] | null {
  let price = null;
  // remove below if block its only for testnet
  if(tokenAddress == '0xb9821fb9e1e77ffb0f7d6b638a551d565eb882c8') {
    tokenAddress = '0x41fc4dfa6b2aafcc192335b309f64e3cf83c9ccd';
  }
  if (!prices[tokenAddress]) {
    price = CONSTANT_PRICES[tokenAddress] ? CONSTANT_PRICES[tokenAddress] : null;
    return price;
  }
  return prices[tokenAddress];
}
