import Big from "big.js";
import * as React from "react";
import { useAccount } from "wagmi";
import { ADDRESS_ZERO } from "../../src/const";
import { useAppData } from "./AppDataProvider";
import { Status, SubStatus } from "../utils/status";

const BalanceContext = React.createContext<BalanceValue>({} as BalanceValue);

interface BalanceValue {
  balances: { [key: string]: Big };
  allowances: any;
  status: Status;
}

function BalanceContextProvider({ children }: any) {
  const [status, setStatus] = React.useState<Status>(Status.NOT_FETCHING);
  const [subscriptionStatus, setSubscriptionStatus] = React.useState<SubStatus>(
    SubStatus.NOT_SUBSCRIBED
  );

  const [balances, setBalances] = React.useState<any>({});
  const [allowances, setAllowances] = React.useState<any>({});

  const { reserveData, liquidityData } = useAppData();
  const { address } = useAccount();

  React.useEffect(() => {
    if (status == Status.NOT_FETCHING && liquidityData && reserveData) {
      initiate();
    }
  }, [reserveData, liquidityData, status]);

  React.useEffect(() => {
    if (address && address != ADDRESS_ZERO) {
      subscribe();
    }
  }, [address]);

  const initiate = async (_address?: string) => {};

  const subscribe = async () => {};

  const value: BalanceValue = {
    balances,
    allowances,
    status,
  };

  return (
    <BalanceContext.Provider value={value}>{children}</BalanceContext.Provider>
  );
}

const useBalanceData = () => {
  const context = React.useContext(BalanceContext);
  if (context === undefined) {
    throw new Error("useBalanceData must be used within a BalanceProvider");
  }
  return context;
};

export { BalanceContextProvider, BalanceContext, useBalanceData };
