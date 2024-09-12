import React, { useContext } from 'react'
import { AppDataContext } from '../context/AppDataProvider';
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';
import { PYTH_ENDPOINT, REPLACED_FEEDS } from '../../src/const';
import { ethers } from 'ethers';

export default function useUpdateData() {
    const {
        synths: _synths
	} = useContext(AppDataContext);

    const getAllPythFeeds = (synths = _synths) => {
        let pythFeeds = [];
        if(synths){
            for(let i in synths){
                // Add synth 
                pythFeeds.push(synths[i].synth.pythId);
                // Add vaults
                for(let j in synths[i].market.vaults){
                    pythFeeds.push(synths[i].market.vaults[j].asset.pythId);
                }
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
