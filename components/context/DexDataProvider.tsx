import * as React from "react";
import axios from "axios";
import { getAddress, getABI, getArtifact } from "../../src/contract";
import { ADDRESS_ZERO, defaultChain } from '../../src/const';
import { ethers } from "ethers";
import { useEffect } from 'react';
import { useAccount, useNetwork } from "wagmi";
import { Status, SubStatus } from "../utils/status";
import { DEX_ENDPOINT, query_dex } from "../../src/queries/dex";
import Big from "big.js";

interface DEXDataValue {
	status: Status;
	message: string;
	pools: any[];
	vault: any;
	fetchData: (address?: string) => Promise<number>;
}

const DEXDataContext = React.createContext<DEXDataValue>({} as DEXDataValue);

function DEXDataProvider({ children }: any) {
	const [status, setStatus] = React.useState<Status>(Status.NOT_FETCHING);
	const [subStatus, setSubStatus] = React.useState<SubStatus>(SubStatus.NOT_SUBSCRIBED);
	const [message, setMessage] = React.useState<DEXDataValue['message']>("");
	const { chain } = useNetwork();
	const { address } = useAccount();
	const [pools, setPools] = React.useState<any[]>([]);
	const [vault, setVault] = React.useState<any>({});

	React.useEffect(() => {
        if(subStatus == SubStatus.NOT_SUBSCRIBED && pools.length > 0 && address) {
			setSubStatus(SubStatus.SUBSCRIBED);
			console.log("subscribing to dex data");
			setInterval(refreshData, 10000);
        }
    }, [pools, address, status])

	const fetchData = (_address?: string): Promise<number> => {
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
					const _pools = res[0].data.data.balancers[0].pools;
                    setPools(_pools);
					setVault({address: res[0].data.data.balancers[0].address})
					setStatus(Status.SUCCESS);
					resolve(0);
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

	const refreshData = () => {
		const chainId = chain?.id ?? defaultChain.id;
		const provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrls.default.http[0]);
		const helper = new ethers.Contract(
			getAddress("Multicall2", chainId),
			getABI("Multicall2", chainId),
			provider
		);
		return new Promise(async (resolve, reject) => {
            let calls: any[] = [];
			const itf = new ethers.utils.Interface(getABI("MockToken", chainId));
			const stablePoolItf = new ethers.utils.Interface(getArtifact("ComposableStablePool"));
			const vaultContract = new ethers.Contract(vault.address, getArtifact("Vault"), provider);
			pools.forEach((pool: any) => {
				if(pool.totalShares > 0){
					calls.push([pool.address, stablePoolItf.encodeFunctionData("getActualSupply", [])]);
					calls.push([vault.address, vaultContract.interface.encodeFunctionData("getPoolTokens", [pool.id])]);
				}
			});
			helper.callStatic.aggregate(calls)
			.then((res: any) => {
				// update pool.totalShares
				let index = 0;
				const _pools = pools.map((pool: any, i: number) => {
					if(pool.totalShares > 0){
						pool.totalShares = ethers.utils.formatEther(ethers.BigNumber.from(res.returnData[index]).toString());
						index++;
						const poolTokens = vaultContract.interface.decodeFunctionResult("getPoolTokens", res.returnData[index]);
						index++;
						for(let i in poolTokens.tokens){
							for(let j in pool.tokens){
								if(poolTokens.tokens[i].toLowerCase() == pool.tokens[j].token.id){
									pool.tokens[j].balance = Big(poolTokens.balances[i].toString()).div(10**pool.tokens[j].token.decimals).toFixed(pool.tokens[j].token.decimals);
								}
							}
						}
					}
					return pool;
				});
				setPools(_pools);
				resolve(0);
			})
			.catch((err: any) => {
				console.log("Failed to refresh dex data", err);
			})
		})
	}

	const value: DEXDataValue = {
		status,
		message,
		pools,
		vault,
		fetchData,
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
