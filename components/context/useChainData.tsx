import dotenv from "dotenv";
import { BigNumber, ethers } from "ethers";
import { baseSepolia } from "viem/chains";
import { isSupportedChain } from "../../src/const";
import { useActiveWalletChain } from "thirdweb/react";
import * as data from "../../deployments/84532/development_pool_0.json";

dotenv.config();

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (eventName: string, callback: (...args: any[]) => void) => void;
      removeListener: (
        eventName: string,
        callback: (...args: any[]) => void
      ) => void;
      chainId: string;
    };
  }
}
export default function useChainData() {
  // const { chain } = useAccount();
  const chain = useActiveWalletChain();
  const getABI = (contractName: string) => {
    const artifact = require(`../../out/${contractName}.sol/${contractName}.json`);
    if (!artifact?.abi) throw new Error("ABI not found: " + contractName);

    return artifact.abi;
  };

  const getContract = (contractName: string, address?: string) => {
    let provider = new ethers.providers.JsonRpcProvider(
      // (chain ?? baseSepolia)?.rpcUrls?.default?.http[0] ?? ""
      chain ? chain.rpc : baseSepolia.rpcUrls.default.http[0]
    );
    if (
      chain &&
      typeof window !== "undefined" &&
      window.ethereum &&
      isSupportedChain(BigNumber.from(window.ethereum.chainId || 0).toNumber())
    ) {
      provider = new ethers.providers.Web3Provider(window.ethereum);
    }
    if (!address) {
      address = (data as any)[contractName];
      if (!address) throw new Error(contractName + " not found");
    }
    const contract = new ethers.Contract(
      address,
      getABI(contractName),
      provider
    );
    return contract;
  };

  const send = (
    contract: ethers.Contract,
    method: string,
    params: any[],
    value = "0"
  ) => {
    if (!window.ethereum) throw new Error("No ethereum provider found");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return contract
      .connect(provider.getSigner())
      [method](...params, { value: value });
  };

  const routerAddress: { [key: number]: string | undefined } = {
    11155111: process.env.NEXT_PUBLIC_ROUTER_ADDRESS_11155111,
    84532: process.env.NEXT_PUBLIC_ROUTER_ADDRESS_84532,
    421614: process.env.NEXT_PUBLIC_ROUTER_ADDRESS_421614,
    338: process.env.NEXT_PUBLIC_ROUTER_ADDRESS_338,
  };

  const uidpAddress: { [key: number]: string | undefined } = {
    11155111: process.env.NEXT_PUBLIC_UIDP_ADDRESS_11155111,
    84532: process.env.NEXT_PUBLIC_UIDP_ADDRESS_84532,
    421614: process.env.NEXT_PUBLIC_UIDP_ADDRESS_421614,
    338: process.env.NEXT_PUBLIC_UIDP_ADDRESS_338,
  };

  const rxRouter = () =>
    getContract("ReaxRouter", routerAddress[chain?.id ?? baseSepolia.id]!);
  const uidp = () =>
    getContract("UIDataProvider", uidpAddress[chain?.id ?? baseSepolia.id]!);

  return {
    getABI,
    getContract,
    send,
    rxRouter,
    uidp,
  };
}
