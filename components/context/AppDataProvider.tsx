import * as React from "react";
import axios from "axios";
import { getAddress, getABI, getContract } from "../../src/contract";
import { ADDRESS_ZERO, defaultChain } from '../../src/const';
import { ethers } from "ethers";
import { useEffect } from 'react';
import { useAccount, useNetwork } from "wagmi";
const { Big } = require("big.js");
import { __chains } from "../../pages/_app";
import { Status } from "../utils/status";
import { Endpoints, query, query_leaderboard, query_referrals } from "../../src/queries/synthetic";

interface AppDataValue {
	status: Status;
	message: string;
	pools: any[];
	fetchData: (
		_address?: string
	) => Promise<number>;
	tradingPool: number;
	setTradingPool: (_: number, pools?: any[]) => void;
	updateCollateralAmount: (collateralAddress: string, poolAddress: string, amount: string, minus: boolean) => void;
	block: number;
	updatePoolBalance: (poolAddress: string, value: string, amountUSD: string, minus: boolean) => void;
	refreshData: () => void;
	leaderboard: any[];
	account: any,
	setRefresh: (_: number[]) => void; 
	refresh: number[];
	referrals: any[];
}

const AppDataContext = React.createContext<AppDataValue>({} as AppDataValue);

function AppDataProvider({ children }: any) {
	const [status, setStatus] = React.useState<AppDataValue['status']>(Status.NOT_FETCHING);
	const [message, setMessage] = React.useState<AppDataValue['message']>("");
	const { chain } = useNetwork();
	const { address } = useAccount();
	const [account, setAccount] = React.useState<any|null>(null);
	const [pools, setPools] = React.useState<any[]>([]);
	const [tradingPool, setTradingPool] = React.useState(0);
	const [leaderboard, setLeaderboard] = React.useState([]);

	useEffect(() => {
		if(localStorage){
			const _tradingPool = localStorage.getItem("tradingPool");
			if(_tradingPool && pools.length > parseInt(_tradingPool)){
				setTradingPool(parseInt(_tradingPool));
			}
		}
	}, [tradingPool, pools])

	const [refresh, setRefresh] = React.useState<number[]>([]);
	const [block, setBlock] = React.useState(0);
	const [random, setRandom] = React.useState(0);

	const [referrals, setReferrals] = React.useState<any[]>([]);

	useEffect(() => {
		if (refresh.length == 0 && pools.length > 0) {
			// set new interval
			const timer = setInterval(refreshData, 10000);
			setRefresh([Number(timer.toString())]);
			setRandom(Math.random());
		}
	}, [refresh, pools, random]); 

	const fetchData = (_address?: string): Promise<number> => {
		let chainId = chain?.id ?? defaultChain.id;
		if(chain?.unsupported) chainId = defaultChain.id;
		console.log("fetching for chain", chainId);
		return new Promise((resolve, reject) => {
			setStatus(Status.FETCHING);
			const endpoint = Endpoints(chainId)
			console.log("endpoint", endpoint);
			if(!_address) _address = ADDRESS_ZERO;
			Promise.all([
				axios.post(endpoint, {
					query: query(_address?.toLowerCase()),
					variables: {},
				}), 
				axios.post(endpoint, {
					query: query_leaderboard,
					variables: {},
				}),
				axios.post(endpoint, {
					query: query_referrals(_address?.toLowerCase()),
					variables: {},
				})
			])
				.then(async (res) => {
					if (res[0].data.errors || res[1].data.errors || res[2].data.errors) {
						setStatus(Status.ERROR);
						setMessage("Network Error. Please refresh the page or try again later.");
						reject(res[0].data.errors || res[1].data.errors || res[2].data.errors);
					} else {
						const userPoolData = res[0].data.data;
						const leaderboardData = res[1].data.data.accounts;
						const _refs = res[2].data.data.accounts;
						setReferrals(_refs);
						setLeaderboard(leaderboardData);
						const _pools = userPoolData.pools;
						const _account = userPoolData.accounts[0];

						if(_account){
							for(let i = 0; i < _account.positions.length; i++){
								let pos = _account.positions[i];
								let poolId = pos.pool.id;
								for(let j = 0; j < _pools.length; j++){
									if(_pools[j].id == poolId){
										_pools[j].balance = pos.balance;
										// finding collateral
										for(let k = 0; k < pos.collateralBalances.length; k++){
											for(let l = 0; l < _pools[j].collaterals.length; l++){
												if(pos.collateralBalances[k].collateral.token.id == _pools[j].collaterals[l].token.id){
													_pools[j].collaterals[l].balance = pos.collateralBalances[k].balance;
												}
											}
										}
									}
								}
								setAccount(_account);
							}
						}

						setPools(_pools);
						setPoolFeeds(_pools)
							.then((_poolsWithFeeds) => {
								refreshData(_poolsWithFeeds);
								setStatus(Status.SUCCESS);
								resolve(0);
							})
							.catch((err) => {
								setStatus(Status.ERROR);
								setMessage(
									"Failed to fetch data. Please refresh the page and try again later."
								);
								reject(err);
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

	const setPoolFeeds = (_pools: any[], nTries = 0) => {
		return new Promise<any>(async (resolve, reject) => {
			const chainId = chain?.id ?? defaultChain.id;
			const provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrls.default.http[0]);
			const helper = new ethers.Contract(
				getAddress("Multicall2", chainId),
				getABI("Multicall2", chainId),
				provider
			);
			let calls: any[] = [];
			for(let i in _pools){
				const pool = _pools[i];
				const oracle = await getContract("PythOracle", chainId, pool.oracle);
				const fallbackOracle = await oracle.getFallbackOracle();
				for (let j = 0; j < pool.synths.length; j++) {
					calls.push([pool.oracle, oracle.interface.encodeFunctionData("getSourceOfAsset", [pool.synths[j].token.id])]);
					calls.push([fallbackOracle, oracle.interface.encodeFunctionData("getSourceOfAsset", [pool.synths[j].token.id])]);
				}
				for(let j = 0; j < pool.collaterals.length; j++){
					calls.push([pool.oracle, oracle.interface.encodeFunctionData("getSourceOfAsset", [pool.collaterals[j].token.id])]);
					calls.push([fallbackOracle, oracle.interface.encodeFunctionData("getSourceOfAsset", [pool.collaterals[j].token.id])]);
				}
			}

			helper.callStatic.aggregate(calls).then(async (res: any) => {
				setBlock(parseInt(res[0].toString()));
				let index = 0;
				for(let i in _pools){
					const pool = _pools[i];
					for (let j = 0; j < pool.synths.length; j++) {
						pool.synths[j].feed = res.returnData[index].toString();
						pool.synths[j].fallbackFeed = res.returnData[index + 1].toString();
						index += 2;
					}
					for(let j = 0; j < pool.collaterals.length; j++){
						pool.collaterals[j].feed = res.returnData[index].toString();
						pool.collaterals[j].fallbackFeed = res.returnData[index + 1].toString();
						index += 2;
					}
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
						setPoolFeeds(_pools, nTries + 1);
					}, 1000)
				}	
			})
		});
	}

	const refreshData = async (_pools = pools) => {
		console.log("refreshing synthetic data");
		return new Promise(async (resolve, reject) => {
			const chainId = chain?.id ?? defaultChain.id;
			const reqs: any[] = [];
			if(_pools.length == 0) {
				console.log("No pools found", _pools);
				return;
			}
			let provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrls.default.http[0]);
			
			const helper = new ethers.Contract(
				getAddress("Multicall2", chainId),
				getABI("Multicall2", chainId),
				provider
			);
			const pool = new ethers.Contract(_pools[0].id, getABI("Pool", chainId), helper.provider);
			for(let i in _pools) {
				for(let j in _pools[i].synths) {
					const synth = _pools[i].synths[j];
					reqs.push([
						synth.token.id,
						pool.interface.encodeFunctionData("totalSupply", [])
					]);
				}
				reqs.push([
					_pools[i].id,
					pool.interface.encodeFunctionData("totalSupply", [])
				]);
				if(address) reqs.push([
					_pools[i].id,
					pool.interface.encodeFunctionData("balanceOf", [address])
				])
			}

			helper.callStatic.aggregate(reqs).then(async (res: any) => {
				if(res.returnData.length > 0){
					let reqCount = 0;
					for(let i = 0; i < _pools.length; i++) {
						for(let j in _pools[i].synths) {
							_pools[i].synths[j].totalSupply = pool.interface.decodeFunctionResult("totalSupply", res.returnData[reqCount])[0].toString();
							reqCount += 1;
						}
						
						_pools[i].totalSupply = pool.interface.decodeFunctionResult("totalSupply", res.returnData[reqCount])[0].toString();
						reqCount += 1;
						if(address) {
							_pools[i].balance = pool.interface.decodeFunctionResult("balanceOf", res.returnData[reqCount])[0].toString();
							reqCount += 1;
						}

						// TODO: sort pool.synths. Has conflict with balance data updates
						// _pools[i].synths.sort((a: any, b: any) => {
						// 	return (
						// 		parseFloat(b.totalSupply) *
						// 		parseFloat(b.priceUSD)
						// 	) -
								
						// 		(parseFloat(a.totalSupply) *
						// 			parseFloat(a.priceUSD));
						// });
						// updateUserParams(_pools[i]);
					}
					setPools(_pools);
					setRandom(Math.random());
					resolve("Refreshed pools");
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

	const updatePoolBalance = (poolAddress: string, value: string, amountUSD: string, isMinus: boolean = false) => {
		let _pools = pools;
		for (let i in _pools) {
			if (_pools[i].id == poolAddress) {
				// update pool params
				_pools[i].balance = Big(_pools[i].balance ?? 0)[isMinus?'minus' : 'add'](value).toString();
				_pools[i].totalSupply = Big(_pools[i].totalSupply ?? 0)[isMinus?'minus' : 'add'](value).toString();
				_pools[i].totalDebtUSD = Big(_pools[i].totalDebtUSD ?? 0)[isMinus?'minus' : 'add'](amountUSD).toString();
				// update total debt
				_pools[i].totalDebt = Big(_pools[i].totalDebt ?? 0)[isMinus?'minus' : 'add'](amountUSD).toNumber();
				setPools(_pools);
				setRandom(Math.random());
				return;
			}
		}
	};

	const updateCollateralAmount = (
		collateralAddress: string,
		poolAddress: string,
		value: string,
		isMinus: boolean = false
	) => {
		let _pools = pools;
		for (let i in _pools) {
			if (_pools[i].id == poolAddress) {
				for (let j in _pools[i].collaterals) {
					console.log(_pools[i].collaterals[j].token.id, collateralAddress);
					if (_pools[i].collaterals[j].token.id == collateralAddress) {
						_pools[i].collaterals[j].balance = Big(_pools[i].collaterals[j].balance ?? 0)[isMinus?'minus':'add'](value).toString();
						_pools[i].userAdjustedCollateral = Big(_pools[i].userAdjustedCollateral ?? 0)[isMinus?'minus':'add'](Big(value).div(10**_pools[i].collaterals[j].token.decimals).mul(_pools[i].collaterals[j].priceUSD).mul(_pools[i].collaterals[j].baseLTV).div(10000)).toNumber();
						_pools[i].userCollateral = Big(_pools[i].userCollateral ?? 0)[isMinus?'minus':'add'](Big(value).div(10**_pools[i].collaterals[j].token.decimals).mul(_pools[i].collaterals[j].priceUSD)).toNumber();
						// updateUserParams(_pools[i]);
					}
				}
			}
		}
		setPools(_pools);
		setRandom(Math.random());
	};

	const value: AppDataValue = {
		account,
		leaderboard,
		status,
		message,
		pools,
		tradingPool,
		setTradingPool,
		updatePoolBalance,
		fetchData,
		updateCollateralAmount,
		block,
		refreshData,
		setRefresh,
		refresh,
		referrals
	};

	return (
		<AppDataContext.Provider value={value}>
			{children}
		</AppDataContext.Provider>
	);
}

export const useAppData = () => {
	return React.useContext(AppDataContext);
}

export { AppDataProvider, AppDataContext };