"use client";

import {
  useActiveAccount,
  useActiveWalletChain,
  useActiveWalletConnectionStatus,
  useBlockNumber,
} from "thirdweb/react";

const UserAccount = () => {
  const connectionStatus = useActiveWalletConnectionStatus();
  const isConnected = connectionStatus === "connected" ? true : false;

  const activeAccount = useActiveAccount();
  const address = activeAccount?.address || "";

  const chainData = useActiveWalletChain();
  const chain = chainData;

  const block = useBlockNumber({
    chain: {
      rpc: chain?.name ?? "",
      id: chain?.id ?? 0,
    },
    client: {
      clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
      secretKey: process.env.THIRDWEB_SECRET_KEY!,
    },
  });

  return { isConnected, address, chain, block };
};

export default UserAccount;
