import React, { useContext } from 'react'
import { AppDataContext } from '../context/AppDataProvider';
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';
import { PYTH_ENDPOINT, REPLACED_FEEDS } from '../../src/const';
import { ethers } from 'ethers';

export default function useUpdateData() {
    const {
		reserveData: _reserveData,
        liquidityData: _liquidityData
	} = useContext(AppDataContext);

    const getAllPythFeeds = (reserveData = _reserveData, liquidityData = _liquidityData) => {
        let pythFeeds = [];
        if(reserveData){
            for(let i in reserveData.vaults){
                pythFeeds.push(reserveData.vaults[i].asset.pythId);
            }
        }
        if(liquidityData){
            for(let i in liquidityData.synths){
                pythFeeds.push(liquidityData.synths[i].pythId);
            }
        }
        // Remove duplicates
        pythFeeds = [...new Set(pythFeeds)];
        // Remove invalid feeds
        pythFeeds = pythFeeds.filter((feed) => feed !== ethers.constants.HashZero);
        return pythFeeds;
    }
    
    /**
     * 
     * @param tokens address of tokens
     * @returns 
     */
    const getUpdateData = async (
        pythFeeds?: string[]
    ): Promise<string[]> => {
        if(!pythFeeds){
            pythFeeds = getAllPythFeeds()
        }
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

    const getUpdateFee = async (
        pythFeeds?: string[]
    ): Promise<string> => {
        if(!pythFeeds){
            pythFeeds = getAllPythFeeds(pythFeeds)
        }
        return pythFeeds.length.toString();
    }

    return {
        getUpdateData,
        getUpdateFee,
        getAllPythFeeds
    }
}
