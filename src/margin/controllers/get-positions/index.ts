// import Big from "big.js";
// import { IErrorResponse, IPosition } from "../../utils/types";
// import { calcBorrowDeposit } from "./calc-borrow-deposit";
// import { fetchPosition } from "./fetch-position";
// import { calcInitialBorrowDeposit } from "./calc-borrow-deposit/calc-initial-borrow-deposit";
// import { Request, Response } from "express";
// import { ERROR } from "../../utils/errors";
// import * as sentry from '@sentry/node';
// import { isAddress } from "ethers/lib/utils";
// import { errorStackTrace } from "../../utils/util";
// import { getPairs } from "./get-pairs";
// import { LENDING_POOL } from "../../utils/constant";
// import { CHAIN_ID } from "../../utils/secrets";

// /**
//  * @dev This API is used to get data related to perps position e.g profit, leverage etc
//  * @param position Position Id 
//  * @param lendingPool Lending pool address
//  * @returns 
//  */
// export async function getPositionsData(req: Request, res: Response) {

//   try {

//     const position = (req.query.position as string)?.toLowerCase();
//     const lendingPool = req.query.lendingPool as string;

//     // data validation
//     if (!position || !isAddress(position)) {
//       return res.status(400).send({ status: false, error: ERROR.USER_ID_NOT_VALID });
//     }

//     if (!lendingPool || !LENDING_POOL[CHAIN_ID].includes(lendingPool)) {
//       return res.status(400).send({ status: false, error: ERROR.LENDING_POOL_NOT_VALID });
//     }

//     const userPositions: IPosition[][] | IErrorResponse = await fetchPosition(position, lendingPool);
//     if ('error' in userPositions) {
//       return res.status(userPositions.statusCode).send({ status: userPositions.status, error: userPositions.error });
//     }

//     // const pairs: IErrorResponse | string[][] = await getPairs(userId,lendingPool);
//     // if ('error' in pairs) {
//     //   return res.status(pairs.statusCode).send({ status: pairs.status, error: pairs.error });
//     // }

//     let outPut: any = [];
//     let index = 0;
//     for (let userPosition of userPositions) {

//       if (index == userPositions.length - 1) {
//         const borrowDeposit = await calcBorrowDeposit(userPosition, position);

//         if ('error' in borrowDeposit) {
//           return res.status(borrowDeposit.statusCode).send({ status: borrowDeposit.status, error: borrowDeposit.error });
//         }

//         const { currBorrowAmount, initialBorrowAmount, initialDepositAmount, borrowAmount, depositAmount, repayAmount, withdrawAmount, liquidationCollateralAmount, data, avgLiquidationThreshold, timestampOpened,
//           timestampClosed, liqLeverage } = borrowDeposit;
//         let { currDepositAmount } = borrowDeposit;
//         let healthFactor;

//         if (Number(currDepositAmount) <= 0) {
//           healthFactor = Number.MAX_SAFE_INTEGER.toString();
//         }
//         else {
//           healthFactor = Big(currBorrowAmount).div(currDepositAmount).toFixed(4);
//         }
//         const profitLoss = Big(initialBorrowAmount).minus(currBorrowAmount).plus(currDepositAmount).minus(initialDepositAmount).toFixed(4);
//         if (currBorrowAmount == '0') {
//           const diff = Big(depositAmount).minus(borrowAmount);
//           const profitPerc = Big(profitLoss).div(diff).times(100).toFixed(2);
//           const leverage = Big(depositAmount).div(diff).abs().toFixed(2);
//           outPut.push({
//             combinedPosition: index,
//             profitLoss,
//             profitPerc,
//             leverage,
//             liqLeverage,
//             initialBorrowAmount,
//             initialDepositAmount,
//             borrowAmount,
//             depositAmount,
//             repayAmount,
//             withdrawAmount,
//             liquidationCollateralAmount,
//             timestampOpened,
//             timestampClosed,
//             // pairs,
//             data
//           })
//         }
//         else {
//           const diff = Big(currDepositAmount).minus(currBorrowAmount);
//           const profitPerc = Big(profitLoss).div(diff).times(100).toFixed(2);
//           const leverage = Big(currDepositAmount).div(diff).abs().toFixed(2);
//           outPut.push({
//             combinedPosition: index,
//             healthFactor,
//             avgLiquidationThreshold,
//             profitLoss,
//             profitPerc,
//             leverage,
//             liqLeverage,
//             initialBorrowAmount,
//             initialDepositAmount,
//             currBorrowAmount,
//             currDepositAmount,
//             netAmount: diff,
//             borrowAmount,
//             depositAmount,
//             repayAmount,
//             withdrawAmount,
//             liquidationCollateralAmount,
//             timestampOpened,
//             timestampClosed,
//             // pairs,
//             data
//           })
//         }
//       }
//       else {
//         const initialBorrowDeposit = calcInitialBorrowDeposit(userPosition, true);
//         if ('error' in initialBorrowDeposit) {
//           return res.status(initialBorrowDeposit.statusCode).send({ status: initialBorrowDeposit.status, error: initialBorrowDeposit.error });
//         }
//         const { initialBorrowAmount, initialDepositAmount, borrowAmount, depositAmount, repayAmount, withdrawAmount, liquidationCollateralAmount, data, timestampOpened, timestampClosed, liqLeverage } = initialBorrowDeposit;
//         const profitLoss = Big(initialBorrowAmount).minus(initialDepositAmount).toString();
//         const diff = Big(depositAmount).minus(borrowAmount);
//         const profitPerc = Big(profitLoss).div(diff).times(100).toFixed(2);
//         const leverage = Big(depositAmount).div(diff).abs().toFixed(2);
//         outPut.push({
//           combinedPosition: index,
//           profitLoss,
//           profitPerc,
//           leverage,
//           liqLeverage,
//           initialBorrowAmount,
//           initialDepositAmount,
//           borrowAmount,
//           depositAmount,
//           repayAmount,
//           withdrawAmount,
//           liquidationCollateralAmount,
//           timestampOpened,
//           timestampClosed,
//           // pairs,
//           data
//         })
//       }

//       index++;
//     }
//     return res.status(200).send({ status: true, data: outPut });
//   }
//   catch (error) {
//     sentry.captureException(error);
//     errorStackTrace(error);
//     return res.status(500).send({ status: false, error: ERROR.INTERNAL_SERVER_ERROR });
//   }
// }



