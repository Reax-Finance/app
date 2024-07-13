import * as React from "react";
import { ADDRESS_ZERO, isSupportedChain } from '../../src/const';
import { useEffect } from 'react';
import { useAccount } from "wagmi";
import { Status } from "../utils/status";
import { Account, ReserveData, LiquidityData, SynthData, UIData } from '../utils/types';
import useUpdateData from "../utils/useUpdateData";
import useChainData from "./useChainData";

export interface AppDataValue {
  status: Status;
  message: string;
  account: Account|undefined,
  reserveData: ReserveData|undefined;
  liquidityData: LiquidityData|undefined;
  synths: SynthData[];
  routerAddress: string|undefined;
  blockNumber: number;
}

const AppDataContext = React.createContext<AppDataValue>({} as AppDataValue);

function AppDataProvider({ children }: any) {
  const [status, setStatus] = React.useState<AppDataValue['status']>(Status.NOT_FETCHING);
  const [message, setMessage] = React.useState<AppDataValue['message']>("");
  
  const [account, setAccount] = React.useState<Account>();
	
  const [reserveData, setReserveData] = React.useState<ReserveData>();
  const [liquidityData, setLiquidityData] = React.useState<LiquidityData>();

  const [synths, setSynths] = React.useState<SynthData[]>([]);

  const [routerAddress, setRouterAddress] = React.useState<any>();
  const [blockNumber, setBlockNumber] = React.useState<number>(0);

  const { address, chain } = useAccount();

  const { getUpdateData, getAllPythFeeds } = useUpdateData();
  const [updateData, setUpdateData] = React.useState<any[]>([]);
  const { getContract, send, uidp: _uidp } = useChainData();

  const [errorCount, setErrorCount] = React.useState<number>(0);

	useEffect(() => {
		if(typeof window === "undefined") return;

		let intervalId: NodeJS.Timeout;

		const fetchData = () => {
			let _address = address || ADDRESS_ZERO;
			const start = Date.now();
			const uidp = _uidp();
			console.log("Fetching data for", _address, chain?.id, updateData);
			// if(first) setStatus(Status.FETCHING);
			uidp.callStatic.multicall([
				uidp.interface.encodeFunctionData("updatePythData", [updateData]),
				uidp.interface.encodeFunctionData("getAllData", [_address, updateData.length > 0]),
			])
			// uidp.callStatic.getAllData(_address, updateData.length > 0)
				.then(async (res: any) => {
					res = uidp.interface.decodeFunctionResult("getAllData", res[1])[0];
					console.log("Data", res);
					setSynths(res.synths);
					setRouterAddress(res.router);
					setBlockNumber(res.blockNumber);
					console.log("Data latency", Date.now() - start, "ms");
					setStatus(Status.SUCCESS);
				})
				.catch(async (err: any) => {
					console.log("Error", err);
					setErrorCount((prev) => prev + 1);
					if(errorCount > 3) {
						setStatus(Status.ERROR);
						setMessage(
							"Failed to fetch data. Please refresh the page and try again later."
						);
					}
				});
		};
		const startInterval = async () => {
			// Fetch data immediately
			fetchData();
	
			// Then fetch data every 2 seconds
			intervalId = setInterval(async () => {
				let _updateData = await getUpdateData(getAllPythFeeds(synths));
				setUpdateData(_updateData);
			}, 5000);
		};
	
		const stopInterval = () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	
		// Function to start or stop the interval when the page visibility changes
		const handleVisibilityChange = () => {
			if (document.hidden) {
				stopInterval();
			} else {
				startInterval();
			}
		};
	
		// Start the interval when the component mounts
		startInterval();
	
		// Listen for visibility change events
		document.addEventListener("visibilitychange", handleVisibilityChange);
	
		// Clean up function
		return () => {
			stopInterval();
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [address, updateData, chain])

  const value: AppDataValue = {
    account,
    status,
    message,
    reserveData,
    liquidityData,
    synths,
    routerAddress,
    blockNumber,
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