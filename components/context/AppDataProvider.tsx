import * as React from "react";
import axios from "axios";
import { getContract } from "../../src/contract";
import { ADDRESS_ZERO, defaultChain } from '../../src/const';
import { BigNumber, ethers } from "ethers";
import { useEffect } from 'react';
import { useAccount, useNetwork } from "wagmi";
import { __chains } from "../../pages/_app";
import { Status } from "../utils/status";
import { Endpoints, query } from "../../src/queries/synthetic";
import Big from "big.js";

interface AppDataValue {
	status: Status;
	message: string;
	pools: any[];
	fetchData: (
		_address?: `0x${string}` | undefined
	) => Promise<number>;
	activePool: number;
	setActivePool: (_: number, pools?: any[]) => void;
	block: number;
	leaderboard: any[];
	account: any,
	setRefresh: (_: number[]) => void; 
	refresh: number[];
	reserveData: any;
	liquidityData: any;
}

const AppDataContext = React.createContext<AppDataValue>({} as AppDataValue);

function AppDataProvider({ children }: any) {
	const [status, setStatus] = React.useState<AppDataValue['status']>(Status.NOT_FETCHING);
	const [message, setMessage] = React.useState<AppDataValue['message']>("");
	const [account, setAccount] = React.useState<any|null>(null);
	const [pools, setPools] = React.useState<any[]>([]);
	
	const [reserveData, setReserveData] = React.useState<any>(undefined);
	const [liquidityData, setLiquidityData] = React.useState<any>(undefined);

	const [activePool, setActivePool] = React.useState(0);
	const [leaderboard, setLeaderboard] = React.useState([]);

	const { address } = useAccount();

	useEffect(() => {
		if(localStorage){
			const _activePool = localStorage.getItem("activePool");
			if(_activePool && pools.length > parseInt(_activePool)){
				setActivePool(parseInt(_activePool));
			}
		}
	}, [pools, activePool])

	useEffect(() => {
		fetchData();
	}, [address])

	const [refresh, setRefresh] = React.useState<number[]>([]);
	const [block, setBlock] = React.useState(0);

	const fetchData = (_address = address): Promise<number> => {
		let chainId = defaultChain.id;
		console.log("Fetching data for chain", chainId);
		return new Promise((resolve, reject) => {
			setStatus(Status.FETCHING);
			if(!_address) _address = ADDRESS_ZERO;
			const uidp = getContract("UIDataProvider", process.env.NEXT_PUBLIC_UIDP_ADDRESS!);
			uidp.getAllData(_address)
				.then(async (res: any) => {
					setAccount({
						address: _address,
						healthFactor: res.healthFactor.div(ethers.constants.WeiPerEther),
						availableToMintUSD: res.availableToMintUSD,
						userTotalBalanceUSD: res.reserveData.userTotalBalanceUSD,
						userAdjustedBalanceUSD: res.reserveData.userAdjustedBalanceUSD,
						userTotalDebtUSD: res.liquidityData.userTotalDebtUSD
					});
					setReserveData(res.reserveData);
					setLiquidityData(res.liquidityData);
					setStatus(Status.SUCCESS);
				})
				.catch((err: any) => {
					console.log("Error", err);
					setStatus(Status.ERROR);
					setMessage(
						"Failed to fetch data. Please refresh the page and try again later."
					);
				});
		});
	};
	
	const value: AppDataValue = {
		account,
		leaderboard,
		status,
		message,
		pools,
		activePool,
		setActivePool,
		fetchData,
		block,
		setRefresh,
		refresh,
		reserveData,
		liquidityData,
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