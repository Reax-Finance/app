import { IBalance, IErrorResponse, IMarket } from "../../../../utils/types";
import * as sentry from '@sentry/node';
import { getMulticall } from "../../../helper/get-multicall";
import { getAbi } from "../../../helper/get-abi";
import { BigNumber, ethers } from "ethers";
import { errorResponse, errorStackTrace } from "../../../../utils/util";
import { ERROR } from "../../../../utils/errors";

/**
 * @dev It is used to fetch current balance of positon i.e borrow and deposit balance for each market
 * @param markets IMarket[]
 * @param positionId 
 * @returns 
 */
export async function fetchBalances(markets: IMarket[], positionId: string): Promise<IErrorResponse | IBalance[]> {
  try {

    const multicall = await getMulticall();
    const ERC20ABI = await getAbi('ERC20');
    if (!multicall) {
      return errorResponse(ERROR.MULTICALL_NOT_FOUND, 422);
    }

    const itfERC20: ethers.utils.Interface = new ethers.utils.Interface(ERC20ABI);

    const multicallInput: any = [];

    markets.forEach((market: IMarket) => {
      multicallInput.push([market.outputToken.id, itfERC20.encodeFunctionData('balanceOf', [positionId])]);
      multicallInput.push([market._vToken.id, itfERC20.encodeFunctionData('balanceOf', [positionId])]);
      multicallInput.push([market._sToken.id, itfERC20.encodeFunctionData('balanceOf', [positionId])]);
    });

    const call = await multicall.callStatic.aggregate(multicallInput);

    const output: string[] = [];

    call.returnData.forEach((balance: BigNumber) => {
      output.push(BigNumber.from(balance).toString())
    });

    const balances: IBalance[] = [];
    let marketIndex = 0;
    for (let i = 0; i < output.length; i += 3) {

      balances.push(
        {
          id: markets[marketIndex].inputToken.id,
          aToken: {
            id: markets[marketIndex].outputToken.id,
            balance: output[i]
          },
          vToken: {
            id: markets[marketIndex]._vToken.id,
            balance: output[i + 1]
          },
          sToken: {
            id: markets[marketIndex]._sToken.id,
            balance: output[i + 2]
          }
        }
      )

      marketIndex++;
    }

    return balances
  }
  catch (error) {
    errorStackTrace(error);
    sentry.captureException(error);
    return errorResponse(ERROR.INTERNAL_SERVER_ERROR, 500);
  }
}