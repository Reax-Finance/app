import { ethers } from "ethers";
import { RPC } from "../../utils/constant";

export function provider(chainId: string): ethers.providers.JsonRpcProvider {
  const rpc = RPC[chainId];
  return new ethers.providers.JsonRpcProvider(rpc);
}
