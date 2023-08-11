import React, { useContext } from 'react'
import { AppDataContext } from '../context/AppDataProvider';
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';
import { PYTH_ENDPOINT } from '../../src/const';
import { ethers } from 'ethers';

export default function useUpdateData() {
    const {
		pools,
		tradingPool
	} = useContext(AppDataContext);
    
    /**
     * 
     * @param tokens address of tokens
     * @returns 
     */
    const getUpdateData = async (
        tokens = (pools[tradingPool]?.collaterals ?? []).map((token: any) => token.token.id).concat((pools[tradingPool]?.synths ?? []).map((token: any) => token.token.id))
    ) => {
        let pythFeeds: string[] = [];
        // get feeds for tokens
        for(let i in pools){
            for(let j in pools[i].collaterals){
                if(tokens.findIndex((token: any) => token == pools[i].collaterals[j].token.id) !== -1 && pools[i].collaterals[j].feed.slice(0, 20) !== ethers.constants.HashZero.slice(0, 20)){
                    pythFeeds.push(pools[i].collaterals[j].feed);
                }
            }
            for(let j in pools[i].synths){
                if(tokens.findIndex((token: any) => token == pools[i].synths[j].token.id) !== -1 && pools[i].synths[j].feed.slice(0, 20) !== ethers.constants.HashZero.slice(0, 20)){
                    pythFeeds.push(pools[i].synths[j].feed);
                }
            }
        }
        const pythPriceService = new EvmPriceServiceConnection(PYTH_ENDPOINT);
        const priceFeedUpdateData = pythFeeds.length > 0 ? await pythPriceService.getPriceFeedsUpdateData(pythFeeds) : [];
        return priceFeedUpdateData;
    }

    return {
        getUpdateData
    }
}
