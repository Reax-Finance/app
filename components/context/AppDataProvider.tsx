import * as React from "react";
import { getContract } from "../../src/contract";
import { ADDRESS_ZERO, defaultChain } from '../../src/const';
import { BigNumber, ethers } from "ethers";
import { useEffect } from 'react';
import { useAccount } from "wagmi";
import { __chains } from "../../pages/_app";
import { Status } from "../utils/status";
import { Account, ReserveData, LiquidityData } from "../utils/types";
import useUpdateData from "../utils/useUpdateData";

export interface AppDataValue {
	status: Status;
	message: string;
	// fetchData: (
	// 	_address?: `0x${string}` | undefined
	// ) => Promise<number>;
	account: Account|undefined,
	reserveData: ReserveData|undefined;
	liquidityData: LiquidityData|undefined;
}

const AppDataContext = React.createContext<AppDataValue>({} as AppDataValue);

function AppDataProvider({ children }: any) {
	const [status, setStatus] = React.useState<AppDataValue['status']>(Status.NOT_FETCHING);
	const [message, setMessage] = React.useState<AppDataValue['message']>("");
	const [account, setAccount] = React.useState<Account>();
	
	const [reserveData, setReserveData] = React.useState<ReserveData>();
	const [liquidityData, setLiquidityData] = React.useState<LiquidityData>();

	const { address, isConnected, isConnecting, isDisconnected } = useAccount();

	const { getUpdateData, getAllPythFeeds } = useUpdateData();
	const [updateData, setUpdateData] = React.useState<any[]>([]);

	useEffect(() => {
		const fetchData = () => {
			let _address = address || ADDRESS_ZERO;
			let chainId = defaultChain.id;
			const start = Date.now();
			console.log("Fetching data for", _address, chainId, updateData);
			// if(first) setStatus(Status.FETCHING);
			const uidp = getContract("UIDataProvider", process.env.NEXT_PUBLIC_UIDP_ADDRESS!);
			uidp.callStatic.multicall([
				uidp.interface.encodeFunctionData("updatePythData", [updateData]),
				uidp.interface.encodeFunctionData("getAllData", [_address]),
			])
				.then(async (res: any) => {
					res = uidp.interface.decodeFunctionResult("getAllData", res[1])[0];
					console.log("Data latency", Date.now() - start, "ms");
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
				.catch(async (err: any) => {
					console.log("Error", err);
					setStatus(Status.ERROR);
					setMessage(
						"Failed to fetch data. Please refresh the page and try again later."
					);
				});
		};
		// Fetch data immediately
		fetchData();

		// Then fetch data every 4 seconds
		const intervalId = setTimeout(async () => {
				let _updateData = await getUpdateData(getAllPythFeeds(reserveData, liquidityData));
				setUpdateData(_updateData);
		}, 4000);
	
		// Clean up function
		return () => clearInterval(intervalId);
	}, [address, updateData])

	const value: AppDataValue = {
		account,
		status,
		message,
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