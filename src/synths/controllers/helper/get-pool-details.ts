import Big from "big.js";
import { BigNumber, ethers } from "ethers";
import { promises as fs } from "fs";
import path from "path";
import axios from "axios";
import { getTokenData } from "./fetch-tokens-details";
import * as sentry from "@sentry/node";
import { getABI, provider } from "../utils/utils";
import { MULTICALL_ADDRESS, SYNTH_SUBGRAPH } from "../utils/constant";
import log from "../../config/logger";
import { ISupplyData } from "../utils/types";
import { CHAIN_ID } from "../utils/secrets";

require("dotenv").config({})
let poolData: any = {}

/**
 * @dev this function is use to get pool totalSupply and set it @ poolData.
 * @param {*} poolAddress (string[]) array of string containing pool ids.
 * @param chainId 
 */
async function _poolTotalSupply(poolAddresses: string[], chainId: string) {
    try {

        const _provider = provider(chainId);

        if (!_provider) return null;

        const multicall = new ethers.Contract(
            MULTICALL_ADDRESS[chainId],
            await getABI("Multicall2"),
            _provider
        );

        const itf: ethers.utils.Interface = new ethers.utils.Interface(await getABI("Pool"));
        const input: any = [];
        for (let poolAddress of poolAddresses) {
            input.push([poolAddress, itf.encodeFunctionData("totalSupply", [])]);
        }

        let resp = await multicall.callStatic.aggregate(
            input
        );

        let outPut: string[] = [];

        for (let i = 0; i < poolAddresses.length; i++) {
            outPut.push(Big(BigNumber.from(resp[1][i]).toString()).toString());
            if (!poolData[poolAddresses[i]]) {
                poolData[poolAddresses[i]] = ["0", "0"];
            }
            poolData[poolAddresses[i]][0] =
                Big(BigNumber.from(resp[1][2 * i]).toString()).toString();
        }

        await _totalDebtUSD(chainId);
    }
    catch (error) {
        sentry.captureException(error);
        log.error(`${error} - ${__filename}`);
        return null;
    }
}


/**
 * @dev It is used to get total pool debt in USD amd set it @ poolData
 * @param chainId 
 * @returns 
 */
async function _totalDebtUSD(chainId: string) {

    try {

        let synthData: ISupplyData | undefined;
        let synthGraphUrl = SYNTH_SUBGRAPH[chainId];

        if (!synthGraphUrl) {
            log.error(`SYNTH_SUB_GRAPH_NOT_FOUND: ${__filename}`);
            return;
        }

        try {

            synthData = (await axios.post(synthGraphUrl, {
                query: `
                {
                    pools {
                    id
                    totalSupply
                    synths {
                      id
                      totalSupply
                      token {
                        decimals
                      }
                    }
                  }
                }
                `
            })).data.data

        }
        catch (error) {
            sentry.captureException(error);
            log.error(`${error} - ${__filename}`);
        }

        if (!synthData) {
            return
        }

        for (let pool of synthData.pools) {

            let totalDebtUSD = "0";
            for (let synth of pool.synths) {
                let synthData = getTokenData(synth.id);
                if (!synthData) continue;
                let price = synthData[0];
                if (!price) continue;
                let synthDebtUSD = Big(price).times(synth.totalSupply)
                    .div(10 ** synth.token.decimals).toString();
                totalDebtUSD = Big(totalDebtUSD).plus(synthDebtUSD).toString();
            }
            if (!poolData[pool.id]) {
                poolData[pool.id] = ["0", "0"];
            }
            poolData[pool.id][1] = totalDebtUSD;

        }

    }
    catch (error) {
        sentry.captureException(error);
        log.error(`${error} - ${__filename}`);
    }

}

export async function startPoolData() {

    try {
        const config = JSON.parse((await fs.readFile(path.join(__dirname + "/config.json"))).toString());
        const poolAddresses = Object.keys(config);
        await _poolTotalSupply(poolAddresses, CHAIN_ID);
        setInterval(async () => {
            await _poolTotalSupply(poolAddresses, CHAIN_ID);
        }, 10 * 1000)

    }
    catch (error) {
        sentry.captureException(error);
        log.error(`${error} - ${__filename}`);
    }
}

export function getPoolData(poolId: string): string[] | null {
    try {
        return poolData[poolId];
    }
    catch (error) {
        sentry.captureException(error);
        log.error(`${error} - ${__filename}`);
        return null
    }
}