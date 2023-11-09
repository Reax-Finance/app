import type { NextApiRequest, NextApiResponse } from 'next'
import { LENDING_POOL, PAIRS, TOKEN_LIST } from '../../../src/margin/utils/constant';
import { CHAIN_ID } from '../../../src/margin/utils/secrets';
import { IErrorResponse, IMarket, IPairResponse } from '../../../src/margin/utils/types';
import { isAddress } from 'ethers/lib/utils.js';
import { ERROR } from '../../../src/margin/utils/errors';
import { fetchMarkets } from '../../../src/margin/controllers/get-pairs/fetch-markets';
import log from '../../../src/margin/config/logger';
import { getShortLongTokenData } from '../../../src/margin/controllers/get-pairs/get-short-long-data';
import { errorStackTrace } from '../../../src/margin/utils/util';
import * as sentry from '@sentry/node';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const lendingPool = (req.query.lendingPool as string)?.toLowerCase();

    if (!isAddress(lendingPool) || !LENDING_POOL[CHAIN_ID].includes(lendingPool)) {
      return res.status(400).send({ status: false, error: ERROR.LENDING_POOL_NOT_VALID })
    }
    const marketsData: IErrorResponse | Record<string, IMarket> = await fetchMarkets(lendingPool);

    if ('error' in marketsData) {
      return res.status(400).send({ status: marketsData.status, error: marketsData.error });
    }
    const data: Record<string, IPairResponse> = {}

    const pairs = PAIRS[lendingPool];
    if (!pairs) {
      return res.status(400).send({ status: false, error: ERROR.PAIR_NOT_FOUND });
    }

    pairs.forEach((pair: string) => {

      const longToken = pair.split('-')[0];
      const shortToken = pair.split('-')[1];
      if (!TOKEN_LIST[lendingPool]?.includes(longToken) || !TOKEN_LIST[lendingPool]?.includes(shortToken)) {
        log.warn(`${ERROR.TOKEN_NOT_FOUND_IN_PAIR_LIST} - ${longToken} - ${shortToken}`)
        return
      }
      if (!marketsData.hasOwnProperty(longToken) || !marketsData.hasOwnProperty(shortToken)) {
        return;
      }
      let shortLongData = getShortLongTokenData(marketsData[shortToken], marketsData[longToken], lendingPool);
      if ('error' in shortLongData) {
        return;
      }
      data[pair] = shortLongData;
    })

    return res.status(200).send({ status: true, data: data });
  }
  catch (error) {
    sentry.captureException(error);
    errorStackTrace(error);
    return res.status(500).send({ status: false, error: ERROR.INTERNAL_SERVER_ERROR });
  }
}

