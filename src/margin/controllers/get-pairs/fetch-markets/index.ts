import axios, { AxiosError } from "axios";
import { LENDING_SUBGRAPH } from "../../../utils/constant";
import { CHAIN_ID } from "../../../utils/secrets";
import { marketsQuery } from "../../helper/query";
import { errorResponse, errorStackTrace } from "../../../utils/util";
import * as sentry from '@sentry/node';
import { ERROR } from "../../../utils/errors";
import { IErrorResponse, IMarket } from "../../../utils/types";

/**
 * @dev It is used to fetch all markets from lending subgraph
 * @param lendingPool 
 * @returns 
 */
export async function fetchMarkets(lendingPool: string): Promise<Record<string, IMarket> | IErrorResponse> {
  try {

    const chainId = CHAIN_ID;
    const lendingGraphUrl = LENDING_SUBGRAPH[chainId][lendingPool];
    const query = marketsQuery();
    let markets: IMarket[] = [];
    try {
      markets = (await axios.post(lendingGraphUrl, {
        query: query
      })).data?.data?.markets;
    } catch (error) {
      const err = error as AxiosError
      errorStackTrace(err);
      sentry.captureException(err);
      return errorResponse(err.response?.data, err.response?.status);
    }
    const data: Record<string, IMarket> = {};
    markets.forEach((market: IMarket) => {
      data[`${market.inputToken.symbol}`] = market;
    });
    return data;
  }
  catch (error) {
    sentry.captureException(error);
    errorStackTrace(error);
    return errorResponse(ERROR.INTERNAL_SERVER_ERROR, 500);
  }
}