import React, { useContext } from 'react'
import { AppDataContext } from '../context/AppDataProvider';
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';
import { PYTH_ENDPOINT, REPLACED_FEEDS } from '../../src/const';
import { ethers } from 'ethers';

export default function useUpdateData() {
    const {
		pools,
	} = useContext(AppDataContext);
    
    /**
     * 
     * @param tokens address of tokens
     * @returns 
     */
    const getUpdateData = async (
        pythFeeds: string[]
    ): Promise<string[]> => {
        // let pythFeeds: string[] = [];
        // get feeds for tokens
        
        const pythPriceService = new EvmPriceServiceConnection(PYTH_ENDPOINT);
        try{
            const priceFeedUpdateData = pythFeeds.length > 0 ? await pythPriceService.getPriceFeedsUpdateData(pythFeeds) : [];
            return priceFeedUpdateData;
        } catch(err) {
            console.log("Pyth data fetching failed, trying again...");
            // wait 2 sec and return
            await new Promise(r => setTimeout(r, 2000));
            return await getUpdateData(pythFeeds)
        }
    }

    return {
        getUpdateData
    }
}
