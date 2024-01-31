import log from "../../config/logger";
import * as sentry from "@sentry/node";
import { SYNTH_SUBGRAPH } from "../utils/constant";
import { CHAIN_ID } from "../utils/secrets";
import axios from "axios";
import Big from "big.js";
import { errorResponse } from "../utils/utils";
import { ERROR } from "../utils/errors";

export async function getMintBurnData(accountId: string, poolId: string) {
  try {
    let synthData: any;
    let synthGraphUrl = SYNTH_SUBGRAPH[CHAIN_ID];

    if (!synthGraphUrl) {
      log.error(`SYNTH_SUB_GRAPH_NOT_FOUND: ${__filename}`);
      return errorResponse(ERROR.SYNTH_SUB_GRAPH_NOT_FOUND, 422);
    }

    try {

      synthData = (await axios.post(synthGraphUrl, {
        query: `
        {
          mints(
            where: {account: "${accountId}", pool: "${poolId}"}
          ) {
            amountUSD
          }
          burns(
            where: {account: "${accountId}", pool: "${poolId}"}
          ) {
            amountUSD
          }
        }
            `
      })).data.data

    }
    catch (error) {
      sentry.captureException(error);
      log.error(`${error} - ${__filename}`);
      return errorResponse(ERROR.SUBGRAPH_NOT_ABLE_TO_FETCH, 422)
    }

    if (!synthData) {
      return errorResponse(ERROR.SYNTH_DATA_NOT_FOUND, 422);
    }

    let mint = "0";
    synthData?.mints.forEach((_mint: any) => {
      mint = Big(mint).plus(_mint.amountUSD).toString();
    });
    let burn = "0"
    synthData?.burns.forEach((_burn: any) => {
      burn = Big(burn).plus(_burn.amountUSD).toString();
    });
    return { mint, burn };
  }
  catch (error) {
    sentry.captureException(error);
    log.error(`${error} - ${__filename}`);
    return errorResponse(ERROR.INTERNAL_SERVER_ERROR, 500);
  }
}