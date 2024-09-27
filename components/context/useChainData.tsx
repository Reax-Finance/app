import { BigNumber, ethers } from "ethers";
import { useAccount } from "wagmi";
import { ADDRESS_ZERO, isSupportedChain } from "../../src/const";
import dotenv from "dotenv";
import { baseSepolia, sepolia } from "viem/chains";
import * as data from "../../deployments/84532/development_pool_0.json"

dotenv.config();

export default function useChainData() {
  const { chain } = useAccount();

  const getABI = (contractName: string) => {
    const artifact = require(`../../out/${contractName}.sol/${contractName}.json`);
    if (!artifact?.abi) throw new Error("ABI not found: " + contractName);

    return artifact.abi;
  };

  const getContract = (contractName: string, address?: string) => {

    let provider = new ethers.providers.JsonRpcProvider(
      (chain ?? baseSepolia)?.rpcUrls.default.http[0]
    );
    if (
      chain &&
      typeof window !== "undefined" &&
      window?.ethereum &&
      isSupportedChain(
        BigNumber.from(window?.ethereum?.chainId || 0).toNumber()
      )
    ){
      provider = new ethers.providers.Web3Provider(window.ethereum as any);
    }
    if (!address) {
      address = (data as any)[contractName];
      if (!address)
        throw new Error(contractName + " not found");
    }
    console.log("address", address)
    let contract = new ethers.Contract(address, getABI(contractName), provider);
    return contract;
  };

  const send = (
    contract: ethers.Contract,
    method: string,
    params: any[],
    value = "0"
  ) => {
    if (!window.ethereum) throw new Error("No ethereum provider found");
    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    return contract
      .connect(provider.getSigner())
      [method](...params, { value: value });
  };

  return {
    getABI,
    getContract,
    send,
  };
}
