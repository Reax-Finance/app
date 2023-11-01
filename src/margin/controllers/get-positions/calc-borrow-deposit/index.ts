import * as sentry from '@sentry/node';
import { IBalance, IErrorResponse, IMarket, IPosition } from "../../../utils/types";
import { calcCurrBorrowDeposit } from "./calc-curr-borrow-deposit";
import { fetchBalances } from "./calc-curr-borrow-deposit/fetch-balances";
import { getMarkets } from "./calc-curr-borrow-deposit/get-markets";
import { CHAIN_ID } from "../../../utils/secrets";
import { updateTokenData } from "../../helper/get-tokens-data";
import { calcInitialBorrowDeposit } from "./calc-initial-borrow-deposit";
import { errorResponse, errorStackTrace } from "../../../utils/util";
import { ERROR } from "../../../utils/errors";

/**
 * @dev It is used to calculate borrow and deposit amount for each position
 * @param userPosition  IPosition[]
 * @param positionId 
 * @returns 
 */
export async function calcBorrowDeposit(positions: IPosition[], positionId: string): Promise<IErrorResponse | {
  initialBorrowAmount: string;
  initialDepositAmount: string;
  borrowAmount: string;
  depositAmount: string;
  repayAmount: string;
  withdrawAmount: string;
  liquidationCollateralAmount: string;
  currBorrowAmount: string;
  currDepositAmount: string;
  avgLiquidationThreshold: string;
  liqLeverage: string;
  timestampOpened: string;
  timestampClosed: string | null;
  data: any
}> {
  try {

    let isPositionClosed = true;

    positions.forEach((position: IPosition) => {
      if (position.blockNumberClosed == null) {
        isPositionClosed = false;
      }
    })

    let currBorrowDeposit: IErrorResponse | {
      currBorrowAmount: string;
      currDepositAmount: string;
    } = { currBorrowAmount: '0', currDepositAmount: '0' };

    if (!isPositionClosed) {
      const markets: IMarket[] | IErrorResponse = getMarkets(positions);
      if ('error' in markets) {
        return markets;
      }

      const balances: IBalance[] | IErrorResponse = await fetchBalances(markets, positionId);
      if ('error' in balances) {
        return balances;
      }
      const updateToken = await updateTokenData(CHAIN_ID);

      if (!updateToken) return errorResponse(ERROR.TOKEN_NOT_UPDATED, 422);

      currBorrowDeposit = calcCurrBorrowDeposit(balances);

      if ('error' in currBorrowDeposit) {
        return currBorrowDeposit;
      }
    }

    const initialBorrowDeposit = calcInitialBorrowDeposit(positions, isPositionClosed);

    if ('error' in initialBorrowDeposit) {
      return initialBorrowDeposit;
    }

    return { ...currBorrowDeposit, ...initialBorrowDeposit };
  }
  catch (error) {
    errorStackTrace(error);
    sentry.captureException(error);
    return errorResponse(ERROR.INTERNAL_SERVER_ERROR, 500);
  }
}