import type { NextApiRequest, NextApiResponse } from 'next'

import { isAddress } from 'ethers/lib/utils.js';
import { setPoolAddresses } from '../../src/synths/controllers/helper/set-pool-addresses';
import { startPoolData } from '../../src/synths/controllers/helper/get-pool-details';
import { fetchPrices } from '../../src/synths/controllers/helper/fetch-tokens-details';
import { ERROR } from '../../src/synths/controllers/utils/errors';
import { getSynthsPL } from '../../src/synths/controllers/synths-position-pl';

let isRunning = false;
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {

    const accountId = (req.query.accountId as string)?.toLowerCase();
    const poolId = (req.query.poolId as string)?.toLowerCase();
    
    // data validation
    if (!poolId || !isAddress(poolId)) {
      return res.status(400).send({ status: false, error: ERROR.POOL_ID_NOT_VALID });
    }

    if (!accountId || !isAddress(accountId)) {
      return res.status(400).send({ status: false, error: ERROR.ACCOUNT_ID_NOT_VALID });
    }

    if (!isRunning) {
      await start();
    }
    const data = await getSynthsPL(accountId, poolId);

    if (typeof (data) == 'object' && 'error' in data) {
      return res.status(data.statusCode).send({ status: data.status, error: data.error });
    }
    return res.status(200).send({ status: true, data });

  }
  catch (error) {
    return res.status(500).send({ status: false, error: ERROR.INTERNAL_SERVER_ERROR })
  }
}

async function start() {
  await fetchPrices();
  await setPoolAddresses();
  await startPoolData();
  isRunning = true;
}

