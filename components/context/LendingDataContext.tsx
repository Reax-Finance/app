import * as React from "react";
import axios from "axios";
import { getAddress, getABI, getContract } from "../../src/contract";
import { ADDRESS_ZERO, defaultChain, query_lending, LendingEndpoint } from '../../src/const';
import { ethers } from "ethers";
import { useEffect } from 'react';
import { useAccount, useNetwork } from "wagmi";
import { Status, SubStatus } from "../utils/status";

interface LendingDataValue {
	status: Status;
	message: string;
	markets: any[];
	protocol: any;
	toggleIsCollateral: (marketId: string) => void;
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

	React.useEffect(() => {
        if(subStatus == SubStatus.NOT_SUBSCRIBED && markets.length > 0 && address) {
            if(markets[0].feed){
				setSubStatus(SubStatus.SUBSCRIBED);
				setInterval(refreshData, 10000);
			}
        }
    }, [markets, address, status])

	const fetchData = (_address: string | null): Promise<number> => {
		let chainId = chain?.id ?? defaultChain.id;
		if(chain?.unsupported) chainId = defaultChain.id;
		console.log("fetching lending data for chain", chainId);
		return new Promise((resolve, reject) => {
			setStatus(Status.FETCHING);
			const endpoint = LendingEndpoint(chainId)
			console.log("lending endpoint", endpoint);
			Promise.all([
				axios.post(endpoint, {
					query: query_lending(_address?.toLowerCase() ?? ADDRESS_ZERO),
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
						refreshData(_marketsWithFeeds);
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

	// update atoken, vtoken, stoken balance
	const refreshData = async (_markets = markets) => {
		console.log("refreshing lending data", _markets);
		return new Promise(async (resolve, reject) => {
			const chainId = chain?.id ?? defaultChain.id;
			const reqs: any[] = [];
			if(_markets.length == 0) {
				console.log("No _markets found", _markets);
				return;
			}
			let provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrls.default.http[0]);
			
			const helper = new ethers.Contract(
				getAddress("Multicall2", chainId),
				getABI("Multicall2", chainId),
				provider
			);
			for(let i in _markets) {
				const mockToken = new ethers.Contract(_markets[i].outputToken.id, getABI("MockToken", chainId), helper.provider);
				reqs.push([_markets[i].outputToken.id, mockToken.interface.encodeFunctionData("balanceOf", [address])]);
				reqs.push([_markets[i]._vToken.id, mockToken.interface.encodeFunctionData("balanceOf", [address])]);
				reqs.push([_markets[i]._sToken.id, mockToken.interface.encodeFunctionData("balanceOf", [address])]);
			}

			helper.callStatic.aggregate(reqs).then(async (res: any) => {
				if(res.returnData.length > 0){
					let reqCount = 0;
					for(let i = 0; i < _markets.length; i++) {
						_markets[i].aTokenBalance = res.returnData[reqCount] / (10 ** _markets[i].outputToken.decimals);
						_markets[i].vTokenBalance = res.returnData[reqCount + 1] / (10 ** _markets[i]._vToken.decimals);
						_markets[i].sTokenBalance = res.returnData[reqCount + 2] / (10 ** _markets[i]._sToken.decimals);
						reqCount += 3;
					}
					setMarkets(_markets);
					resolve("Refreshed lending market balances");
				} else {
					console.log("No return data");
					reject("No return data")
				}
			})
			.catch(err => {
				console.log("Failed multicall", err);
				reject(err);
			})
		})
	}

	const value: LendingDataValue = {
		status,
		message,
		markets,
		protocol,
		toggleIsCollateral
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
