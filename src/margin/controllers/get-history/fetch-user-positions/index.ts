import { PERPS_SUBGRAPH, } from "../../../utils/constant";
import { ERROR } from "../../../utils/errors";
import { CHAIN_ID } from "../../../utils/secrets";
import { errorResponse, errorStackTrace } from "../../../utils/util";
import * as sentry from '@sentry/node';
import { userPositionQuery } from "../../helper/query";
import { IErrorResponse, IFetchUserPosition,  } from "../../../utils/types";
import axios, { AxiosError } from "axios";

export async function fetchUserPositions(userId: string, lendingPool: string): Promise<string[] | IErrorResponse> {
  try {
    let positions: IFetchUserPosition[] = [];
    const chainId = CHAIN_ID;

    const perpsGraphURL = PERPS_SUBGRAPH[chainId];
    const query = userPositionQuery(userId);
    try {
      positions = (await axios.post(perpsGraphURL, {
        query: query
      })).data?.data?.user?.positions;

    } catch (error) {
      const err = error as AxiosError
      errorStackTrace(err);
      sentry.captureException(err);
      return errorResponse(err.response?.data, err.response?.status);
    }

    if (!positions.length) {
      return errorResponse(ERROR.PERPS_POSITION_NOT_FOUND, 400);
    }
    const userPositions: string[] = [];
    positions.forEach((position: IFetchUserPosition) => {
      if (position.factory.lendingPool === lendingPool) {
        userPositions.push(position.id);
      }
    });

    return userPositions;
  }
  catch (error) {
    sentry.captureException(error);
    errorStackTrace(error);
    return errorResponse(ERROR.INTERNAL_SERVER_ERROR, 500);
  }
}

// fetchUserPositions("0x95d2aefd060db5da61e31fff7a855cc4c7ef6160", "0x2b254761b439d3a5300be16d13aa5aac07354d0f")
