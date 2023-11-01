// import * as sentry from '@sentry/node';
// import { errorStackTrace } from '../../utils/util';
// import { ERROR } from '../../utils/errors';
// import { fetchUserPositions } from './fetch-user-positions';
// import { fetchPositionHistory } from './fetch-position-history';
// import { IHistory } from '../../utils/types';
// import { Request, Response } from 'express';
// import { isAddress } from 'ethers/lib/utils';
// import { LENDING_POOL } from '../../utils/constant';
// import { CHAIN_ID } from '../../utils/secrets';


// export async function getHistory(req: Request, res: Response) {
//   try {

//     const userId = (req.query.userId as string)?.toLowerCase();
//     const lendingPool = req.query.lendingPool as string;

//     // data validation
//     if (!userId || !isAddress(userId)) {
//       return res.status(400).send({ status: false, error: ERROR.USER_ID_NOT_VALID });
//     }

//     if (!lendingPool || !LENDING_POOL[CHAIN_ID].includes(lendingPool)) {
//       return res.status(400).send({ status: false, error: ERROR.LENDING_POOL_NOT_VALID });
//     }
//     const userPositions = await fetchUserPositions(userId, lendingPool);

//     if ('error' in userPositions) {
//       return res.status(userPositions.statusCode).send({ status: userPositions.status, error: userPositions.error });
//     }

//     const promiseReq: any = []
//     for (let positionId of userPositions) {
//       promiseReq.push(fetchPositionHistory(positionId, lendingPool));
//     }

//     const promiseRes = await Promise.all(promiseReq);
//     const data: Record<string, IHistory[]>[] = [];

//     userPositions.forEach((positionId: string, index: number) => {
//       const setData: Record<string, IHistory[]> = {};
//       setData[`${positionId}`] = promiseRes[index];
//       data.push(setData);
//     })

//     return res.status(200).send({ status: true, data });
//   }
//   catch (error) {
//     sentry.captureException(error);
//     errorStackTrace(error);
//     return res.status(500).send({ status: false, error: ERROR.INTERNAL_SERVER_ERROR });
//   }
// }