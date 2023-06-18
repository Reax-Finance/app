import * as React from "react";
import axios from "axios";
import { getAddress, getABI, getContract } from "../../src/contract";
import { ADDRESS_ZERO, defaultChain } from '../../src/const';
import { ethers } from "ethers";
import { useEffect } from 'react';
import { useAccount, useNetwork } from "wagmi";
import { Status, SubStatus } from "../utils/status";
import { DEX_ENDPOINT, query_dex } from "../../src/queries/dex";

interface DEXDataValue {
	status: Status;
	message: string;
	pools: any[];
}

const DEXDataContext = React.createContext<DEXDataValue>({} as DEXDataValue);

function DEXDataProvider({ children }: any) {
	const [status, setStatus] = React.useState<Status>(Status.NOT_FETCHING);
	const [subStatus, setSubStatus] = React.useState<SubStatus>(SubStatus.NOT_SUBSCRIBED);
	const [message, setMessage] = React.useState<DEXDataValue['message']>("");
	const { chain } = useNetwork();
	const { address } = useAccount();
	const [pools, setPools] = React.useState<any[]>([]);

    useEffect(() => {
        if(address && status == Status.NOT_FETCHING && pools.length == 0){
            fetchData(address);
        }
    }, [status, address, pools])

	// React.useEffect(() => {
    //     if(subStatus == SubStatus.NOT_SUBSCRIBED && markets.length > 0 && address) {
    //         if(markets[0].feed){
	// 			setSubStatus(SubStatus.SUBSCRIBED);
	// 			setInterval(refreshData, 10000);
	// 		}
    //     }
    // }, [markets, address, status])

	const fetchData = (_address: string | null): Promise<number> => {
		let chainId = chain?.id ?? defaultChain.id;
		if(chain?.unsupported) chainId = defaultChain.id;
		console.log("fetching dex data for chain", chainId);
		return new Promise((resolve, reject) => {
			setStatus(Status.FETCHING);
			const endpoint = DEX_ENDPOINT(chainId)
			console.log("dex endpoint", endpoint);
			Promise.all([
				axios.post(endpoint, {
					query: query_dex(_address?.toLowerCase() ?? ADDRESS_ZERO),
					variables: {},
				})
			])
			.then(async (res) => {
				if (res[0].data.errors) {
					setStatus(Status.ERROR);
					setMessage("Network Error. Please refresh the page or try again later.");
					reject(res[0].data.errors);
				} else {
                    setPools(res[0].data.data.pools);
					// const poolsData = res[0].data.data.lendingProtocols[0];
					// setProtocol(poolsData);
					// const _markets = res[0].data.data.markets;
					// if(_address && res[0].data.data.account){
					// 	const _enabledCollaterals = res[0].data.data.account._enabledCollaterals.map((c: any) => c.id);
					// 	_markets.forEach((market: any) => {
					// 		market.isCollateral = _enabledCollaterals.includes(market.id);
					// 	})
					// }
					// _setMarketsPriceFeeds(_markets, poolsData._priceOracle)
					// .then((_marketsWithFeeds) => {
					// 	refreshData(_marketsWithFeeds);
					// 	setStatus(Status.SUCCESS);
					// 	resolve(0);
					// })
				}
			})
			.catch((err) => {
				setStatus(Status.ERROR);
				setMessage(
					"Failed to fetch data. Please refresh the page and try again later."
				);
			});
		});
	};

	const value: DEXDataValue = {
		status,
		message,
		pools
	};

	return (
		<DEXDataContext.Provider value={value}>
			{children}
		</DEXDataContext.Provider>
	);
}

export const useDexData = () => {
	return React.useContext(DEXDataContext);
}

export { DEXDataProvider, DEXDataContext };
