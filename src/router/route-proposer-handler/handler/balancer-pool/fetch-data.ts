import axios from "axios";
import { queryStr } from "./query";
import { IPool } from "../../utils/types";
import { DEX_ENDPOINT } from "../../../../queries/dex";
import { defaultChain } from "../../../../const";
require("dotenv").config();











let pools: IPool[] = [];
let tokensPrice: { [key: string]: string } = {};



export async function _fetchPoolData() {
  try {
    
    let data = await axios({
      method: "post",
      url: DEX_ENDPOINT(defaultChain.id),
      data:
      {
        query: queryStr
      }
    });

    pools = data.data.data.pools;

    for (const pool of pools) {

      for (const token of pool.tokens) {
        tokensPrice[token.address] = token.token.latestUSDPrice?.price ?? "0"
      }
    }

  }
  catch (error) {
    console.log("Error @ fetchPoolData", error)
  }
}

export async function fetchPoolData() {
  await _fetchPoolData();
  setInterval(() => {
    _fetchPoolData()
  }, 1000 * 60 * 60)
}


export function getPools() {
  return pools
}

// export function getTokenPrice(address: string) {
//   return tokensPrice[address]
// }

