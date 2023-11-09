import log from "../../config/logger";
import * as sentry from "@sentry/node";
import { SYNTH_SUBGRAPH } from "../utils/constant";
import { CHAIN_ID } from "../utils/secrets";
import axios from "axios";
import { IPosition } from "../utils/types";
import { errorResponse } from "../utils/utils";
import { ERROR } from "../utils/errors";
// getPositionBalance("0x95d2aefd060db5da61e31fff7a855cc4c7ef6160", "0x2089ba6d5fa49f711c0dd7549a1c0b9e1f8e6e8d");

export async function getPositionBalance(accountId: string, poolId: string) {
  try {
    let positionData: IPosition[] = [];
    let synthGraphUrl = SYNTH_SUBGRAPH[CHAIN_ID];
    
    if (!synthGraphUrl) {
      return errorResponse(ERROR.SYNTH_SUB_GRAPH_NOT_FOUND, 422);
    }

    try {

      positionData = (await axios.post(synthGraphUrl, {
        query: `
        {
          account(id: "${accountId}") {
            positions(where: {pool: "${poolId}"}) {
              balance
            }
          }
        }
            `
      })).data.data?.account?.positions;

    }
    catch (error) {
      sentry.captureException(error);
      log.error(`${error} - ${__filename}`);
      return errorResponse(ERROR.SUBGRAPH_NOT_ABLE_TO_FETCH, 422);
    }

    if (!positionData) {
      return "0";
    }

    return positionData[0]?.balance ?? "0";
  }
  catch (error) {
    sentry.captureException(error);
    log.error(`${error} - ${__filename}`);
    return errorResponse(ERROR.INTERNAL_SERVER_ERROR, 500);
  }
}