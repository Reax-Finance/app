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
	fetchData: (
		_address?: `0x${string}` | undefined
	) => Promise<number>;
	account: Account|undefined,
	reserveData: ReserveData|undefined;
	liquidityData: LiquidityData|undefined;
}

const AppDataContext = React.createContext<AppDataValue>({} as AppDataValue);

function AppDataProvider({ children }: any) {
	const [status, setStatus] = React.useState<AppDataValue['status']>(Status.NOT_FETCHING);
	const [message, setMessage] = React.useState<AppDataValue['message']>("");
	const [account, setAccount] = React.useState<Account>();
	const [timeoutState, setTimeoutState] = React.useState<any>();
	
	const [reserveData, setReserveData] = React.useState<ReserveData>();
	const [liquidityData, setLiquidityData] = React.useState<LiquidityData>();

	const { address, isConnected, isConnecting, isDisconnected } = useAccount();

	const { getUpdateData, getAllPythFeeds } = useUpdateData();

	useEffect(() => {
		fetchData();
	}, [])

	// We want to fetch data every 10 seconds
	// Is called when the address changes from navbar
	const fetchData = (_address = address, first = true, updateData: string[] = []): Promise<number> => {
		let chainId = defaultChain.id;
		const start = Date.now();
		console.log("Fetching data for", _address, chainId);
		return new Promise((resolve, reject) => {
			if(first) setStatus(Status.FETCHING);
			if(!_address) _address = ADDRESS_ZERO;
			const uidp = getContract("UIDataProvider", process.env.NEXT_PUBLIC_UIDP_ADDRESS!);
			// uidp.getAllData(_address)
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

					resolve(Date.now() - start);
					let _updateData = await getUpdateData(getAllPythFeeds(res.reserveData, res.liquidityData));
					// Set a timeout to fetch data again
					if(timeoutState) clearTimeout(timeoutState);
					setTimeoutState(setTimeout(() => fetchData(_address, false, _updateData), 10000));
				})
				.catch(async (err: any) => {
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
		status,
		message,
		fetchData,
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