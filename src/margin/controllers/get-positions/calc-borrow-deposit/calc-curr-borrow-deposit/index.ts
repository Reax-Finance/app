import * as sentry from '@sentry/node';
import { IBalance, IErrorResponse } from "../../../../utils/types";
import { toUSDAmount } from "../../../helper/get-usd-amount";
import Big from "big.js";
import { errorResponse, errorStackTrace } from "../../../../utils/util";
import { ERROR } from "../../../../utils/errors";

/**
 * @dev It is used to calculate current borrow and deposit amount in USD
 * @param balances IBalance[]
 * @returns 
 */
export function calcCurrBorrowDeposit(balances: IBalance[]): {
  currBorrowAmount: string;
  currDepositAmount: string;
} | IErrorResponse {
  try {

    let currBorrowAmount = '0';
    let currDepositAmount = '0';
    let flag = true;
    balances.forEach((balance: IBalance) => {
      let aTokenAmount = toUSDAmount(balance.id, balance.aToken.balance);
      let vTokenAmount = toUSDAmount(balance.id, balance.vToken.balance);
      let sTokenAmount = toUSDAmount(balance.id, balance.sToken.balance);
      if (!aTokenAmount || !vTokenAmount || !sTokenAmount) {
        flag = false;
        return
      }
      currBorrowAmount = Big(currBorrowAmount).plus(vTokenAmount).plus(sTokenAmount).toString();
      currDepositAmount = Big(currDepositAmount).plus(aTokenAmount).toString();
    })
    if (!flag) return errorResponse(ERROR.TOKEN_DATA_NOT_FOUND, 422);
    return { currBorrowAmount, currDepositAmount };
  }
  catch (error) {
    errorStackTrace(error);
    sentry.captureException(error);
    return errorResponse(ERROR.INTERNAL_SERVER_ERROR, 500);
  }
}