import * as React from "react";
import axios from "axios";
import { getAddress, getABI, getContract } from "../../src/contract";
import { ADDRESS_ZERO, defaultChain } from '../../src/const';
import { ethers } from "ethers";
import { useEffect } from 'react';
import { useAccount, useNetwork } from "wagmi";
import { Status, SubStatus } from "../utils/status";
import { LendingEndpoint, LendingEndpoint2, LendingEndpoints, query_lending } from "../../src/queries/lending";

interface LendingDataValue {
	status: Status;
	message: string;
	markets: any[];
	protocol: any;
	toggleIsCollateral: (marketId: string) => void;
	fetchData: (address?: string) => Promise<number>;
	pools: any[],
	selectedPool: number, 
	setSelectedPool: (index: number) => void;
	protocols: any[],
}

const LendingDataContext = React.createContext<LendingDataValue>({} as LendingDataValue);

function LendingDataProvider({ children }: any) {
	const [status, setStatus] = React.useState<Status>(Status.NOT_FETCHING);
	const [subStatus, setSubStatus] = React.useState<SubStatus>(SubStatus.NOT_SUBSCRIBED);
	const [message, setMessage] = React.useState<LendingDataValue['message']>("");
	const { chain } = useNetwork();
	const { address } = useAccount();
	const [pools, setPools] = React.useState<any[]>([[]]);
	const [protocols, setProtocols] = React.useState<any[]>([[]]);
	const [selectedPool, setSelectedPool] = React.useState<any>(0);
	const markets = pools[selectedPool];
	const protocol = protocols[selectedPool];

	useEffect(() => {
		if(localStorage){
			const _lendingPool = localStorage.getItem("lendingPool");
			if(_lendingPool && pools.length > parseInt(_lendingPool)){
				setSelectedPool(parseInt(_lendingPool));
			}
		}
	}, [selectedPool, pools])

	const fetchData = (_address?: string): Promise<number> => {
		let chainId = defaultChain.id;
		if(chain?.unsupported) chainId = defaultChain.id;
		console.log("Fetching lending data for chain", chainId);
		return new Promise((resolve, reject) => {
			setStatus(Status.FETCHING);
			if(!_address) _address = ADDRESS_ZERO;
			Promise.all(
				LendingEndpoints(chainId).map((endpoint) => {
					return axios.post(endpoint, {
						query: query_lending(_address!.toLowerCase()),
						variables: {},
					})
				}))
			.then(async (res) => {
				console.log(res);
				if (res[0].data.errors || res[1]?.data?.errors) {
					setStatus(Status.ERROR);
					setMessage("Network Error. Please refresh the page or try again later.");
					reject(res[0].data.errors || res[1].data.errors);
				} else {
					const _protocols = res.map((r: any) => r.data.data.lendingProtocols[0]);
					setProtocols(res.map((r: any) => r.data.data.lendingProtocols[0]));
					const _pools = res.map((r: any) => r.data.data.markets);
					for(let i in _pools){
						if(_address && (res[i].data.data.account)){
							const _enabledCollaterals = res[i].data.data.account._enabledCollaterals.map((c: any) => c.id);
							_pools[i].forEach((market: any) => {
								market.isCollateral = _enabledCollaterals.includes(market.id);
							})
						}
					}
					_setMarketsPriceFeeds(_pools, _protocols)
					.then((_marketsWithFeeds) => {
						setStatus(Status.SUCCESS);
						resolve(0);
					})
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

	/**
	 * Set Price Feeds
	 * @param _pools 
	 * @param _address 
	 * @param nTries 
	 * @returns 
	 */
	const _setMarketsPriceFeeds = (
		_pools: any[],
		_protocols: any[],
		nTries: number = 0
	): Promise<any> => {
		const chainId = defaultChain.id;
		const provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrls.default.http[0]);
		const helper = new ethers.Contract(
			getAddress("Multicall2", chainId),
			getABI("Multicall2", chainId),
			provider
		);
		return new Promise(async (resolve, reject) => {
			let calls: any[] = [];
			for(let i in _pools){
				let _markets = _pools[i];
				const oracle = new ethers.Contract(_protocols[i]._priceOracle, getABI("PythOracle", chainId), provider);
				const fallbackOracle = await oracle.getFallbackOracle();
				for (let j = 0; j < _markets.length; j++) {
					calls.push([_protocols[i]._priceOracle, oracle.interface.encodeFunctionData("getSourceOfAsset", [_markets[j].inputToken.id])]);
					calls.push([fallbackOracle, oracle.interface.encodeFunctionData("getSourceOfAsset", [_markets[j].inputToken.id])]);
				}
			}

			helper.callStatic.aggregate(calls).then(async (res: any) => {
				let index = 0;
				for(let i in _pools){
					let _markets = _pools[i];
					for (let j = 0; j < _markets.length; j++) {
						_markets[j].feed = res.returnData[index];
						index += 1;
						_markets[j].fallbackFeed = res.returnData[index];
						index += 1;
					}
					_pools[i] = _markets;
				}
				setPools(_pools);
				resolve(_pools);
			})
			.catch(err => {
				console.log("Failed to get price feeds", err, calls);
				setStatus(Status.ERROR);
				setMessage(
					"Failed to fetch data. Please refresh the page or try again later."
				);
				// reject(err)
				if(nTries > 5) {
					reject(err);
					return;
				}
				else {
					// try again in 5 seconds
					setTimeout(() => {
						_setMarketsPriceFeeds(_pools, _protocols, nTries + 1);
					}, 1000)
				}
			})
		});
	};

	const toggleIsCollateral = (marketId: string) => {
		let _pools = [...pools]
		for(let i in _pools){
			const _markets = _pools[i].map((market: any) => {
				if (market.id == marketId) {
					market.isCollateral = !(market.isCollateral ?? false);
				}
				return market;
			});
			_pools[i] = _markets
		}

		setPools(_pools);
	}

	const value: LendingDataValue = {
		status,
		message,
		markets,
		protocol,
		toggleIsCollateral,
		fetchData,
		selectedPool,
		setSelectedPool,
		pools,
		protocols
	};

	return (
		<LendingDataContext.Provider value={value}>
			{children}
		</LendingDataContext.Provider>
	);
}

export const useLendingData = () => {
	return React.useContext(LendingDataContext);
}

export { LendingDataProvider, LendingDataContext };
