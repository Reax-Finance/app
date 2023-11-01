import * as sentry from '@sentry/node';
import { IErrorResponse, IMarket, IPosition } from "../../../../utils/types";
import { errorResponse, errorStackTrace } from "../../../../utils/util";

export function getMarkets(positions: IPosition[]): IMarket[] | IErrorResponse {
  try {

    const marketsData: IMarket[] = [];
    const marketsId: string[] = [];
    positions.forEach((position: IPosition) => {

      position.deposits.forEach((deposit) => {
        if (!marketsId.includes(deposit.market.id)) {
          marketsData.push(deposit.market);
          marketsId.push(deposit.market.id);
        }
      });

      position.borrows.forEach((borrow) => {
        if (!marketsId.includes(borrow.market.id)) {
          marketsData.push(borrow.market);
          marketsId.push(borrow.market.id);
        }
      });
    })
    return marketsData;
  }
  catch (error) {
    errorStackTrace(error);
    sentry.captureException(error);
    return errorResponse(error, 500);
  }
}