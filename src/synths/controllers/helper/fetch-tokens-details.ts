
import axios from "axios";
import * as sentry from "@sentry/node";
import { CONSTANT_PRICES, PRICES_URL } from "../utils/constant";
import { IPriceData } from "../utils/types";
import log from "../../config/logger";
import { CHAIN_ID } from "../utils/secrets";

let prices: { [key: string]: [string, string, number] } = {};

/**
 * @dev It is used to fetch token data from price service
 * @param chainId 
 * @returns 
 */
async function _fetchPrices(chainId: string) {
    try {

        let getPrices: IPriceData = {};

        let pricesUrl = PRICES_URL[chainId];
        try {
            getPrices = (await axios.get(pricesUrl))?.data?.data;
        }
        catch (error) {
            log.error(`${error} - ${__filename}`)
        }

        if (!Object.keys(getPrices).length) {
            return;
        }

        prices = getPrices;
    }
    catch (error) {
        sentry.captureException(error);
        log.error(`${error} - ${__filename}`);
    }
}

export async function fetchPrices() {

    await _fetchPrices(CHAIN_ID);
    // setInterval(() => {
    //     _fetchPrices(CHAIN_ID);
    // }, 10 * 1000);
}

/**
 * @dev It is used to get current token data from prices object.
 * @param tokenAddress 
 * @returns 
 */
export  function getTokenData(tokenAddress: string) {
    let price
    if (!prices[tokenAddress]) {
        price = CONSTANT_PRICES[tokenAddress] ? CONSTANT_PRICES[tokenAddress] : null;
        return price;
    }
    return prices[tokenAddress];
}
