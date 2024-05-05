import * as React from "react";
import { getContract } from "../../src/contract";
import { ADDRESS_ZERO, DATA_FETCH_FREQUENCY, defaultChain } from '../../src/const';
import { BigNumber, ethers } from "ethers";
import { useEffect } from 'react';
import { useAccount, useBlockNumber, useNetwork } from "wagmi";
import { __chains } from "../../pages/_app";
import { Status } from "../utils/status";
import { Account, ReserveData, LiquidityData } from "../utils/types";

export interface AppDataValue {
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
	account: Account|undefined,
	setRefresh: (_: number[]) => void; 
	refresh: number[];
	reserveData: ReserveData|undefined;
	liquidityData: LiquidityData|undefined;
}

const AppDataContext = React.createContext<AppDataValue>({} as AppDataValue);

function AppDataProvider({ children }: any) {
	const [status, setStatus] = React.useState<AppDataValue['status']>(Status.NOT_FETCHING);
	const [message, setMessage] = React.useState<AppDataValue['message']>("");
	const [account, setAccount] = React.useState<Account>();
	const [pools, setPools] = React.useState<any[]>([]);
	
	const [reserveData, setReserveData] = React.useState<ReserveData>();
	const [liquidityData, setLiquidityData] = React.useState<LiquidityData>();

	const [activePool, setActivePool] = React.useState(0);
	const [leaderboard, setLeaderboard] = React.useState([]);

	const { address, isConnected } = useAccount();

	useBlockNumber({
		onBlock: (block) => {
			console.log("New block", block);
			if(!isConnected) return;
			if(block % DATA_FETCH_FREQUENCY[defaultChain.id] === 0){
				fetchData();
			}
		},
		watch: true
	})

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
			if(status === Status.NOT_FETCHING) setStatus(Status.FETCHING);
			if(!_address) _address = ADDRESS_ZERO;
			const uidp = getContract("UIDataProvider", process.env.NEXT_PUBLIC_UIDP_ADDRESS!);
			uidp.getAllData(_address)
				.then(async (res: any) => {
					console.log(res);
					setAccount({
						healthFactor: res.healthFactor.toString(),
						availableToMintUSD: res.availableToMintUSD.toString(),
						userTotalBalanceUSD: res.reserveData.userTotalBalanceUSD.toString(),
						userAdjustedBalanceUSD: res.reserveData.userAdjustedBalanceUSD.toString(),
						userThresholdBalanceUSD: res.reserveData.userThresholdBalanceUSD.toString(),
						userTotalDebtUSD: res.liquidityData.userTotalDebtUSD.toString()
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