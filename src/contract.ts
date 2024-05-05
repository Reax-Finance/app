import { BigNumber, ethers } from 'ethers';
import { defaultChain } from './const';
import Big from 'big.js';

export function getABI(contractName: string) {
  const artifact = require(`../out/${contractName}.sol/${contractName}.json`);
  if(!artifact?.abi) throw new Error("ABI not found: "+contractName);

  return artifact.abi;
}

export function getContract(contractName: string, address: string) {
  let provider = new ethers.providers.JsonRpcProvider(defaultChain?.rpcUrls.default.http[0]);
  if(window?.ethereum && BigNumber.from(window?.ethereum?.chainId || 0).toNumber() == defaultChain.id) provider = new ethers.providers.Web3Provider(window.ethereum as any);
  let contract = new ethers.Contract(address!, getABI(contractName), provider);
  return contract;
}

export function call(contract: ethers.Contract, method: string, params: any[]) {
  return contract[method](...params);
}

export function send(contract: ethers.Contract, method: string, params: any[], value = '0') {
  if(!window.ethereum) throw new Error("No ethereum provider found");
  const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  return contract.connect(provider.getSigner())[method](...params, {value: value});
}

export function estimateGas(contract: ethers.Contract, method: string, params: any[], value = '0') {
  return contract.estimateGas[method](...params, {value: value});
}