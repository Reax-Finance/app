import axios, { AxiosError } from 'axios';
import * as sentry from '@sentry/node';
import { CHAIN_ID } from '../../../utils/secrets';
import { LENDING_SUBGRAPH } from '../../../utils/constant';
import { positionQuery } from '../../helper/query';
import { IErrorResponse, IHistory, IPosition, SIDE } from '../../../utils/types';
import { errorResponse, errorStackTrace } from '../../../utils/util';
import { ERROR } from '../../../utils/errors';

/**
 * @dev it is used to get data from lending subgraph and sort action as per the timestamp and logIndex
 * @param positionId 
 * @param lendingPool 
 * @returns 
 */
export async function fetchPositionHistory(positionId: string, lendingPool: string): Promise<IErrorResponse | IHistory[]> {
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
    const history: IHistory[] = [];

    positions.forEach((position: IPosition) => {

      const tokenAddress = position.borrows[0]?.market.inputToken.id ?? position.deposits[0]?.market.inputToken.id;
      const tokenSymbol = position.borrows[0]?.market.inputToken.symbol ?? position.deposits[0]?.market.inputToken.symbol;
      const combinedPosition = position.combinedPosition;

      position.borrows.forEach((borrow) => {
        history.push({ action: "borrow", tokenAddress, tokenSymbol, amountUSD: borrow.amountUSD, amount: borrow.amount, timestamp: borrow.timestamp, logIndex: borrow.logIndex, combinedPosition })
      })
      position.deposits.forEach((deposit) => {
        history.push({ action: "deposit", tokenAddress, tokenSymbol, amountUSD: deposit.amountUSD, amount: deposit.amount, timestamp: deposit.timestamp, logIndex: deposit.logIndex, combinedPosition })

      })
      position.repays.forEach((repay) => {
        history.push({ action: "repay", tokenAddress, tokenSymbol, amountUSD: repay.amountUSD, amount: repay.amount, timestamp: repay.timestamp, logIndex: repay.logIndex, combinedPosition })

      })
      position.withdraws.forEach((withdraw) => {
        history.push({ action: "withdraw", tokenAddress, tokenSymbol, amountUSD: withdraw.amountUSD, amount: withdraw.amount, timestamp: withdraw.timestamp, logIndex: withdraw.logIndex, combinedPosition })

      })
      position.liquidations.forEach((liquidation) => {
        history.push({ action: "liquidation", tokenAddress, tokenSymbol, amountUSD: liquidation.amountUSD, amount: liquidation.amount, timestamp: liquidation.timestamp, logIndex: liquidation.logIndex, combinedPosition })
      })

    })

    history.sort((a: any, b: any) => {
      return Number(a.timestamp) - Number(b.timestamp) || a.logIndex - b.logIndex;
    })
    return history

  } catch (error) {
    sentry.captureException(error);
    errorStackTrace(error);
    return errorResponse(ERROR.INTERNAL_SERVER_ERROR, 500);
  }
}

