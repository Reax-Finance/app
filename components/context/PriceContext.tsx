import Big from "big.js";
import { BigNumber, ethers } from "ethers";
import * as React from "react";
import { ADDRESS_ZERO, PYTH_ENDPOINT, REPLACED_FEEDS, WETH_ADDRESS, defaultChain } from "../../src/const";
import { Status, SubStatus } from "../utils/status";
import { EvmPriceServiceConnection } from "@pythnetwork/pyth-evm-js";

const PriceContext = React.createContext<PriceValue>({} as PriceValue);

interface PriceValue {
    prices: any;
    status: Status;
}

function PriceContextProvider({ children }: any) {
    const [status, setStatus] = React.useState<Status>(Status.NOT_FETCHING);
	const [prices, setPrices] = React.useState<any>({});
    const [refresh, setRefresh] = React.useState(0);


    React.useEffect(() => {
    }, []);

	const updatePrices = async () => {
        setStatus(Status.FETCHING);
        console.log("Fetching prices");
        const chainId = defaultChain.id;
		const provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrls.default.http[0]);
        const pythFeeds: any[] = [];
        let _feedToAsset: any = {};
        const _prices = {...prices};
        
        const pythPriceService = new EvmPriceServiceConnection(PYTH_ENDPOINT);
        await pythPriceService.subscribePriceFeedUpdates(pythFeeds, (feed: any) => updatePythPrices(feed, _feedToAsset, _prices))
    }
    
    const updatePythPrices = (res: any, feedToAsset: any, _prices: any) => {
        for (let i in feedToAsset["0x"+res.id]){
            _prices[feedToAsset["0x"+res.id][i]] = Big(res.price.price).mul(10**res.price.expo).toString();
            if(feedToAsset["0x"+res.id][i] == WETH_ADDRESS(defaultChain.id)){
                _prices[ADDRESS_ZERO] = _prices[WETH_ADDRESS(defaultChain.id)];
            }
        }
        setPrices(_prices);
        setRefresh(Math.random());
    }

    const value: PriceValue = {
		prices,
        status
	};
    

	return (
		<PriceContext.Provider value={value}>{children}</PriceContext.Provider>
	);
}


const usePriceData = () => {
    const context = React.useContext(PriceContext);
    if (context === undefined) {
        throw new Error("usePriceData must be used within a PriceProvider");
    }
    return context;
};

export { PriceContextProvider, PriceContext, usePriceData };