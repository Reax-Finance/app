import * as sentry from '@sentry/node';
import { IErrorResponse, IPosition } from '../../../../utils/types';
import Big from 'big.js';
import { errorResponse, errorStackTrace } from '../../../../utils/util';
import { ERROR } from '../../../../utils/errors';

/**
 * @dev It is used to calculate borrow, deposit, maxLeverage, etc for closed position, get data from lending subgraph
 * @param userPosition 
 * @param isPositionClosed 
 * @returns 
 */
export function calcInitialBorrowDeposit(positions: IPosition[], isPositionClosed: boolean): IErrorResponse | {
  initialBorrowAmount: string;
  initialDepositAmount: string;
  borrowAmount: string;
  depositAmount: string;
  repayAmount: string;
  withdrawAmount: string;
  liquidationCollateralAmount: string;
  avgLiquidationThreshold: string;
  liqLeverage: string;
  timestampOpened: string;
  timestampClosed: string | null;
  data: any;
} {
  try {

    let initialBorrowAmount = '0';
    let initialDepositAmount = '0';
    let borrowAmount = '0';
    let depositAmount = '0';
    let repayAmount = '0';
    let withdrawAmount = '0';
    let liquidationCollateralAmount = '0';
    let liquidationLoss = '0';
    let avgLiquidationThreshold = '0';
    let avgLTV = '0'
    let depositPositionCount = 0;
    let timestampOpened = Number.MAX_SAFE_INTEGER.toString();
    let timestampClosed: string | null = Number.MIN_SAFE_INTEGER.toString();
    const data: any = {}
    if (!isPositionClosed) {
      timestampClosed = null;
    }

    positions.forEach((position: IPosition) => {

      const tokenAddress = position.borrows[0]?.market.inputToken.id ?? position.deposits[0]?.market.inputToken.id;
      const tokenId = tokenAddress + '-' + position.side;
      const tokenSymbol = position.borrows[0]?.market.inputToken.symbol ?? position.deposits[0]?.market.inputToken.symbol;
      timestampOpened = Math.min(Number(timestampOpened), Number(position.timestampOpened)).toString();
      if (isPositionClosed) {
        timestampClosed = Math.max(Number(timestampClosed), Number(position.timestampClosed)).toString();
      }
      if (!data[tokenId]) {
        data[tokenId] = {
          tokenAddress,
          tokenSymbol,
          side: position.side,
          initialBorrowAmount: '0',
          initialDepositAmount: '0',
          borrowAmount: '0',
          depositAmount: '0',
          repayAmount: '0',
          withdrawAmount: '0',
          liquidationCollateralAmount: '0',
          liquidationLoss: '0',
          timestampOpened: position.timestampOpened,
          timestampClosed: position.timestampClosed
        }
      }
      position.borrows.forEach((borrow) => {

        initialBorrowAmount = Big(initialBorrowAmount).plus(borrow.amountUSD).toString();
        borrowAmount = Big(borrowAmount).plus(borrow.amountUSD).toString();
        data[tokenId]['initialBorrowAmount'] = Big(data[tokenId]['initialBorrowAmount']).plus(borrow.amountUSD).toString();
        data[tokenId]['borrowAmount'] = Big(data[tokenId]['borrowAmount']).plus(borrow.amountUSD).toString();
      })
      position.deposits.forEach((deposit) => {

        initialDepositAmount = Big(initialDepositAmount).plus(deposit.amountUSD).toString();
        depositAmount = Big(depositAmount).plus(deposit.amountUSD).toString();
        data[tokenId]['initialDepositAmount'] = Big(data[tokenId]['initialDepositAmount']).plus(deposit.amountUSD).toString();
        data[tokenId]['depositAmount'] = Big(data[tokenId]['depositAmount']).plus(deposit.amountUSD).toString();
        avgLiquidationThreshold = Big(avgLiquidationThreshold).plus(deposit.market.liquidationThreshold).toString();
        avgLTV = Big(avgLTV).plus(deposit.market.maximumLTV).toString();
        depositPositionCount++
      })
      position.repays.forEach((repay) => {

        initialBorrowAmount = Big(initialBorrowAmount).minus(repay.amountUSD).toString();
        repayAmount = Big(repayAmount).plus(repay.amountUSD).toString();
        data[tokenId]['initialBorrowAmount'] = Big(data[tokenId]['initialBorrowAmount']).minus(repay.amountUSD).toString();
        data[tokenId]['repayAmount'] = Big(data[tokenId]['repayAmount']).plus(repay.amountUSD).toString();
      })
      position.withdraws.forEach((withdraw) => {

        initialDepositAmount = Big(initialDepositAmount).minus(withdraw.amountUSD).toString();
        withdrawAmount = Big(withdrawAmount).plus(withdraw.amountUSD).toString();
        data[tokenId]['initialDepositAmount'] = Big(data[tokenId]['initialDepositAmount']).minus(withdraw.amountUSD).toString();
        data[tokenId]['withdrawAmount'] = Big(data[tokenId]['withdrawAmount']).plus(withdraw.amountUSD).toString();
      })
      position.liquidations.forEach((liquidation) => {
        // borrowAssetAmount transfer to user and repayAmount of user debt by liquidator will be same.

        initialDepositAmount = Big(initialDepositAmount).minus(Big(liquidation.amountUSD).minus(liquidation.profitUSD)).toString();
        initialBorrowAmount = Big(initialBorrowAmount).minus(Big(liquidation.amountUSD).minus(liquidation.profitUSD)).toString();
        liquidationCollateralAmount = Big(liquidationCollateralAmount).plus(liquidation.amountUSD).toString();
        liquidationLoss = Big(liquidationLoss).plus(liquidation.profitUSD).toString();

        data[tokenId]['initialDepositAmount'] = Big(data[tokenId]['initialDepositAmount']).minus(Big(liquidation.amountUSD).minus(liquidation.profitUSD)).toString();
        data[tokenId]['initialBorrowAmount'] = Big(data[tokenId]['initialBorrowAmount']).minus(Big(liquidation.amountUSD).minus(liquidation.profitUSD)).toString();
        data[tokenId]['liquidationCollateralAmount'] = Big(data[tokenId]['liquidationCollateralAmount']).plus(liquidation.amountUSD).toString();
        data[tokenId]['liquidationLoss'] = Big(data[tokenId]['liquidationLoss']).plus(liquidation.profitUSD).toString();
      })

    })
    avgLiquidationThreshold = Big(avgLiquidationThreshold).div(depositPositionCount).div(100).toFixed(4);
    avgLTV = Big(avgLTV).div(depositPositionCount).div(100).toFixed(4);
    let liqLeverage = Big(1).div(Big(1).minus(avgLiquidationThreshold)).toFixed(2);
    // console.log("----------");
    return { initialBorrowAmount, initialDepositAmount, borrowAmount, depositAmount, repayAmount, withdrawAmount, liquidationCollateralAmount, data: Object.values(data), avgLiquidationThreshold, liqLeverage, timestampOpened, timestampClosed };
  }
  catch (error) {
    sentry.captureException(error);
    errorStackTrace(error);
    return errorResponse(ERROR.INTERNAL_SERVER_ERROR, 500);
  }
}