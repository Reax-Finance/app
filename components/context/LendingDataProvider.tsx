import * as React from "react";
import axios from "axios";
import { getAddress, getABI, getContract } from "../../src/contract";
import { ADDRESS_ZERO, WETH_ADDRESS, defaultChain } from '../../src/const';
import { ethers } from "ethers";
import { useEffect } from 'react';
import { useAccount, useNetwork } from "wagmi";
import { Status, SubStatus } from "../utils/status";
import { LendingEndpoints, query_lending } from "../../src/queries/lending";
import useUpdateData from "../utils/useUpdateData";

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
	positions: any[],
	updatePositions: () => void;
	setUserEMode: (eMode: string) => void;
}

const LendingDataContext = React.createContext<LendingDataValue>({} as LendingDataValue);

function LendingDataProvider({ children }: any) {
	const [status, setStatus] = React.useState<Status>(Status.NOT_FETCHING);
	const [subStatus, setSubStatus] = React.useState<SubStatus>(SubStatus.NOT_SUBSCRIBED);
	const [message, setMessage] = React.useState<LendingDataValue['message']>("");
	const { chain } = useNetwork();
	const { address } = useAccount();
	const [pools, setPools] = React.useState<any[]>([[]]);
	const [protocols, setProtocols] = React.useState<any[]>([{}]);
	const [selectedPool, setSelectedPool] = React.useState<any>(0);
	const markets = pools[selectedPool];
	const protocol = protocols[selectedPool];
	const [positions, setPositions] = React.useState<any[]>([[]]);

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
				if (res[0].data.errors || res[1]?.data?.errors) {
					setStatus(Status.ERROR);
					setMessage("Network Error. Please refresh the page or try again later.");
					reject(res[0].data.errors || res[1].data.errors);
				} else {
					let _protocols = [];
					let _pools = [];

					for(let i in res){
						let data = res[i].data.data;
						_protocols.push(data.lendingProtocols[0]);
						_pools.push(data.markets);
						let emodes = [];
						for(let j in data.emodeCategories){
							let emode = data.emodeCategories[j];
							emode.assets = data.markets.filter((market: any) => market.eModeCategory?.id == emode.id);
							emodes.push(emode);
						}
						_protocols[i].eModes = emodes;
						if(_address && (data.account)){
							const _enabledCollaterals = res[i].data.data.account._enabledCollaterals.map((c: any) => c.id);
							_pools[i].forEach((market: any) => {
								market.isCollateral = _enabledCollaterals.includes(market.id);
							})
							_protocols[i].eModeCategory = _protocols[i].eModes.find((emode: any) => emode.id == data.account.eModeCategory?.id);
						}
					}
					console.log("Fetched lending data", _protocols, _pools);
					setProtocols(_protocols);
					_setMarketsPriceFeeds(_pools, _protocols)
					.then((_marketsWithFeeds) => {
						setStatus(Status.SUCCESS);
						resolve(0);
					})
				}
			})
			.catch((err) => {
				console.log(err);
				setStatus(Status.ERROR);
				setMessage(
					"Failed to fetch data. Please refresh the page and try again later."
				);
			});
		});
	};

	const {getUpdateData} = useUpdateData();

	React.useEffect(() => {
        if(subStatus == SubStatus.NOT_SUBSCRIBED && pools[0].length > 1 && protocols[0]?.id && address) {
			setSubStatus(SubStatus.SUBSCRIBED);
			console.log("Subscribed to lending data");
			updatePositions(address);
			setInterval(updatePositions, 30000);
        }
    }, [pools, address, subStatus, protocols]);

	const updatePositions = async (_address = address) => {
		if(!_address) return;
		const chainId = defaultChain.id;
		const provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrls.default.http[0]);
		const helper = new ethers.Contract(
			getAddress("Multicall2", chainId),
			getABI("Multicall2", chainId),
			provider
		);
		let calls = [];
		let pythData: string[] = [];
		if(pools.length > 0) pythData = await getUpdateData();
		for(let i in pools){
			if(!protocols[i]._lendingPoolAddress) continue;
			const _pool = await getContract("LendingPool", chainId, protocols[i]._lendingPoolAddress);
			calls.push([_pool.address, _pool.interface.encodeFunctionData("getUserAccountData((address,bytes[]))", [{user: _address, pythUpdateData: pythData}]), 0]);
		}
		helper.callStatic.aggregate(calls)
		.then(async (res: any) => {
			console.log("Got lending positions", res);
			let resultData = res[1];
			let _positions = [];
			for(let i = 0; i < resultData.length; i++){
				const _pool = await getContract("LendingPool", chainId, protocols[i]._lendingPoolAddress);
				const _marketDataDecoded = _pool.interface.decodeFunctionResult("getUserAccountData((address,bytes[]))", resultData[i]);
				_positions.push({
					totalCollateralBase: _marketDataDecoded[0].toString(),
					totalDebtBase: _marketDataDecoded[1].toString(),
					availableBorrowsBase: _marketDataDecoded[2].toString(),
					currentLiquidationThreshold: _marketDataDecoded[3].toString(),
					ltv: _marketDataDecoded[4].toString(),
					healthFactor: _marketDataDecoded[5].toString(),
				});
			}
			setPositions(_positions);
		})
		.catch((err: any) => {
			console.log("Failed to get lending positions", err, pools);
			setPositions([[]])
		})
	}

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
				console.log("Setting pools", _pools);
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

	const setUserEMode = (emode: string) => {
		let newProtocol = {...protocol};
		newProtocol.eModeCategory = newProtocol.eModes.find((eMode: any) => eMode.id == emode);
		let newProtocols = [...protocols];
		newProtocols[selectedPool] = newProtocol;
		setProtocols(newProtocols);
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
		protocols,
		positions,
		updatePositions,
		setUserEMode
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