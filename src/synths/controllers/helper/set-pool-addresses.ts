import axios from "axios"
import { promises as fs } from "fs";
import * as sentry from "@sentry/node";
import { SYNTH_SUBGRAPH } from "../utils/constant";
import log from "../../config/logger";
import { CHAIN_ID } from "../utils/secrets";

/**
 * @dev It is used to get all pools in synth pool and store pools related data @ /config.json
 * @param chainId 
 * @returns 
 */
export async function setPoolAddresses() {
  try {

    let config: any = {};

    let synthGraphUrl = SYNTH_SUBGRAPH[CHAIN_ID];

    if (!synthGraphUrl) {
      log.error(`SYNTH_SUB_GRAPH_NOT_FOUND: ${__filename}`);
      return;
    }

    let data = await axios({
      method: "post",
      url: synthGraphUrl,
      data:
      {
        query:
          `
          {
              pools {
                id
                name
                symbol
                oracle
                feeToken
                collaterals {
                  token {
                    id
                    symbol
                    decimals
                  }
                }
              }
            }`
      }
    });

    const pools = data.data.data.pools;

    for (let pool of pools) {
      config[pool.id] = {
        name: pool.name,
        symbol: pool.symbol,
        feeToken: pool.feeToken,
        oracle: pool.oracle,
        collaterals: {}
      };

      for (let collateral of pool.collaterals) {

        config[pool.id]["collaterals"][collateral.token.id] = ["0", collateral.token.symbol, collateral.token.decimals];
        config[pool.id]["collaterals"][pool.feeToken] = ["0", "cUSD", "18"];

      }
    }
    if (Object.keys(config).length > 0) {
      await fs.writeFile(__dirname + "/config.json", JSON.stringify(config));
    }

  }
  catch (error) {
    sentry.captureException(error);
    log.error(`${error} - ${__filename}`);
  }
}