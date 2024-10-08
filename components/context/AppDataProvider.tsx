"use client";

// import { ADDRESS_FIRST, ADDRESS_ZERO } from "../../src/const";
// import React, { useContext, useEffect } from "react";
// import { Status } from "../utils/status";
// import { Account, ReserveData, LiquidityData } from "../utils/types";
// import useUpdateData from "../utils/useUpdateData";
// import useChainData from "./useChainData";
// import UserAccount from "../utils/useUserAccount";
// import {
//   useActiveAccount,
//   useActiveWallet,
//   useActiveWalletChain,
// } from "thirdweb/react";

// export interface AppDataValue {
//   status: Status;
//   message: string;
//   account: Account | undefined;
//   reserveData: ReserveData | undefined;
//   liquidityData: LiquidityData | undefined;
// }

// const AppDataContext = React.createContext<AppDataValue>({} as AppDataValue);

// function AppDataProvider({ children }: any) {
//   const activeAccount = useActiveAccount();
//   const address = activeAccount?.address || null;
//   const chainData = useActiveWalletChain();
//   const chain = chainData;
//   const [status, setStatus] = React.useState<AppDataValue["status"]>(
//     Status.NOT_FETCHING
//   );
//   const [message, setMessage] = React.useState<AppDataValue["message"]>("");
//   const [account, setAccount] = React.useState<Account>();

//   const [reserveData, setReserveData] = React.useState<ReserveData>();
//   const [liquidityData, setLiquidityData] = React.useState<LiquidityData>();

//   const { getUpdateData, getAllPythFeeds } = useUpdateData();
//   const [updateData, setUpdateData] = React.useState<any[]>([]);
//   const { getContract } = useChainData();

//   const [errorCount, setErrorCount] = React.useState<number>(0);

//   useEffect(() => {
//     if (typeof window === "undefined") return;

//     let intervalId: NodeJS.Timeout;

//     const fetchData = () => {
//       let _address = address || ADDRESS_FIRST;
//       const start = Date.now();
//       const uidp = getContract("UIDataProvider");
//       console.log("Fetching data for", _address, chain?.id, uidp.provider);
//       // if(first) setStatus(Status.FETCHING);
//       uidp.callStatic
//         .multicall([
//           uidp.interface.encodeFunctionData("updatePythData", [updateData]),
//           uidp.interface.encodeFunctionData("getAllData", [
//             _address,
//             updateData.length > 0,
//           ]),
//         ])
//         .then(async (res: any) => {
//           res = uidp.interface.decodeFunctionResult("getAllData", res[1])[0];
//           console.log("Data latency", Date.now() - start, "ms");
//           setAccount((prev) =>
//             prev && !chain
//               ? prev
//               : {
//                   //TypeError: Cannot read properties of undefined (reading 'toString')
//                   healthFactor: res.healthFactor.toString(),
//                   availableToMintUSD: res.availableToMintUSD.toString(),
//                   userTotalBalanceUSD:
//                     res.reserveData.userTotalBalanceUSD.toString(),
//                   userAdjustedBalanceUSD:
//                     res.reserveData.userAdjustedBalanceUSD.toString(),
//                   userThresholdBalanceUSD:
//                     res.reserveData.userThresholdBalanceUSD.toString(),
//                   userTotalDebtUSD:
//                     res.liquidityData.userTotalDebtUSD.toString(),
//                 }
//           );
//           setReserveData((prev) => (prev && !chain ? prev : res.reserveData));
//           setLiquidityData((prev) =>
//             prev && !chain ? prev : res.liquidityData
//           );
//           setErrorCount(0);

//           setStatus(Status.SUCCESS);
//         })
//         .catch(async (err: any) => {
//           console.log("Error", err);
//           setErrorCount((prev) => prev + 1);
//           if (errorCount > 3) {
//             setStatus(Status.ERROR);
//             setMessage(
//               "Failed to fetch data. Please refresh the page and try again later."
//             );
//           }
//         });
//     };
//     const startInterval = async () => {
//       // Fetch data immediately
//       fetchData();

//       // Then fetch data every 2 seconds
//       intervalId = setInterval(async () => {
//         let _updateData = await getUpdateData(
//           getAllPythFeeds(reserveData, liquidityData)
//         );
//         setUpdateData(_updateData);
//       }, 10000);
//     };

//     const stopInterval = () => {
//       if (intervalId) {
//         clearInterval(intervalId);
//       }
//     };

//     // Function to start or stop the interval when the page visibility changes
//     const handleVisibilityChange = () => {
//       if (document.hidden) {
//         stopInterval();
//       } else {
//         startInterval();
//       }
//     };

//     // Start the interval when the component mounts
//     startInterval();

//     // Listen for visibility change events
//     document.addEventListener("visibilitychange", handleVisibilityChange);

//     // Clean up function
//     return () => {
//       stopInterval();
//       document.removeEventListener("visibilitychange", handleVisibilityChange);
//     };
//   }, [address, updateData, chain]);

//   const value: AppDataValue = {
//     account,
//     status,
//     message,
//     reserveData,
//     liquidityData,
//   };

//   return (
//     <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
//   );
// }

// export const useAppData = () => {
//   return useContext(AppDataContext);
// };

// export { AppDataProvider, AppDataContext };

import * as React from "react";
import { useEffect } from "react";
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import { ADDRESS_FIRST, ADDRESS_ZERO } from "../../src/const";
import { Status } from "../utils/status";
import {
  Account,
  LiquidityData,
  PairData,
  ReserveData,
  SynthData,
} from "../utils/types";
import useUpdateData from "../utils/useUpdateData";
import useChainData from "./useChainData";

export interface AppDataValue {
  status: Status;
  message: string;
  account: Account | undefined;
  reserveData: ReserveData | undefined;
  liquidityData: LiquidityData | undefined;
  synths: SynthData[];
  routerAddress: string | undefined;
  blockNumber: number;
  pairs: PairData[];
}

const AppDataContext = React.createContext<AppDataValue>({} as AppDataValue);

function AppDataProvider({ children }: any) {
  const [status, setStatus] = React.useState<AppDataValue["status"]>(
    Status.NOT_FETCHING
  );
  const [message, setMessage] = React.useState<AppDataValue["message"]>("");

  const [account, setAccount] = React.useState<Account>();

  const [reserveData, setReserveData] = React.useState<ReserveData>();
  const [liquidityData, setLiquidityData] = React.useState<LiquidityData>();

  const [synths, setSynths] = React.useState<SynthData[]>([]);

  const [routerAddress, setRouterAddress] = React.useState<any>();
  const [blockNumber, setBlockNumber] = React.useState<number>(0);

  const activeAccount = useActiveAccount();
  const address = activeAccount?.address || null;
  const chainData = useActiveWalletChain();
  const chain = chainData;

  const { getUpdateData, getAllPythFeeds } = useUpdateData();
  const [updateData, setUpdateData] = React.useState<any[]>([]);
  const { getContract } = useChainData();

  const [pairs, setPairs] = React.useState<PairData[]>([]);

  const [errorCount, setErrorCount] = React.useState<number>(0);

  const findCorrelatedPairs = (_synths: SynthData[]) => {
    const synthsWithMarkets = synths.filter((synth) => synth.market.exists);
    const newPairs: PairData[] = [];

    for (let i = 0; i < synthsWithMarkets.length; i++) {
      for (let j = i + 1; j < synthsWithMarkets.length; j++) {
        const synth1 = synthsWithMarkets[i];
        const synth2 = synthsWithMarkets[j];

        const synth1AcceptsSynth2 = synth1.market.vaults.some(
          (vault) => vault.asset.id === synth2.synth.id
        );
        const synth2AcceptsSynth1 = synth2.market.vaults.some(
          (vault) => vault.asset.id === synth1.synth.id
        );

        if (synth1AcceptsSynth2 && synth2AcceptsSynth1) {
          newPairs.push({
            id: `${synth1.synth.symbol}-${synth2.synth.symbol}`,
            synth1,
            synth2,
          });
        }
      }
    }

    setPairs(newPairs);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    let intervalId: NodeJS.Timeout;

    const fetchData = () => {
      let _address = address || ADDRESS_FIRST;
      const start = Date.now();
      const uidp = getContract("UIDataProvider");
      // console.log("Fetching data for", _address, chain?.id, updateData);
      // if(first) setStatus(Status.FETCHING);
      uidp.callStatic
        .multicall([
          uidp.interface.encodeFunctionData("updatePythData", [updateData]),
          uidp.interface.encodeFunctionData("getAllData", [
            _address,
            updateData.length > 0,
          ]),
        ])
        .then(async (res: any) => {
          res = uidp.interface.decodeFunctionResult("getAllData", res[1])[0];
          setSynths(res.synths);
          setRouterAddress(res.router);
          setBlockNumber(res.blockNumber);
          findCorrelatedPairs(res.synths);
          console.log("Data latency", Date.now() - start, "ms");
          setStatus(Status.SUCCESS);
        })
        .catch(async (err: any) => {
          console.log("Error", err);
          setErrorCount((prev) => prev + 1);
          if (errorCount > 3) {
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
        let _updateData = await getUpdateData(getAllPythFeeds(reserveData));
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
  }, [address, updateData, chain]);

  const value: AppDataValue = {
    account,
    status,
    message,
    reserveData,
    liquidityData,
    synths,
    routerAddress,
    blockNumber,
    pairs,
  };

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export const useAppData = () => {
  return React.useContext(AppDataContext);
};

export { AppDataContext, AppDataProvider };
