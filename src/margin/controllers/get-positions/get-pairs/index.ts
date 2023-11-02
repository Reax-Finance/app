import { PAIRS, PERPS_SUBGRAPH, TOKEN_LIST, } from "../../../utils/constant";
import { ERROR } from "../../../utils/errors";
import { CHAIN_ID } from "../../../utils/secrets";
import { errorResponse, errorStackTrace } from "../../../utils/util";
import * as sentry from '@sentry/node';
import { pairQuery } from "../../helper/query";
import { IErrorResponse, IPairPosition, POSITION_SIDE } from "../../../utils/types";
import axios, { AxiosError } from "axios";

export async function getPairs(positionId: string, lendingPool: string): Promise<string[][] | IErrorResponse> {
  try {
    let position: IPairPosition;
    const chainId = CHAIN_ID;
    const perpsGraphURL = PERPS_SUBGRAPH[chainId];
    const query = pairQuery(positionId);

    try {
      position = (await axios.post(perpsGraphURL, {
        query: query
      })).data?.data?.position;
    } catch (error) {
      const err = error as AxiosError
      errorStackTrace(err);
      sentry.captureException(err);
      return errorResponse(err.response?.data, err.response?.status);
    }

    if (!position) {
      return errorResponse(ERROR.PERPS_POSITION_NOT_FOUND, 400);
    }

    const pairs: string[][] = [];

    for (let openPosition of position.openPositions) {
      const token0: string = openPosition.token0.symbol;
      const token1: string = openPosition.token1.symbol;

      if (!TOKEN_LIST[lendingPool].includes(token0)) {
        return errorResponse(`${ERROR.TOKEN_NOT_FOUND_IN_PAIR_LIST}: ${token0}`, 400);
      }
      if (!TOKEN_LIST[lendingPool].includes(token1)) {
        return errorResponse(`${ERROR.TOKEN_NOT_FOUND_IN_PAIR_LIST}: ${token1}`, 400);
      }

      const pairLong = token0 + '-' + token1;
      const pairShort = token1 + '-' + token0;

      if (PAIRS[lendingPool].includes(pairLong)) {
        pairs.push([pairLong, POSITION_SIDE.LONG]);
      }
      else if (PAIRS[lendingPool].includes(pairShort)) {
        pairs.push([pairShort, POSITION_SIDE.SHORT]);
      }
      else {
        return errorResponse(`${ERROR.PAIR_NOT_FOUND}: ${pairLong}`, 400);
      }
    }
    return pairs;
  }
  catch (error) {
    sentry.captureException(error);
    errorStackTrace(error);
    return errorResponse(ERROR.INTERNAL_SERVER_ERROR, 500);
  }
}
