import * as React from "react";
import axios from "axios";
import { ADDRESS_ZERO, defaultChain } from '../../src/const';
import { useNetwork } from "wagmi";
import { Status } from "../utils/status";
import { DEX_ENDPOINT, MINICHEF_ENDPOINT, ROUTER_ENDPOINT, query_dex, query_leaderboard, query_minichef } from "../../src/queries/dex";
import Big from "big.js";
import { ethers } from "ethers";

interface DEXDataValue {
	status: Status;
	message: string;
	pools: any[];
	vault: any;
	fetchData: (address?: string) => Promise<number>;
	dex: any;
	updateStakeBalance: (poolAddress: string, value: string, isMinus: boolean) => void;
}

const DEXDataContext = React.createContext<DEXDataValue>({} as DEXDataValue);

function DEXDataProvider({ children }: any) {
	const [status, setStatus] = React.useState<Status>(Status.NOT_FETCHING);
	const [message, setMessage] = React.useState<DEXDataValue['message']>("");
	const { chain } = useNetwork();
	const [pools, setPools] = React.useState<any[]>([]);
	const [vault, setVault] = React.useState<any>({});
	const [dex, setDex] = React.useState<any>({});

	const fetchData = (_address?: string): Promise<number> => {
		let chainId = defaultChain.id;
		if(chain?.unsupported) chainId = defaultChain.id;
		console.log("Fetching DEX data for chain", chainId);
		return new Promise((resolve, reject) => {
			setStatus(Status.FETCHING);
			console.log("DEX endpoint", DEX_ENDPOINT(chainId), MINICHEF_ENDPOINT(chainId));
			Promise.all([
				axios.post(DEX_ENDPOINT(chainId), {
					query: query_dex(_address?.toLowerCase() ?? ADDRESS_ZERO),
					variables: {},
				}),
				axios.post(MINICHEF_ENDPOINT(chainId), {
					query: query_minichef(_address?.toLowerCase() ?? ADDRESS_ZERO),
					variables: {},
				}),
				axios.post(ROUTER_ENDPOINT(chainId), {
					query: query_leaderboard(_address?.toLowerCase() ?? ADDRESS_ZERO),
					variables: {},
				})
			])
			.then(async (res) => {
				if (res[0].data.errors || res[1].data.errors || res[2].data.errors) {
					setStatus(Status.ERROR);
					setMessage("Network Error. Please refresh the page or try again later.");
					reject(res[0].data.errors ?? res[1].data.errors ?? res[2].data.errors);
				} else {
					let _dex: any = {};
					_dex.leaderboard = res[2].data.data?.users;
					_dex.totalPoints = res[2].data.data?.pools[0].totalVolumeUSD * 0.5 + res[2].data.data?.pools[1].totalVolumeUSD * 1;
					_dex.yourPoints = res[2].data.data?.user;
					_dex.totalLiquidity = res[0].data.data.balancers[0].totalLiquidity;
					_dex.totalSwapVolume = res[0].data.data.balancers[0].totalSwapVolume;
					_dex.totalSwapFee = res[0].data.data.balancers[0].totalSwapFee;

					const _pools = res[0].data.data.balancers[0].pools;

					const miniChef = res[1].data.data.miniChefs[0] ?? {};
					_dex.totalAllocPoint = miniChef?.totalAllocPoint ?? '0';
					_dex.sushiPerSecond = miniChef?.sushiPerSecond ?? '0';
					_dex.miniChef = miniChef?.id ?? ethers.constants.AddressZero;

					const positions = res[1].data.data.users;
					for(let i in positions){
						for(let j in miniChef?.pools ?? []){
							if(Number(miniChef.pools[j].id) == Number(positions[i].id.split('-')[0])){
								miniChef.pools[j].stakedBalance = positions[i].amount;
							}
						}
					}

					for(let i in _pools){
						let mPool = (miniChef?.pools ?? []).find((mpool: any) => mpool.pair == _pools[i].address);
						if(!mPool) continue;
						_pools[i].pid = mPool.id ?? -1;
						_pools[i].allocPoint = mPool.allocPoint ?? 0;
						_pools[i].accSushiPerShare = mPool.accSushiPerShare ?? 0;
						_pools[i].stakedBalance = mPool.stakedBalance ?? 0;
						_pools[i].slpBalance = mPool.slpBalance;
					}

					setDex(_dex);
                    setPools(_pools);
					setVault({address: res[0].data.data.balancers[0].address})
					setStatus(Status.SUCCESS);
					resolve(0);
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

	const updateStakeBalance = (poolAddress: string, value: string, isMinus: boolean) => {
		let _pools = [...pools];
		for(let i in _pools){
			if(_pools[i].address == poolAddress){
				_pools[i].stakedBalance = Big(_pools[i].stakedBalance ?? 0)[isMinus ? 'sub' : 'add'](value).toString();
				_pools[i].slpBalance = Big(_pools[i].slpBalance ?? 0)[isMinus ? 'sub' : 'add'](value).toString();
			}
		} 
		setPools(_pools);
	}

	const value: DEXDataValue = {
		status,
		message,
		pools,
		vault,
		fetchData,
		dex,
		updateStakeBalance
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
