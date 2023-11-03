import type { NextApiRequest, NextApiResponse } from 'next'
import { LENDING_POOL } from '../../../src/margin/utils/constant';
import { CHAIN_ID } from '../../../src/margin/utils/secrets';
import { IHistory } from '../../../src/margin/utils/types';
import { isAddress } from 'ethers/lib/utils.js';
import { ERROR } from '../../../src/margin/utils/errors';
import { errorStackTrace } from '../../../src/margin/utils/util';
import * as sentry from '@sentry/node';
import { fetchUserPositions } from '../../../src/margin/controllers/get-history/fetch-user-positions';
import { fetchPositionHistory } from '../../../src/margin/controllers/get-history/fetch-position-history';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {

    const userId = (req.query.userId as string)?.toLowerCase();
    const lendingPool = (req.query.lendingPool as string)?.toLowerCase();

    // data validation
    if (!userId || !isAddress(userId)) {
      return res.status(400).send({ status: false, error: ERROR.USER_ID_NOT_VALID });
    }

    if (!lendingPool || !LENDING_POOL[CHAIN_ID].includes(lendingPool)) {
      return res.status(400).send({ status: false, error: ERROR.LENDING_POOL_NOT_VALID });
    }
    const userPositions = await fetchUserPositions(userId, lendingPool);
    
    if ('error' in userPositions) {
      return res.status(userPositions.statusCode).send({ status: userPositions.status, error: userPositions.error });
    }

    const promiseReq: any = []
    for (let positionId of userPositions) {
      promiseReq.push(fetchPositionHistory(positionId, lendingPool));
    }

    const promiseRes = await Promise.all(promiseReq);
    const data: Record<string, IHistory[]>[] = [];

    userPositions.forEach((positionId: string, index: number) => {
      // const setData: Record<string, IHistory[]> = {};
      // setData[`${positionId}`] = promiseRes[index];
      data.push(promiseRes[index]);
    })

    return res.status(200).send({ status: true, data });
  }
  catch (error) {
    sentry.captureException(error);
    errorStackTrace(error);
    return res.status(500).send({ status: false, error: ERROR.INTERNAL_SERVER_ERROR });
  }
}

