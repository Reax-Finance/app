import axios, { AxiosError } from 'axios';
import * as sentry from '@sentry/node';
import { CHAIN_ID } from '../../../utils/secrets';
import { LENDING_SUBGRAPH } from '../../../utils/constant';
import { positionQuery } from '../../helper/query';
import { IErrorResponse, IPosition, SIDE } from '../../../utils/types';
import { errorResponse, errorStackTrace } from '../../../utils/util';
import { ERROR } from '../../../utils/errors';

/**
 * @dev it is used to get data from lending subgraph and seprate position on the basis of combined position
 * @param positionId 
 * @param lendingPool 
 * @returns 
 */
export async function fetchPosition(positionId: string, lendingPool: string): Promise<IErrorResponse | IPosition[][]> {
  try {
    let positions: IPosition[] = [];
    const chainId = CHAIN_ID;
    const lendingGraphUrl = LENDING_SUBGRAPH[chainId][lendingPool];
    const query = positionQuery(positionId);

    try {
      positions = (await axios.post(lendingGraphUrl, {
        query: query
      })).data?.data?.account?.positions;
    } catch (error) {
      const err = error as AxiosError
      errorStackTrace(err);
      sentry.captureException(err);
      return errorResponse(err.response?.data, err.response?.status);
    }

    let positionStorage: Record<string, IPosition[]> = {};

    positions.forEach((position: IPosition) => {

      if (positionStorage[position.combinedPosition.toString()]) {
        positionStorage[position.combinedPosition.toString()].push(position);
      }
      else {
        positionStorage[position.combinedPosition.toString()] = [position];
      }

    });

    return Object.values(positionStorage);
  } catch (error) {
    sentry.captureException(error);
    errorStackTrace(error);
    return errorResponse(ERROR.INTERNAL_SERVER_ERROR, 500);
  }
}
