import Big from "big.js";
import { BigNumber, ethers } from "ethers";
import * as React from "react";
import { getABI, getAddress, getContract } from "../../src/contract";
import { useAccount, useNetwork } from "wagmi";
import { ADDRESS_ZERO, PYTH_ENDPOINT, WETH_ADDRESS, defaultChain } from "../../src/const";
import { useLendingData } from "./LendingDataContext";
import { useAppData } from "./AppDataProvider";
import { Status, SubStatus } from "../utils/status";
import axios from 'axios';

const PriceContext = React.createContext<PriceValue>({} as PriceValue);

interface PriceValue {
    prices: any;
    subStatus: SubStatus;
}

function PriceContextProvider({ children }: any) {
    const [subStatus, setSubStatus] = React.useState<SubStatus>(SubStatus.NOT_SUBSCRIBED);
	const [prices, setPrices] = React.useState<any>({});

	const { chain } = useNetwork();

    const { markets } = useLendingData();
    const { pools } = useAppData();
    const { address } = useAccount();

    React.useEffect(() => {
        if(subStatus == SubStatus.NOT_SUBSCRIBED && pools.length > 0 && markets.length > 0 && address) {
            if(markets[0].feed && pools[0].synths[0].feed){
                setSubStatus(SubStatus.SUBSCRIBED);
                updatePrices();
                setInterval(updatePrices, 2500);
            }
        }
    }, [markets, pools, address, subStatus])

	const updatePrices = async () => {
        console.log("updating prices");
        const chainId = chain?.id ?? defaultChain.id;
		if(chain?.unsupported) return Promise.resolve(1);
		const provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrls.default.http[0]);
		const helper = new ethers.Contract(
			getAddress("Multicall2", chainId),
			getABI("Multicall2", chainId),
			provider
		);
        let reqs: any[] = [];
        const pythFeeds = [];
        const _prices = {...prices};
        const itf = new ethers.utils.Interface(getABI("MockToken", chainId));
        const pool = new ethers.Contract(pools[0].id, getABI("Pool", chainId), helper.provider);
        
        for (let i = 0; i < pools.length; i++) {
            const priceOracle = new ethers.Contract(pools[i].oracle, getABI("PriceOracle", chainId), helper.provider);
            for(let j in pools[i].collaterals) {
                if(pools[i].collaterals[j].feed == ethers.constants.HashZero.toLowerCase() || pools[i].collaterals[j].feed.startsWith('0x0000000000000000000000')){
                    reqs.push([
                        pools[i].oracle,
                        priceOracle.interface.encodeFunctionData("getAssetPrice", [pools[i].collaterals[j].token.id])
                    ])
                } else {
                    pythFeeds.push(pools[i].collaterals[j].feed);
                }
            }
            for(let j in pools[i].synths) {
                const synth = pools[i].synths[j];
                if(pools[i].synths[j].feed == ethers.constants.HashZero.toLowerCase() || pools[i].synths[j].feed.startsWith('0x0000000000000000000000')){
                    reqs.push([
                        pools[i].oracle,
                        priceOracle.interface.encodeFunctionData("getAssetPrice", [pools[i].synths[j].token.id])
                    ])
                } else {
                    pythFeeds.push(pools[i].synths[j].feed);
                }
            }
        }
        for(let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const priceOracle = new ethers.Contract(market.protocol._priceOracle, getABI("PriceOracle", chainId), helper.provider);
            if(market.feed == ethers.constants.HashZero.toLowerCase() || market.feed.startsWith('0x0000000000000000000000')){
                reqs.push([
                    market.protocol._priceOracle,
                    priceOracle.interface.encodeFunctionData("getAssetPrice", [market.inputToken.id])
                ])
            } else {
                pythFeeds.push(market.feed);
            }
        }

        const allReqs = [helper.callStatic.aggregate(reqs)];
        if(pythFeeds.length > 0) {
            allReqs.push(
                axios.get(PYTH_ENDPOINT + '/api/latest_price_feeds?ids[]=' + pythFeeds.join('&ids[]='))
            )
        }
        Promise.all(allReqs).then(async ([res, pythRes]: any) => {
            let pythIndex = 0;
            let reqCount = 0;
            for(let i = 0; i < pools.length; i++) {
                for(let j in pools[i].collaterals) {
                    if(pools[i].collaterals[j].feed == ethers.constants.HashZero.toLowerCase() || pools[i].collaterals[j].feed.startsWith('0x0000000000000000000000')){
                        // update price from feed
                        _prices[pools[i].collaterals[j].token.id] = Big(BigNumber.from(res.returnData[reqCount]).toString()).div(1e8).toString();
                        reqCount += 1;
                    } else {
                        // update price from pyth feed
                        _prices[pools[i].collaterals[j].token.id] = Big(pythRes.data[pythIndex].price.price).mul(10**pythRes.data[pythIndex].price.expo).toString();
                        pythIndex += 1;
                    }
                }
                
                for(let j in pools[i].synths) {
                    if(pools[i].synths[j].feed == ethers.constants.HashZero.toLowerCase() || pools[i].synths[j].feed.startsWith('0x0000000000000000000000')){
                        // update price from feed
                        _prices[pools[i].synths[j].token.id] = Big(BigNumber.from(res.returnData[reqCount]).toString()).div(1e8).toString();
                        reqCount += 1;
                    } else {
                        // update price from pyth feed
                        _prices[pools[i].synths[j].token.id] = Big(pythRes.data[pythIndex].price.price).mul(10**pythRes.data[pythIndex].price.expo).toString();
                        pythIndex += 1;
                    }
                }
            }
            for(let i = 0; i < markets.length; i++) {
                const market = markets[i];
                if(market.feed == ethers.constants.HashZero.toLowerCase() || market.feed.startsWith('0x0000000000000000000000')){
                    _prices[market.inputToken.id] = Big(BigNumber.from(res.returnData[reqCount]).toString()).div(1e8).toString();
                    reqCount += 1;
                } else {
                    // update price from pyth feed
                    _prices[market.inputToken.id] = Big(pythRes.data[pythIndex].price.price).mul(10**pythRes.data[pythIndex].price.expo).toString();
                    pythIndex += 1;
                }
            }
            setPrices(_prices);
        })
        .catch((err: any) => {
            console.log("Error fetching prices", err);
        })
    }
    const value: PriceValue = {
		prices,
        subStatus
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