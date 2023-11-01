import type { NextApiRequest, NextApiResponse } from 'next'
import { errorStackTrace } from '../../../src/margin/utils/util';
import * as sentry from '@sentry/node';
import { ERROR } from '../../../src/margin/utils/errors';
import { LENDING_POOL } from '../../../src/margin/utils/constant';
import { CHAIN_ID } from '../../../src/margin/utils/secrets';
import { isAddress } from 'ethers/lib/utils.js';
import { IErrorResponse, IPosition } from '../../../src/margin/utils/types';
import { fetchPosition } from '../../../src/margin/controllers/get-positions/fetch-position';
import { calcBorrowDeposit } from '../../../src/margin/controllers/get-positions/calc-borrow-deposit';
import Big from 'big.js';
import { calcInitialBorrowDeposit } from '../../../src/margin/controllers/get-positions/calc-borrow-deposit/calc-initial-borrow-deposit';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {

    const position = (req.query.position as string)?.toLowerCase();
    const lendingPool = (req.query.lendingPool as string)?.toLowerCase();
   
    // data validation
    if (!position || !isAddress(position)) {
      return res.status(400).send({ status: false, error: ERROR.USER_ID_NOT_VALID });
    }
 
    if (!lendingPool || !LENDING_POOL[CHAIN_ID].includes(lendingPool)) {
      return res.status(400).send({ status: false, error: ERROR.LENDING_POOL_NOT_VALID });
    }
    const userPositions: IPosition[][] | IErrorResponse = await fetchPosition(position, lendingPool);
    if ('error' in userPositions) {
      return res.status(userPositions.statusCode).send({ status: userPositions.status, error: userPositions.error });
    }

    let outPut: any = [];
    let index = 0;
    for (let userPosition of userPositions) {

      if (index == userPositions.length - 1) {
        const borrowDeposit = await calcBorrowDeposit(userPosition, position);

        if ('error' in borrowDeposit) {
          return res.status(borrowDeposit.statusCode).send({ status: borrowDeposit.status, error: borrowDeposit.error });
        }
        
        const { currBorrowAmount, initialBorrowAmount, initialDepositAmount, borrowAmount, depositAmount, repayAmount, withdrawAmount, liquidationCollateralAmount, data, avgLiquidationThreshold, timestampOpened,
          timestampClosed, liqLeverage } = borrowDeposit;
        let { currDepositAmount } = borrowDeposit;
        let healthFactor;

        if (Number(currDepositAmount) <= 0) {
          healthFactor = Number.MAX_SAFE_INTEGER.toString();
        }
        else {
          healthFactor = Big(currBorrowAmount).div(currDepositAmount).toFixed(4);
        }
        const profitLoss = Big(initialBorrowAmount).minus(currBorrowAmount).plus(currDepositAmount).minus(initialDepositAmount).toFixed(4);
        if (currBorrowAmount == '0') {
          const diff = Big(depositAmount).minus(borrowAmount);
          const profitPerc = Big(profitLoss).div(diff).times(100).toFixed(2);
          const leverage = Big(depositAmount).div(diff).abs().toFixed(2);
          outPut.push({
            combinedPosition: index,
            profitLoss,
            profitPerc,
            leverage,
            liqLeverage,
            initialBorrowAmount,
            initialDepositAmount,
            borrowAmount,
            depositAmount,
            repayAmount,
            withdrawAmount,
            liquidationCollateralAmount,
            timestampOpened,
            timestampClosed,
            data
          })
        }
        else {
          const diff = Big(currDepositAmount).minus(currBorrowAmount);
          const profitPerc = Big(profitLoss).div(diff).times(100).toFixed(2);
          const leverage = Big(currDepositAmount).div(diff).abs().toFixed(2);
          outPut.push({
            combinedPosition: index,
            healthFactor,
            avgLiquidationThreshold,
            profitLoss,
            profitPerc,
            leverage,
            liqLeverage,
            initialBorrowAmount,
            initialDepositAmount,
            currBorrowAmount,
            currDepositAmount,
            netAmount: diff,
            borrowAmount,
            depositAmount,
            repayAmount,
            withdrawAmount,
            liquidationCollateralAmount,
            timestampOpened,
            timestampClosed,
            data
          })
        }
      }
      else {
        const initialBorrowDeposit = calcInitialBorrowDeposit(userPosition, true);
        if ('error' in initialBorrowDeposit) {
          return res.status(initialBorrowDeposit.statusCode).send({ status: initialBorrowDeposit.status, error: initialBorrowDeposit.error });
        }
        const { initialBorrowAmount, initialDepositAmount, borrowAmount, depositAmount, repayAmount, withdrawAmount, liquidationCollateralAmount, data, timestampOpened, timestampClosed, liqLeverage } = initialBorrowDeposit;
        const profitLoss = Big(initialBorrowAmount).minus(initialDepositAmount).toString();
        const diff = Big(depositAmount).minus(borrowAmount);
        const profitPerc = Big(profitLoss).div(diff).times(100).toFixed(2);
        const leverage = Big(depositAmount).div(diff).abs().toFixed(2);
        outPut.push({
          combinedPosition: index,
          profitLoss,
          profitPerc,
          leverage,
          liqLeverage,
          initialBorrowAmount,
          initialDepositAmount,
          borrowAmount,
          depositAmount,
          repayAmount,
          withdrawAmount,
          liquidationCollateralAmount,
          timestampOpened,
          timestampClosed,
          data
        })
      }

      index++;
    }
    return res.status(200).send({ status: true, data: outPut });
  }
  catch (error) {
    sentry.captureException(error);
    errorStackTrace(error);
    return res.status(500).send({ status: false, error: ERROR.INTERNAL_SERVER_ERROR });
  }
}

