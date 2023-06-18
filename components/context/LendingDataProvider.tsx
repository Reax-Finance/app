import * as React from "react";
import axios from "axios";
import { getAddress, getABI, getContract } from "../../src/contract";
import { ADDRESS_ZERO, defaultChain } from '../../src/const';
import { ethers } from "ethers";
import { useEffect } from 'react';
import { useAccount, useNetwork } from "wagmi";
import { Status, SubStatus } from "../utils/status";
import { LendingEndpoint, query_lending } from "../../src/queries/lending";

interface LendingDataValue {
	status: Status;
	message: string;
	markets: any[];
	protocol: any;
	toggleIsCollateral: (marketId: string) => void;
	fetchData: (address?: string) => Promise<number>;
}

const LendingDataContext = React.createContext<LendingDataValue>({} as LendingDataValue);

function LendingDataProvider({ children }: any) {
	const [status, setStatus] = React.useState<Status>(Status.NOT_FETCHING);
	const [subStatus, setSubStatus] = React.useState<SubStatus>(SubStatus.NOT_SUBSCRIBED);
	const [message, setMessage] = React.useState<LendingDataValue['message']>("");
	const { chain } = useNetwork();
	const { address } = useAccount();
	const [markets, setMarkets] = React.useState<any[]>([]);
	const [protocol, setProtocol] = React.useState<any>({});

    useEffect(() => {
        if(address && status == Status.NOT_FETCHING && markets.length == 0){
            fetchData(address);
        }
    }, [status, address, markets])

	const fetchData = (_address?: string): Promise<number> => {
		let chainId = chain?.id ?? defaultChain.id;
		if(chain?.unsupported) chainId = defaultChain.id;
		console.log("fetching lending data for chain", chainId);
		return new Promise((resolve, reject) => {
			setStatus(Status.FETCHING);
			const endpoint = LendingEndpoint(chainId)
			console.log("lending endpoint", endpoint);
			if(!_address) _address = ADDRESS_ZERO;
			Promise.all([
				axios.post(endpoint, {
					query: query_lending(_address.toLowerCase()),
					variables: {},
				})
			])
			.then(async (res) => {
				if (res[0].data.errors) {
					setStatus(Status.ERROR);
					setMessage("Network Error. Please refresh the page or try again later.");
					reject(res[0].data.errors);
				} else {
					const poolsData = res[0].data.data.lendingProtocols[0];
					setProtocol(poolsData);
					const _markets = res[0].data.data.markets;
					if(_address && res[0].data.data.account){
						const _enabledCollaterals = res[0].data.data.account._enabledCollaterals.map((c: any) => c.id);
						_markets.forEach((market: any) => {
							market.isCollateral = _enabledCollaterals.includes(market.id);
						})
					}
					_setMarketsPriceFeeds(_markets, poolsData._priceOracle)
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
		_markets: any[],
		_oracle: string,
		nTries: number = 0
	): Promise<any> => {
		const chainId = chain?.id ?? defaultChain.id;
		if(chain?.unsupported) return Promise.resolve(1);
		const provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrls.default.http[0]);
		const helper = new ethers.Contract(
			getAddress("Multicall2", chainId),
			getABI("Multicall2", chainId),
			provider
		);
		return new Promise(async (resolve, reject) => {
			let calls: any[] = [];
			const oracle = await getContract("PythOracle", chainId, _oracle);
			const fallbackOracle = await oracle.getFallbackOracle();
			for (let i = 0; i < _markets.length; i++) {
				calls.push([_oracle, oracle.interface.encodeFunctionData("getSourceOfAsset", [_markets[i].inputToken.id])]);
				calls.push([fallbackOracle, oracle.interface.encodeFunctionData("getSourceOfAsset", [_markets[i].inputToken.id])]);
			}

			helper.callStatic.aggregate(calls).then(async (res: any) => {
				let index = 0;
				// setting wallet balance and allowance
				for (let i = 0; i < _markets.length; i++) {
					_markets[i].feed = res.returnData[index];
					index += 1;
					_markets[i].fallbackFeed = res.returnData[index];
					index += 1;
				}
				setMarkets(_markets);
				resolve(_markets);
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
						_setMarketsPriceFeeds(_markets, _oracle, nTries + 1);
					}, 1000)
				}	
			})
		});
	};

	const toggleIsCollateral = (marketId: string) => {
		const _markets = markets.map((market) => {
			if (market.id == marketId) {
				market.isCollateral = !(market.isCollateral ?? false);
			}
			return market;
		});
		setMarkets(_markets);
	}

	const value: LendingDataValue = {
		status,
		message,
		markets,
		protocol,
		toggleIsCollateral,
		fetchData
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
